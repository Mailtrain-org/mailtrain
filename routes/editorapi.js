'use strict';

const log = require('npmlog');
const config = require('config');
const express = require('express');
const router = new express.Router();
const passport = require('../lib/passport');
const os = require('os');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const crypto = require('crypto');
const events = require('events');
const httpMocks = require('node-mocks-http');
const multiparty = require('multiparty');
const escapeStringRegexp = require('escape-string-regexp');
const jqueryFileUpload = require('jquery-file-upload-middleware');
const gm = require('gm').subClass({
    imageMagick: true
});
const url = require('url');
const htmlToText = require('html-to-text');
const premailerApi = require('premailer-api');
const _ = require('../lib/translate')._;
const mailer = require('../lib/mailer');
const settings = require('../lib/models/settings');
const templates = require('../lib/models/templates');
const campaigns = require('../lib/models/campaigns');

router.all('/*', (req, res, next) => {
    if (!req.user) {
        return res.status(403).send(_('Need to be logged in to access restricted content'));
    }
    if (req.originalUrl.startsWith('/editorapi/img?')) {
        return next();
    }
    if (!config.editors.map(e => e[0]).includes(req.query.editor)) {
        return res.status(500).send(_('Invalid editor name'));
    }
    next();
});

jqueryFileUpload.on('begin', fileInfo => {
    fileInfo.name = fileInfo.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9+-.]+/g, '');
});

const listImages = (dir, dirURL, callback) => {
    fs.readdir(dir, (err, files = []) => {
        if (err && err.code !== 'ENOENT') {
            return callback(err.message || err);
        }
        files = files.filter(name => /\.(jpe?g|png|gif)$/i.test(name));
        files = files.map(name => ({
            // mosaico
            name,
            url: dirURL + '/' + name,
            thumbnailUrl: dirURL + '/thumbnail/' + name,
            // grapejs
            src: dirURL + '/' + name
        }));
        callback(null, files);
    });
};

const placeholderImage = (width, height, callback) => {
    const magick = gm(width, height, '#707070');
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

    magick.stream('png', (err, stream) => {
        if (err) {
            return callback(err);
        }

        const image = {
            format: 'PNG',
            stream
        };

        callback(null, image);
    });
};

const resizedImage = (src, method, width, height, callback) => {
    const pathname = path.join('/', url.parse(src).pathname);
    const filePath = path.join(__dirname, '..', 'public', pathname);
    const magick = gm(filePath);

    magick.format((err, format) => {
        if (err) {
            return callback(err);
        }

        const streamHandler = (err, stream) => {
            if (err) {
                return callback(err);
            }

            const image = {
                format,
                stream
            };

            callback(null, image);
        };

        switch (method) {
            case 'resize':
                return magick
                    .autoOrient()
                    .resize(width, height)
                    .stream(streamHandler);

            case 'cover':
                return magick
                    .autoOrient()
                    .resize(width, height + '^')
                    .gravity('Center')
                    .extent(width, height + '>')
                    .stream(streamHandler);

            default:
                return callback(new Error(_('Method not supported')));
        }
    });
};

const getProcessedImage = (dynamicUrl, callback) => {
    if (!dynamicUrl.includes('/editorapi/img?')) {
        return callback(new Error('Invalid dynamicUrl'));
    }

    const {
        src,
        method,
        params = '600,null'
    } = url.parse(dynamicUrl, true).query;

    let width = params.split(',')[0];
    let height = params.split(',')[1];

    const sanitizeSize = (val, min, max, defaultVal, allowNull) => {
        if (val === 'null' && allowNull) {
            return null;
        }
        val = Number(val) || defaultVal;
        val = Math.max(min, val);
        val = Math.min(max, val);
        return val;
    };

    if (method === 'placeholder') {
        width = sanitizeSize(width, 1, 2048, 600, false);
        height = sanitizeSize(height, 1, 2048, 300, false);
        placeholderImage(width, height, callback);
    } else {
        width = sanitizeSize(width, 1, 2048, 600, false);
        height = sanitizeSize(height, 1, 2048, 300, true);
        resizedImage(src, method, width, height, callback);
    }
};

