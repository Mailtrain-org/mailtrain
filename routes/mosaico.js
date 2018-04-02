'use strict';

const config = require('config');
const router = require('../lib/router-async').create();
const passport = require('../lib/passport');
const clientHelpers = require('../lib/client-helpers');
const gm = require('gm').subClass({
    imageMagick: true
});
const users = require('../models/users');

const bluebird = require('bluebird');
const fsReadFile = bluebird.promisify(require('fs').readFile);

const path = require('path');

const files = require('../models/files');
const fileHelpers = require('../lib/file-helpers');


users.registerRestrictedAccessTokenMethod('mosaico', ({entityTypeId, entityId}) => {
    if (entityTypeId === 'template' || entityTypeId === 'campaign') {
        return {
            permissions: {
                [entityTypeId]: {
                    [entityId]: new Set(['manageFiles', 'view'])
                }
            }
        };
    }
});



// FIXME - add authentication by sandboxToken

async function placeholderImage(width, height) {
    const magick = gm(width, height, '#707070');
    const streamAsync = bluebird.promisify(magick.stream.bind(magick));

    const size = 40;
    let x = 0;
    let y = 0;

    // stripes
    while (y < height) {
        magick
            .fill('#808080')
            .drawPolygon([x, y], [x + size, y], [x + size * 2, y + size], [x + size * 2, y + size * 2])
            .drawPolygon([x, y + size], [x + size, y + size * 2], [x, y + size * 2]);
        x = x + size * 2;
        if (x > width) {
            x = 0;
            y = y + size * 2;
        }
    }

    // text
    magick
        .fill('#B0B0B0')
        .fontSize(20)
        .drawText(0, 0, width + ' x ' + height, 'center');

    const stream = await streamAsync('png');

    return {
        format: 'png',
        stream
    };
}

async function resizedImage(src, method, width, height) {
    const filePath = path.join(__dirname, '..', src);

    const magick = gm(filePath);
    const streamAsync = bluebird.promisify(magick.stream.bind(magick));
    const formatAsync = bluebird.promisify(magick.format.bind(magick));

    const format = (await formatAsync()).toLowerCase();

    if (method === 'resize') {
        magick
            .autoOrient()
            .resize(width, height);
    } else if (method === 'cover') {
        magick
            .autoOrient()
            .resize(width, height + '^')
            .gravity('Center')
            .extent(width, height + '>');
    } else {
        throw new Error(`Method ${method} not supported`);
    }

    const stream = await streamAsync();

    return {
        format,
        stream
    };
}

function sanitizeSize(val, min, max, defaultVal, allowNull) {
    if (val === 'null' && allowNull) {
        return null;
    }
    val = Number(val) || defaultVal;
    val = Math.max(min, val);
    val = Math.min(max, val);
    return val;
}

router.getAsync('/img/:type/:fileId', passport.loggedIn, async (req, res) => {
    const method = req.query.method;
    const params = req.query.params;
    let [width, height] = params.split(',');
    let image;

    if (method === 'placeholder') {
        width = sanitizeSize(width, 1, 2048, 600, false);
        height = sanitizeSize(height, 1, 2048, 300, false);
        image = await placeholderImage(width, height);
    } else {
        width = sanitizeSize(width, 1, 2048, 600, false);
        height = sanitizeSize(height, 1, 2048, 300, true);
        // TODO - validate that one has the rights to read this ???
        image = await resizedImage(req.query.src, method, width, height);
    }

    res.set('Content-Type', 'image/' + image.format);
    image.stream.pipe(res);
});


fileHelpers.installUploadHandler(router, '/upload/:type/:entityId', true);

router.getAsync('/upload/:type/:fileId', passport.loggedIn, async (req, res) => {
    const entries = await files.list(req.context, req.params.type, req.params.fileId);

    const filesOut = [];
    for (const entry of entries) {
        filesOut.push({
            name: entry.originalname,
            url: `/files/${req.params.type}/${req.params.fileId}/${entry.filename}`,
            size: entry.size,
            thumbnailUrl: `/files/${req.params.type}/${req.params.fileId}/${entry.filename}` // TODO - use smaller thumbnails
        })
    }

    res.json({
        files: filesOut
    });
});


router.getAsync('/editor', passport.csrfProtection, async (req, res) => {
    const resourceType = req.query.type;
    const resourceId = req.query.id;

    const mailtrainConfig = await clientHelpers.getAnonymousConfig(req.context);

    let languageStrings = null;
    if (config.language && config.language !== 'en') {
        const lang = config.language.split('_')[0];
        try {
            const file = path.join(__dirname, '..', 'client', 'public', 'mosaico', 'lang', 'mosaico-' + lang + '.json');
            languageStrings = await fsReadFile(file, 'utf8');
        } catch (err) {
        }
    }

    res.render('mosaico/root', {
        layout: 'mosaico/layout',
        editorConfig: config.mosaico,
        languageStrings: languageStrings,
        reactCsrfToken: req.csrfToken(),
        mailtrainConfig: JSON.stringify(mailtrainConfig)
    });
});


module.exports = router;
