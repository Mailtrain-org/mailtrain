'use strict';

const config = require('./lib/config');
const log = require('./lib/log');

const express = require('express');
const expressLocale = require('express-locale');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const hbs = require('hbs');
const compression = require('compression');
const passport = require('./lib/passport');
const contextHelpers = require('./lib/context-helpers');

const api = require('./routes/api');

// These are routes for the new React-based client
const reports = require('./routes/reports');
const quickReports = require('./routes/quick-reports');
const subscriptions = require('./routes/subscriptions');
const campaigns = require('./routes/campaigns');
const subscription = require('./routes/subscription');
const sandboxedMosaico = require('./routes/sandboxed-mosaico');
const sandboxedCKEditor = require('./routes/sandboxed-ckeditor');
const sandboxedGrapesJS = require('./routes/sandboxed-grapesjs');
const sandboxedCodeEditor = require('./routes/sandboxed-codeeditor');
const files = require('./routes/files');
const links = require('./routes/links');
const archive = require('./routes/archive');
const webhooks = require('./routes/webhooks');

const namespacesRest = require('./routes/rest/namespaces');
const sendConfigurationsRest = require('./routes/rest/send-configurations');
const usersRest = require('./routes/rest/users');
const accountRest = require('./routes/rest/account');
const reportTemplatesRest = require('./routes/rest/report-templates');
const reportsRest = require('./routes/rest/reports');
const campaignsRest = require('./routes/rest/campaigns');
const triggersRest = require('./routes/rest/triggers');
const listsRest = require('./routes/rest/lists');
const formsRest = require('./routes/rest/forms');
const fieldsRest = require('./routes/rest/fields');
const importsRest = require('./routes/rest/imports');
const importRunsRest = require('./routes/rest/import-runs');
const sharesRest = require('./routes/rest/shares');
const segmentsRest = require('./routes/rest/segments');
const subscriptionsRest = require('./routes/rest/subscriptions');
const templatesRest = require('./routes/rest/templates');
const mosaicoTemplatesRest = require('./routes/rest/mosaico-templates');
const blacklistRest = require('./routes/rest/blacklist');
const editorsRest = require('./routes/rest/editors');
const filesRest = require('./routes/rest/files');
const settingsRest = require('./routes/rest/settings');

const index = require('./routes/index');

const interoperableErrors = require('../shared/interoperable-errors');

const { getTrustedUrl, getSandboxUrl, getPublicUrl } = require('./lib/urls');
const { AppType } = require('../shared/app');


let isReady = false;
function setReady() {
    isReady = true;
}


hbs.registerPartials(__dirname + '/views/partials');
hbs.registerPartials(__dirname + '/views/subscription/partials/');

/**
 * We need this helper to make sure that we consume flash messages only
 * when we are able to actually display these. Otherwise we might end up
 * in a situation where we consume a flash messages but then comes a redirect
 * and the message is never displayed
 */
hbs.registerHelper('flash_messages', function () { // eslint-disable-line prefer-arrow-callback
    if (typeof this.flash !== 'function') { // eslint-disable-line no-invalid-this
        return '';
    }

    const messages = this.flash(); // eslint-disable-line no-invalid-this
    const response = [];

    // group messages by type
    for (const key in messages) {
        let el = '<div class="alert alert-' + key + ' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';

        if (key === 'danger') {
            el += '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> ';
        }

        let rows = [];

        for (const message of messages[key]) {
            rows.push(hbs.handlebars.escapeExpression(message).replace(/(\r\n|\n|\r)/gm, '<br>'));
        }

        if (rows.length > 1) {
            el += '<p>' + rows.join('</p>\n<p>') + '</p>';
        } else {
            el += rows.join('');
        }

        el += '</div>';

        response.push(el);
    }

    return new hbs.handlebars.SafeString(
        response.join('\n')
    );
});