const getStaticImageUrl = (dynamicUrl, staticDir, staticDirUrl, callback) => {
    if (!dynamicUrl.includes('/editorapi/img?')) {
        return callback(null, dynamicUrl);
    }

    mkdirp(staticDir, err => {
        if (err) {
            return callback(err);
        }

        fs.readdir(staticDir, (err, files) => {
            if (err) {
                return callback(err);
            }

            const hash = crypto.createHash('md5').update(dynamicUrl).digest('hex');
            const match = files.find(el => el.startsWith(hash));

            if (match) {
                return callback(null, staticDirUrl + '/' + match);
            }

            getProcessedImage(dynamicUrl, (err, image) => {
                if (err) {
                    return callback(err);
                }

                const fileName = hash + '.' + image.format.toLowerCase();
                const filePath = path.join(staticDir, fileName);
                const fileUrl = staticDirUrl + '/' + fileName;

                const writeStream = fs.createWriteStream(filePath);
                writeStream.on('error', err => callback(err));
                writeStream.on('finish', () => callback(null, fileUrl));
                image.stream.pipe(writeStream);
            });
        });
    });
};

const prepareHtml = (html, editorName, callback) => {
    settings.get('serviceUrl', (err, serviceUrl) => {
        if (err) {
            return callback(err.message || err);
        }

        const srcs = new Map();
        const re = /<img[^>]+src="([^"]*\/editorapi\/img\?[^"]+)"/ig;
        let jobs = 0;
        let result;

        while ((result = re.exec(html)) !== null) {
            srcs.set(result[1], result[1]);
        }

        const done = () => {
            if (jobs === 0) {
                for (const [key, value] of srcs) {
                    // console.log(`replace dynamicUrl: ${key} - with staticUrl: ${value}`);
                    html = html.replace(new RegExp(escapeStringRegexp(key), 'g'), value);
                }
                return callback(null, html);
            }
        };

        const staticDir = path.join(__dirname, '..', 'public', editorName, 'uploads', 'static');
        const staticDirUrl = url.resolve(serviceUrl, editorName + '/uploads/static');

        for (const key of srcs.keys()) {
            jobs++;
            const dynamicUrl = key.replace(/&amp;/g, '&');

            getStaticImageUrl(dynamicUrl, staticDir, staticDirUrl, (err, staticUrl) => {
                if (err) {
                    // TODO: Send a warning back to the editor. For now we just skip image resizing.
                    log.error('editorapi', err);

                    if (dynamicUrl.includes('/editorapi/img?')) {
                        staticUrl = url.parse(dynamicUrl, true).query.src || dynamicUrl;
                    } else {
                        staticUrl = dynamicUrl;
                    }

                    if (!/^https?:\/\/|^\/\//i.test(staticUrl)) {
                        staticUrl = url.resolve(serviceUrl, staticUrl);
                    }
                }

                srcs.set(key, staticUrl);
                jobs--;
                done();
            });
        }

        done();
    });
};

// URL structure defined by Mosaico
// /editorapi/img?src=" + encodeURIComponent(src) + "&method=" + encodeURIComponent(method) + "&params=" + encodeURIComponent(width + "," + height);
router.get('/img', (req, res) => {
    getProcessedImage(req.originalUrl, (err, image) => {
        if (err) {
            res.status(err.status || 500);
            res.send(err.message || err);
            return;
        }

        res.set('Content-Type', 'image/' + image.format.toLowerCase());
        image.stream.pipe(res);
    });
});

router.post('/update', passport.parseForm, passport.csrfProtection, (req, res) => {
    const sendResponse = err => {
        if (err) {
            return res.status(500).send(err.message || err);
        }
        res.send('ok');
    };

    prepareHtml(req.body.html, req.query.editor, (err, html) => {
        if (err) {
            return sendResponse(err);
        }

        req.body.html = html;

        switch (req.query.type) {
            case 'template':
                return templates.update(req.body.id, req.body, sendResponse);
            case 'campaign':
                return campaigns.update(req.body.id, req.body, sendResponse);
            default:
                return sendResponse(new Error(_('Invalid resource type')));
        }
    });
});

// https://github.com/artf/grapesjs/wiki/API-Asset-Manager
// https://github.com/aguidrevitch/jquery-file-upload-middleware

router.get('/upload', passport.csrfProtection, (req, res) => {
    settings.get('serviceUrl', (err, serviceUrl) => {
        if (err) {
            return res.status(500).send(err.message || err);
        }

        const baseDir = path.join(__dirname, '..', 'public', req.query.editor, 'uploads');
        const baseDirUrl = serviceUrl + req.query.editor + '/uploads';

        listImages(path.join(baseDir, '0'), baseDirUrl + '/0', (err, sharedImages) => {
            if (err) {
                return res.status(500).send(err.message || err);
            }

            if (req.query.type === 'campaign' && Number(req.query.id) > 0) {
                listImages(path.join(baseDir, req.query.id), baseDirUrl + '/' + req.query.id, (err, campaignImages) => {
                    if (err) {
                        return res.status(500).send(err.message || err);
                    }
                    res.json({
                        files: sharedImages.concat(campaignImages)
                    });
                });
            } else {
                res.json({
                    files: sharedImages
                });
            }
        });
    });
});

