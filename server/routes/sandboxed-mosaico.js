'use strict';

const config = require('../lib/config');
const path = require('path');
const express = require('express');
const routerFactory = require('../lib/router-async');
const passport = require('../lib/passport');
const clientHelpers = require('../lib/client-helpers');
const gm = require('gm').subClass({
    imageMagick: true
});
const users = require('../models/users');
const capitalize = require('capitalize');

const fs = require('fs-extra')

const files = require('../models/files');
const fileHelpers = require('../lib/file-helpers');

const templates = require('../models/templates');
const mosaicoTemplates = require('../models/mosaico-templates');

const contextHelpers = require('../lib/context-helpers');
const interoperableErrors = require('../../shared/interoperable-errors');

const bluebird = require('bluebird');

const { getTrustedUrl, getSandboxUrl, getPublicUrl } = require('../lib/urls');
const { base } = require('../../shared/templates');
const { AppType } = require('../../shared/app');

const {castToInteger} = require('../lib/helpers');

const { fileCache } = require('../lib/file-cache');


users.registerRestrictedAccessTokenMethod('mosaico', async ({entityTypeId, entityId}) => {
    if (entityTypeId === 'template') {
        const tmpl = await templates.getById(contextHelpers.getAdminContext(), entityId, false);

        if (tmpl.type === 'mosaico') {
            return {
                permissions: {
                    'template': {
                        [entityId]: new Set(['viewFiles', 'manageFiles', 'view'])
                    },
                    'mosaicoTemplate': {
                        [tmpl.data.mosaicoTemplate]: new Set(['view'])
                    }
                }
            };
        }
    }
});


async function placeholderImage(width, height, labelText, labelColor) {
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

    labelText = labelText || `${width} x ${height}`;
    labelColor = labelColor || '#B0B0B0';

    // text
    magick
        .fill(labelColor)
        .fontSize(20)
        .drawText(0, 0, labelText, 'center');

    const stream = await streamAsync('png');

    return {
        format: 'png',
        stream
    };
}