async function createApp(appType) {
    const app = express();

    function install404Fallback(url) {
        app.use(url, (req, res, next) => {
            next(new interoperableErrors.NotFoundError());
        });

        app.use(url + '/*', (req, res, next) => {
            next(new interoperableErrors.NotFoundError());
        });
    }

    function useWith404Fallback(url, route) {
        app.use(url, route);
        install404Fallback(url);
    }

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'hbs');

    // Handle proxies. Needed to resolve client IP
    if (config.www.proxy) {
        app.set('trust proxy', config.www.proxy);
    }

    // Do not expose software used
    app.disable('x-powered-by');

    app.use(compression());
    app.use(favicon(path.join(__dirname, '..', 'client', 'static', 'favicon.ico')));

    app.use(logger(config.www.log, {
        stream: {
            write: message => {
                message = (message || '').toString();
                if (message) {
                    log.info('HTTP', message.replace('\n', '').trim());
                }
            }
        }
    }));

    app.use(cookieParser());

    if (config.redis.enabled) {
        const RedisStore = require('connect-redis')(session);

        app.use(session({
            store: new RedisStore(config.redis),
            secret: config.www.secret,
            saveUninitialized: false,
            resave: false
        }));
    } else {
        app.use(session({
            store: false,
            secret: config.www.secret,
            saveUninitialized: false,
            resave: false
        }));
    }

    app.use(expressLocale({
        priority: ['query', 'cookie', 'accept-language', 'default'],
        query: {
            name: 'locale'
        },
        cookie: {
            name: 'i18nextLng'
        },
        default: config.defaultLanguage
    }));

    app.use(flash());

    app.use(bodyParser.urlencoded({
        extended: true,
        limit: config.www.postSize
    }));

    app.use(bodyParser.text({
        limit: config.www.postSize
    }));

    app.use(bodyParser.json({
        limit: config.www.postSize
    }));


    app.use((req, res, next) => {
        if (isReady) {
            next();
        } else {
            res.status(500);
            res.render('error', {
                message: 'Mailtrain is starting. Try again after a few seconds.',
                error: {}
            });
        }
    });

    if (appType === AppType.TRUSTED) {
        passport.setupRegularAuth(app);
    } else if (appType === AppType.SANDBOXED) {
        app.use(passport.tryAuthByRestrictedAccessToken);
    }

    if (appType === AppType.TRUSTED || appType === AppType.SANDBOXED) {
        // Endpoint under /api are authenticated by access token
        app.all('/api/*', passport.authByAccessToken);
    }

    useWith404Fallback('/static', express.static(path.join(__dirname, '..', 'client', 'static')));
    useWith404Fallback('/client', express.static(path.join(__dirname, '..', 'client', 'dist')));

    useWith404Fallback('/static-npm/fontawesome', express.static(path.join(__dirname, '..', 'client', 'dist', 'webfonts')));
    useWith404Fallback('/static-npm/jquery.min.js', express.static(path.join(__dirname, '..', 'client', 'dist', 'jquery.min.js')));
    useWith404Fallback('/static-npm/popper.min.js', express.static(path.join(__dirname, '..', 'client', 'dist', 'popper.min.js')));
    useWith404Fallback('/static-npm/bootstrap.min.js', express.static(path.join(__dirname, '..', 'client', 'dist', 'bootstrap.min.js')));
    useWith404Fallback('/static-npm/coreui.min.js', express.static(path.join(__dirname, '..', 'client', 'dist', 'coreui.min.js')));


    // Make sure flash messages are available
    // Currently, flash messages are used only from routes/subscription.js
    app.use((req, res, next) => {
        res.locals.flash = req.flash.bind(req);
        next();
    });

    // Marks the following endpoint to return JSON object when error occurs
    app.all('/api/*', (req, res, next) => {
        req.needsAPIJSONResponse = true;
        next();
    });

    app.all('/rest/*', (req, res, next) => {
        req.needsRESTJSONResponse = true;
        next();
    });

    // Initializes the request context to be used for authorization
    app.use((req, res, next) => {
        req.context = contextHelpers.getRequestContext(req);
        next();
    });

    if (appType === AppType.PUBLIC) {
        useWith404Fallback('/subscription', subscription);
        useWith404Fallback('/links', links);
        useWith404Fallback('/archive', archive);
        useWith404Fallback('/files', files);
    }

    useWith404Fallback('/cpgs', await campaigns.getRouter(appType)); // This needs to be different from "campaigns", which is already used by the UI

    useWith404Fallback('/mosaico', await sandboxedMosaico.getRouter(appType));
    useWith404Fallback('/ckeditor', await sandboxedCKEditor.getRouter(appType));
    useWith404Fallback('/grapesjs', await sandboxedGrapesJS.getRouter(appType));
    useWith404Fallback('/codeeditor', await sandboxedCodeEditor.getRouter(appType));

    if (appType === AppType.TRUSTED || appType === AppType.SANDBOXED) {
        useWith404Fallback('/subscriptions', subscriptions);
        useWith404Fallback('/webhooks', webhooks);

        if (config.reports && config.reports.enabled === true) {
            useWith404Fallback('/rpts', reports); // This needs to be different from "reports", which is already used by the UI
        }

        useWith404Fallback('/quick-rpts', quickReports);

        // API endpoints
        useWith404Fallback('/api', api);

        // REST endpoints
        app.use('/rest', namespacesRest);
        app.use('/rest', sendConfigurationsRest);
        app.use('/rest', usersRest);
        app.use('/rest', accountRest);
        app.use('/rest', campaignsRest);
        app.use('/rest', triggersRest);
        app.use('/rest', listsRest);
        app.use('/rest', formsRest);
        app.use('/rest', fieldsRest);
        app.use('/rest', importsRest);
        app.use('/rest', importRunsRest);
        app.use('/rest', sharesRest);
        app.use('/rest', segmentsRest);
        app.use('/rest', subscriptionsRest);
        app.use('/rest', templatesRest);
        app.use('/rest', mosaicoTemplatesRest);
        app.use('/rest', blacklistRest);
        app.use('/rest', editorsRest);
        app.use('/rest', filesRest);
        app.use('/rest', settingsRest);

        if (config.reports && config.reports.enabled === true) {
            app.use('/rest', reportTemplatesRest);
            app.use('/rest', reportsRest);
        }
        install404Fallback('/rest');
    }

    app.use('/', await index.getRouter(appType));

    app.use((err, req, res, next) => {
        if (!err) {
            return next();
        }

        if (req.needsRESTJSONResponse) {
            const resp = {
                message: err.message,
                error: config.sendStacktracesToClient ? err : {}
            };

            if (err instanceof interoperableErrors.InteroperableError) {
                resp.type = err.type;
                resp.data = err.data;
            }

            log.verbose('HTTP', err);
            res.status(err.status || 500).json(resp);

        } else if (req.needsAPIJSONResponse) {
            const resp = {
                error: err.message || err,
                data: []
            };

            log.verbose('HTTP', err);
            return res.status(err.status || 500).json(resp);

        } else {
            // TODO: Render interoperable errors using a special client that does internationalization of the error message

            if (err instanceof interoperableErrors.NotLoggedInError) {
                return res.redirect(getTrustedUrl('/login?next=' + encodeURIComponent(req.originalUrl)));
            } else {
                let publicPath;
                if (appType === AppType.TRUSTED) {
                    publicPath = getTrustedUrl();
                } else if (appType === AppType.SANDBOXED) {
                    publicPath = getSandboxUrl();
                } else if (appType === AppType.PUBLIC) {
                    publicPath = getPublicUrl();
                }

                log.verbose('HTTP', err);
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: config.sendStacktracesToClient ? err : {},
                    publicPath
                });
            }
        }
    });

    return app;
}

module.exports.createApp = createApp;
module.exports.setReady = setReady;