router.post('/upload', passport.csrfProtection, (req, res) => {
    settings.get('serviceUrl', (err, serviceUrl) => {
        if (err) {
            return res.status(500).send(err.message || err);
        }

        const getDirName = () => {
            switch (req.query.type) {
                case 'template':
                    return '0';
                case 'campaign':
                    return Number(req.query.id) > 0 ? req.query.id : false;
                default:
                    return false;
            }
        };

        const dirName = getDirName();
        const serviceUrlParts = url.parse(serviceUrl);

        if (dirName === false) {
            return res.status(500).send(_('Invalid resource type or ID'));
        }

        const opts = {
            tmpDir: config.www.tmpdir || os.tmpdir(),
            imageVersions: req.query.editor === 'mosaico' ? {
                thumbnail: {
                    width: 90,
                    height: 90
                }
            } : {},
            uploadDir: path.join(__dirname, '..', 'public', req.query.editor, 'uploads', dirName),
            uploadUrl: '/' + req.query.editor + '/uploads/' + dirName, // must be root relative
            acceptFileTypes: /\.(gif|jpe?g|png)$/i,
            hostname: serviceUrlParts.host, // include port
            ssl: serviceUrlParts.protocol === 'https:'
        };

        const mockres = httpMocks.createResponse({
            eventEmitter: events.EventEmitter
        });

        mockres.on('error', err => {
            res.status(500).json({
                error: err.message || err,
                data: []
            });
        });

        mockres.on('end', () => {
            const data = [];
            try {
                JSON.parse(mockres._getData()).files.forEach(file => {
                    data.push({
                        src: file.url
                    });
                });
                res.json({
                    data
                });
            } catch(err) {
                res.status(500).json({
                    error: err.message || err,
                    data
                });
            }
        });

        jqueryFileUpload.fileHandler(opts)(req, req.query.editor === 'grapejs' ? mockres : res);
    });
});

router.post('/download', passport.csrfProtection, (req, res) => {
    prepareHtml(req.body.html, req.query.editor, (err, html) => {
        if (err) {
            return res.status(500).send(err.message || err);
        }
        res.setHeader('Content-disposition', 'attachment; filename=' + req.body.filename);
        res.setHeader('Content-type', 'text/html');
        res.send(html);
    });
});

const parseGrapejsMultipartTestForm = (req, res, next) => {
    if (req.query.editor === 'grapejs') {
        new multiparty.Form().parse(req, (err, fields) => {
            if (err) {
                return next(err);
            }
            req.body.email = fields.email[0];
            req.body.subject = fields.subject[0];
            req.body.html = fields.html[0];
            req.body._csrf = fields._csrf[0];
            next();
        });
    } else {
        next();
    }
};

router.post('/test', parseGrapejsMultipartTestForm, passport.csrfProtection, (req, res) => {
    const sendError = err => {
        if (req.query.editor === 'grapejs') {
            res.status(500).json({
                errors: err.message || err
            });
        } else {
            res.status(500).send(err.message || err);
        }
    };

    prepareHtml(req.body.html, req.query.editor, (err, html) => {
        if (err) {
            return sendError(err);
        }

        settings.list(['defaultAddress', 'defaultFrom'], (err, configItems) => {
            if (err) {
                return sendError(err);
            }

            mailer.getMailer((err, transport) => {
                if (err) {
                    return sendError(err);
                }

                const opts = {
                    from: {
                        name: configItems.defaultFrom,
                        address: configItems.defaultAddress
                    },
                    to: req.body.email,
                    subject: req.body.subject,
                    text: htmlToText.fromString(html, {
                        wordwrap: 100
                    }),
                    html
                };

                transport.sendMail(opts, err => {
                    if (err) {
                        return sendError(err);
                    }

                    if (req.query.editor === 'grapejs') {
                        res.json({
                            data: 'ok'
                        });
                    } else {
                        res.send('ok');
                    }
                });
            });
        });
    });
});

router.post('/html-to-text', passport.parseForm, passport.csrfProtection, (req, res) => {
    premailerApi.prepare({
        html: req.body.html,
        fetchHTML: false
    }, (err, email) => {
        if (err) {
            return res.status(500).send(err.message || err);
        }
        res.send(email.text.replace(/%5B/g, '[').replace(/%5D/g, ']'));
    });
});

module.exports = router;