async function resizedImage(filePath, method, width, height) {
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



async function getRouter(appType) {
    const router = routerFactory.create();
    
    if (appType === AppType.SANDBOXED) {
        router.getAsync('/templates/:mosaicoTemplateId/index.html', passport.loggedIn, async (req, res) => {
            const tmpl = await mosaicoTemplates.getById(req.context, castToInteger(req.params.mosaicoTemplateId));

            res.set('Content-Type', 'text/html');
            res.send(base(tmpl.data.html, tmpl.tag_language, getTrustedUrl(), getSandboxUrl('', req.context), getPublicUrl()));
        });

        // Mosaico looks for block thumbnails in edres folder relative to index.html of the template. We respond to such requests here.
        router.getAsync('/templates/:mosaicoTemplateId/edres/:fileName', async (req, res, next) => {
            try {
                const file = await files.getFileByOriginalName(contextHelpers.getAdminContext(), 'mosaicoTemplate', 'block', castToInteger(req.params.mosaicoTemplateId), req.params.fileName);
                res.type(file.mimetype);
                return res.download(file.path, file.name);
            } catch (err) {
                if (err instanceof interoperableErrors.NotFoundError) {
                    next();
                } else {
                    throw err;
                }
            }
        });

        // This is a fallback to versafix-1 if the block thumbnail is not defined by the template
        router.use('/templates/:mosaicoTemplateId/edres', express.static(path.join(__dirname, '..', '..', 'client', 'static', 'mosaico', 'templates', 'versafix-1', 'edres')));

        // This is the final fallback for a block thumbnail, so that at least something gets returned
        router.getAsync('/templates/:mosaicoTemplateId/edres/:fileName', await fileCache('mosaico-block-thumbnails', config.mosaico.fileCache.blockThumbnails, req => req.params.fileName), async (req, res) => {
            let labelText = req.params.fileName.replace(/\.png$/, '');
            labelText = labelText.replace(/[_]/g, ' ');
            labelText = capitalize.words(labelText);

            const image = await placeholderImage(340, 100, labelText, '#ffffff');
            res.set('Content-Type', 'image/' + image.format);
            image.stream.pipe(res.fileCacheResponse);
        });

        fileHelpers.installUploadHandler(router, '/upload/:type/:entityId', files.ReplacementBehavior.RENAME, null, 'file', resp => {
            return {
                files: resp.files.map(f => ({name: f.name, url: f.url, size: f.size, thumbnailUrl: f.thumbnailUrl}))
            };
        });

        router.getAsync('/upload/:type/:entityId', passport.loggedIn, async (req, res) => {
            const id = castToInteger(req.params.entityId);

            const entries = await files.list(req.context, req.params.type, 'file', id);

            const filesOut = [];
            for (const entry of entries) {
                filesOut.push({
                    name: entry.originalname,
                    url: files.getFileUrl(req.context, req.params.type, 'file', id, entry.filename),
                    size: entry.size,
                    thumbnailUrl: files.getFileUrl(req.context, req.params.type, 'file', id, entry.filename) // TODO - use smaller thumbnails
                })
            }

            res.json({
                files: filesOut
            });
        });

        router.getAsync('/editor', passport.csrfProtection, async (req, res) => {
            const mailtrainConfig = await clientHelpers.getAnonymousConfig(req.context, appType);

            let languageStrings = null;
            const lang = req.locale.language;
            if (lang && lang !== 'en') {
                try {
                    const file = path.join(__dirname, '..', '..', 'client', 'static', 'mosaico', 'rs', 'lang', 'mosaico-' + lang + '.json');
                    languageStrings = await fs.readFile(file, 'utf8');
                } catch (err) {
                }
            }

            res.render('mosaico/root', {
                layout: 'mosaico/layout',
                editorConfig: config.mosaico,
                languageStrings: languageStrings,
                reactCsrfToken: req.csrfToken(),
                mailtrainConfig: JSON.stringify(mailtrainConfig),
                scriptFiles: [
                    getSandboxUrl('client/mosaico-root.js')
                ],
                publicPath: getSandboxUrl()
            });
        });

    } else if (appType === AppType.TRUSTED || appType === AppType.PUBLIC) { // Mosaico editor loads the images from TRUSTED endpoint. This is hard to change because the index.html has to come from TRUSTED.
                                                                            // So we serve /mosaico/img under both endpoints. There is no harm in it.

        const trustedUrlPrefix = getTrustedUrl();
        const publicUrlPrefix = getPublicUrl();
        const imgCacheFileName = req => {
            const method = req.query.method || '';
            const params = req.query.params || '';
            const src = req.query.src || '';

            if (method === 'placeholder') {
                return `${method}_${params}`;
            } else if (src.startsWith(trustedUrlPrefix)) {
                return `${src.substring(trustedUrlPrefix.length)}_${method}_${params}`;
            } else if (src.startsWith(publicUrlPrefix)) {
                return `${src.substring(publicUrlPrefix.length)}_${method}_${params}`;
            } else {
                return null;
            }
        };


        router.getAsync('/img', await fileCache('mosaico-images', config.mosaico.fileCache.images, imgCacheFileName), async (req, res) => {
            const method = req.query.method;
            const params = req.query.params;
            let [width, height] = params.split(',');
            let image;


            if (method === 'placeholder') {
                width = sanitizeSize(width, 1, 2048, 600, false);
                height = sanitizeSize(height, 1, 2048, 300, false);
                try {
                    image = await placeholderImage(width, height);
                } catch (err) {
                    console.log(err);
                }

            } else {
                width = sanitizeSize(width, 1, 2048, 600, true);
                height = sanitizeSize(height, 1, 2048, 300, true);

                let filePath;
                const url = req.query.src || '';

                const mosaicoLegacyUrlPrefix = getTrustedUrl(`mosaico/uploads/`);
                if (url.startsWith(mosaicoLegacyUrlPrefix)) {
                    filePath = path.join(__dirname, '..', '..', 'client', 'static' , 'mosaico', 'uploads', url.substring(mosaicoLegacyUrlPrefix.length));
                } else {
                    const file = await files.getFileByUrl(contextHelpers.getAdminContext(), url);
                    filePath = file.path;
                }

                image = await resizedImage(filePath, method, width, height);
            }

            res.set('Content-Type', 'image/' + image.format);
            image.stream.pipe(res.fileCacheResponse);
        });
    }

    return router;
}

module.exports.getRouter = getRouter;
