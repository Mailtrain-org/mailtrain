'use strict';

const config = require('config');
const log = require('npmlog');

const _ = require('./lib/translate')._;

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const flash = require('connect-flash');
const hbs = require('hbs');
const handlebarsHelpers = require('./lib/handlebars-helpers');
const compression = require('compression');
const passport = require('./lib/passport');
const contextHelpers = require('./lib/context-helpers');

const api = require('./routes/api');

// These are routes for the new React-based client
const reports = require('./routes/reports');
const subscription = require('./routes/subscription');
const mosaico = require('./routes/mosaico');
const files = require('./routes/files');

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

const interoperableErrors = require('./shared/interoperable-errors');

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

handlebarsHelpers.registerHelpers(hbs.handlebars);


function createApp(trusted) {
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
    app.use(favicon(path.join(__dirname, 'client', 'public', 'favicon.ico')));

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
    app.use(session({
        store: config.redis.enabled ? new RedisStore(config.redis) : false,
        secret: config.www.secret,
        saveUninitialized: false,
        resave: false
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

    if (trusted) {
        passport.setupRegularAuth(app);
    } else {
        app.use(passport.tryAuthByRestrictedAccessToken);
    }

    useWith404Fallback('/public', express.static(path.join(__dirname, 'client', 'public')));
    useWith404Fallback('/mailtrain', express.static(path.join(__dirname, 'client', 'dist')));
    useWith404Fallback('/locales', express.static(path.join(__dirname, 'client', 'locales')));


    // Make sure flash messages are available
    // Currently, flash messages are used only from routes/subscription.js
    app.use((req, res, next) => {
        res.locals.flash = req.flash.bind(req);
        next();
    });

    /* FIXME - can we remove this???
    app.use((req, res, next) => {
        res.locals.flash = req.flash.bind(req);
        res.locals.user = req.user;
        res.locals.admin = req.user && req.user.id == 1; // FIXME, this should verify the admin privileges and set this accordingly
        res.locals.ldap = {
            enabled: config.ldap.enabled,
            passwordresetlink: config.ldap.passwordresetlink
        };

        let menu = [{
            title: _('Home'),
            url: '/',
            selected: true
        }];

        res.setSelectedMenu = key => {
            menu.forEach(item => {
                item.selected = (item.key === key);
            });
        };

        res.locals.menu = menu;
        tools.updateMenu(res);

        res.locals.customStyles = config.customstyles || [];
        res.locals.customScripts = config.customscripts || [];

        let bodyClasses = [];
        if (req.user) {
            bodyClasses.push('logged-in user-' + req.user.username);
        }
        res.locals.bodyClass = bodyClasses.join(' ');

        getSettings(['uaCode', 'shoutout'], (err, configItems) => {
            if (err) {
                return next(err);
            }
            Object.keys(configItems).forEach(key => {
                res.locals[key] = configItems[key];
            });
            next();
        });
    });
    */

    // Endpoint under /api are authenticated by access token
    app.all('/api/*', passport.authByAccessToken);

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


    // Regular endpoints
    useWith404Fallback('/subscription', subscription);
    useWith404Fallback('/files', files);
    useWith404Fallback('/mosaico', mosaico.getRouter(trusted));

    if (config.reports && config.reports.enabled === true) {
        useWith404Fallback('/reports', reports);
    }


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

    app.use('/', index.getRouter(trusted));

    // Error handlers
    if (app.get('env') === 'development') {
        // development error handler
        // will print stacktrace
        app.use((err, req, res, next) => {
            if (!err) {
                return next();
            }

            if (req.needsRESTJSONResponse) {
                const resp = {
                    message: err.message,
                    error: err
                };

                if (err instanceof interoperableErrors.InteroperableError) {
                    resp.type = err.type;
                    resp.data = err.data;
                }

                res.status(err.status || 500).json(resp);

            } else if (req.needsAPIJSONResponse) {
                const resp = {
                    error: err.message || err,
                    data: []
                };

                return status(err.status || 500).json(resp);

            } else {
                if (err instanceof interoperableErrors.NotLoggedInError) {
                    return res.redirect('/account/login?next=' + encodeURIComponent(req.originalUrl));
                } else {
                    res.status(err.status || 500);
                    res.render('error', {
                        message: err.message,
                        error: err
                    });
                }
            }

        });
    } else {
        // production error handler
        // no stacktraces leaked to user
        app.use((err, req, res, next) => {
            if (!err) {
                return next();
            }

            console.log(err);
            if (req.needsRESTJSONResponse) {
                const resp = {
                    message: err.message,
                    error: {}
                };

                if (err instanceof interoperableErrors.InteroperableError) {
                    resp.type = err.type;
                    resp.data = err.data;
                }

                res.status(err.status || 500).json(resp);

            } else if (req.needsAPIJSONResponse) {
                const resp = {
                    error: err.message || err,
                    data: []
                };

                return res.status(err.status || 500).json(resp);

            } else {
                // TODO: Render interoperable errors using a special client that does internationalization of the error message

                if (err instanceof interoperableErrors.NotLoggedInError) {
                    return res.redirect('/account/login?next=' + encodeURIComponent(req.originalUrl));
                } else {
                    res.status(err.status || 500);
                    res.render('error', {
                        message: err.message,
                        error: {}
                    });
                }
            }
        });
    }

    return app;
}

module.exports = {
    createApp
};
