'use strict';

let config = require('config');
let express = require('express');
let router = new express.Router();
let passport = require('../lib/passport');
let os = require('os');
let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
let cache = require('memory-cache');
let crypto = require('crypto');
let fetch = require('node-fetch');
let events = require('events');
let httpMocks = require('node-mocks-http');
let multiparty = require('multiparty');
let fileType = require('file-type');
let escapeStringRegexp = require('escape-string-regexp');
let jqueryFileUpload = require('jquery-file-upload-middleware');
let gm = require('gm').subClass({
    imageMagick: true
});
let url = require('url');
let htmlToText = require('html-to-text');
let premailerApi = require('premailer-api');
let editorHelpers = require('../lib/editor-helpers');
let _ = require('../lib/translate')._;
let mailer = require('../lib/mailer');
let settings = require('../lib/models/settings');
let templates = require('../lib/models/templates');
let campaigns = require('../lib/models/campaigns');

router.all('/*', (req, res, next) => {
    if (!req.user && !cache.get(req.get('If-Match'))) {
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
        .replace(/[^a-z0-9+-\.]+/g, '');
});

let listImages = (dir, dirURL, callback) => {
    fs.readdir(dir, (err, files = []) => {
        if (err && err.code !== 'ENOENT') {
            return callback(err.message || err);
        }
        files = files.filter(name => /\.(jpe?g|png|gif)$/i.test(name));
        files = files.map(name => {
            return {
                // mosaico
                name,
                url: dirURL + '/' + name,
                thumbnailUrl: dirURL + '/thumbnail/' + name,
                // grapejs
                src: dirURL + '/' + name,
            };
        });
        callback(null, files);
    });
};

let getStaticImageUrl = ({
    dynamicUrl,
    staticDir,
    staticDirUrl
}, callback) => {
    mkdirp(staticDir, err => {
        if (err) {
            return callback(dynamicUrl);
        }

        fs.readdir(staticDir, (err, files) => {
            if (err) {
                return callback(dynamicUrl);
            }

            let hash = crypto.createHash('md5').update(dynamicUrl).digest('hex');
            let match = files.find(el => el.startsWith(hash));
            let headers = {};

            if (match) {
                return callback(staticDirUrl + '/' + match);
            }

            if (dynamicUrl.includes('/editorapi/img?')) {
                let token = crypto.randomBytes(16).toString('hex');
                cache.put(token, true, 1000);
                headers['If-Match'] = token;
            }

            fetch(dynamicUrl, {
                    headers
                })
                .then(res => {
                    return res.buffer();
                })
                .then(buffer => {
                    let ft = fileType(buffer);
                    if (!ft) {
                        return callback(dynamicUrl);
                    }
                    if (['image/jpeg', 'image/png', 'image/gif'].includes(ft.mime)) {
                        fs.writeFile(path.join(staticDir, hash + '.' + ft.ext), buffer, err => {
                            if (err) {
                                return callback(dynamicUrl);
                            }
                            let staticUrl = staticDirUrl + '/' + hash + '.' + ft.ext;
                            callback(staticUrl);
                        });
                    } else {
                        callback(dynamicUrl);
                    }
                });
        });
    });
};

let prepareHtml = ({
    editorName,
    html
}, callback) => {
    settings.get('serviceUrl', (err, serviceUrl) => {
        if (err) {
            return callback(err.message || err);
        }

        let jobs = 0;
        let srcs = {};
        let re = /<img[^>]+src="([^"]+)"/g;
        let result;
        while ((result = re.exec(html)) !== null) {
            srcs[result[1]] = result[1];
        }

        let done = () => {
            if (jobs === 0) {
                Object.keys(srcs).forEach(src => {
                    // console.log(`replace dynamic - ${src} - with static - ${srcs[src]}`);
                    html = html.replace(new RegExp(escapeStringRegexp(src), 'g'), srcs[src]);
                });
                callback(null, html);
            }
        };

        Object.keys(srcs).forEach(src => {
            jobs++;
            let dynamicUrl = src.replace(/&amp;/g, '&');
            dynamicUrl = /^https?:\/\/|^\/\//i.test(dynamicUrl) ? dynamicUrl : url.resolve(serviceUrl, dynamicUrl);
            getStaticImageUrl({
                dynamicUrl,
                staticDir: path.join(__dirname, '..', 'public', editorName, 'uploads', 'static'),
                staticDirUrl: url.resolve(serviceUrl, editorName + '/uploads/static'),
            }, staticUrl => {
                srcs[src] = staticUrl;
                jobs--;
                done();
            });
        });

        done();
    });
};

let placeholderImage = (req, res, {
    width,
    height
}) => {
    let magick = gm(width, height, '#707070');
    let x = 0;
    let y = 0;
    let size = 40;
    // stripes
    while (y < height) {
        magick = magick
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
    magick = magick
        .fill('#B0B0B0')
        .fontSize(20)
        .drawText(0, 0, width + ' x ' + height, 'center');

    res.set('Content-Type', 'image/png');
    magick.stream('png').pipe(res);
};

let resizedImage = (req, res, {
    src,
    method,
    width,
    height
}) => {
    let magick = gm(src);
    magick.format((err, format) => {
        if (err) {
            return res.status(500).send(err.message || err);
        }

        switch (method) {
            case 'resize':
                res.set('Content-Type', 'image/' + format.toLowerCase());
                magick.autoOrient()
                    .resize(width, height)
                    .stream()
                    .pipe(res);
                return;

            case 'cover':
                res.set('Content-Type', 'image/' + format.toLowerCase());
                magick.autoOrient()
                    .resize(width, height + '^')
                    .gravity('Center')
                    .extent(width, height + '>')
                    .stream()
                    .pipe(res);
                return;

            default:
                res.status(501).send(_('Method not supported'));
        }
    });
};

// /editorapi/img?src=" + encodeURIComponent(src) + "&method=" + encodeURIComponent(method) + "&params=" + encodeURIComponent(width + "," + height);
router.get('/img', passport.csrfProtection, (req, res) => {
    settings.get('serviceUrl', (err, serviceUrl) => {
        if (err) {
            return res.status(500).send(err.message || err);
        }

        let {
            src,
            method,
            params = '600,null'
        } = req.query;
        let width = params.split(',')[0];
        let height = params.split(',')[1];
        width = (width === 'null') ? null : Number(width);
        height = (height === 'null') ? null : Number(height);

        switch (method) {
            case 'placeholder':
                return placeholderImage(req, res, {
                    width,
                    height
                });
            case 'resize':
            case 'cover':
                src = /^https?:\/\/|^\/\//i.test(src) ? src : url.resolve(serviceUrl, src);
                return resizedImage(req, res, {
                    src,
                    method,
                    width,
                    height
                });
            default:
                return res.status(501).send(_('Method not supported'));
        }
    });
});

router.post('/update', passport.parseForm, passport.csrfProtection, (req, res) => {
    prepareHtml({
        editorName: req.query.editor,
        html: req.body.html
    }, (err, html) => {
        if (err) {
            return res.status(500).send(err.message || err);
        }

        req.body.html = html;

        if (req.query.type === 'template') {
            templates.update(req.body.id, req.body, (err, updated) => {
                if (err) {
                    return res.status(500).send(err.message || err);
                }
                res.send('ok');
            });

        } else if (req.query.type === 'campaign') {
            campaigns.update(req.body.id, req.body, (err, updated) => {
                if (err) {
                    return res.status(500).send(err.message || err);
                }
                res.send('ok');
            });

        } else {
            res.status(500).send(_('Invalid resource type'));
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

        let baseDir = path.join(__dirname, '..', 'public', req.query.editor, 'uploads');
        let baseDirUrl = serviceUrl + req.query.editor + '/uploads';

        listImages(path.join(baseDir, '0'), baseDirUrl + '/0', (err, sharedImages) => {
            if (err) {
                return res.status(500).send(err.message || err);
            }

            if (req.query.type === 'campaign' && Number(req.query.id) > 0) {
                listImages(path.join(baseDir, req.query.id), baseDirUrl + '/' + req.query.id, (err, campaignImages) => {
                    err ? res.status(500).send(err.message || err) :
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
    let dirName = req.query.type === 'template' ? '0' :
        req.query.type === 'campaign' && Number(req.query.id) > 0 ? req.query.id :
        null;

    if (dirName === null) {
        return res.status(500).send(_('Invalid resource type or ID'));
    }

    let opts = {
        tmpDir: config.www.tmpdir || os.tmpdir(),
        imageVersions: req.query.editor === 'mosaico' ? {
            thumbnail: {
                width: 90,
                height: 90
            }
        } : {},
        uploadDir: path.join(__dirname, '..', 'public', req.query.editor, 'uploads', dirName),
        uploadUrl: '/' + req.query.editor + '/uploads/' + dirName, // must be root relative
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
    };

    let mockres = httpMocks.createResponse({
        eventEmitter: events.EventEmitter
    });

    mockres.on('end', () => {
        if (req.query.editor === 'grapejs') {
            let data = [];
            JSON.parse(mockres._getData()).files.forEach(file => {
                data.push({
                    src: file.url
                });
            });
            res.json({
                data
            });
        } else {
            res.send(mockres._getData());
        }
    });

    jqueryFileUpload.fileHandler(opts)(req, mockres);
});

router.post('/download', passport.csrfProtection, (req, res) => {
    prepareHtml({
        editorName: req.query.editor,
        html: req.body.html
    }, (err, html) => {
        if (err) {
            return res.status(500).send(err.message || err);
        }
        res.setHeader('Content-disposition', 'attachment; filename=' + req.body.filename);
        res.setHeader('Content-type', 'text/html');
        res.send(html);
    });
});

let parseGrapejsMultipartTestForm = (req, res, next) => {
    if (req.query.editor === 'grapejs') {
        new multiparty.Form().parse(req, (err, fields, files) => {
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
    let sendError = err => {
        if (req.query.editor === 'grapejs') {
            res.status(500).json({
                errors: err.message || err
            });
        } else {
            res.status(500).send(err.message || err);
        }
    };

    prepareHtml({
        editorName: req.query.editor,
        html: req.body.html
    }, (err, html) => {
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

                let opts = {
                    from: {
                        name: configItems.defaultFrom,
                        address: configItems.defaultAddress,
                    },
                    to: req.body.email,
                    subject: req.body.subject,
                    text: htmlToText.fromString(html, {
                        wordwrap: 100
                    }),
                    html,
                };

                transport.sendMail(opts, (err, info) => {
                    if (err) {
                        return sendError(err);
                    }

                    req.query.editor === 'grapejs' ?
                        res.json({
                            data: 'ok'
                        }) :
                        res.send('ok');
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
