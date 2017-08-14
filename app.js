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
const tools = require('./lib/tools');
const contextHelpers = require('./lib/context-helpers');

const routes = require('./routes/index');
const lists = require('./routes/lists-legacy');
const settings = require('./routes/settings');
const settingsModel = require('./lib/models/settings');
const templates = require('./routes/templates');
const campaigns = require('./routes/campaigns');
const links = require('./routes/links');
const fields = require('./routes/fields');
const forms = require('./routes/forms-legacy');
const segments = require('./routes/segments');
const triggers = require('./routes/triggers');
const webhooks = require('./routes/webhooks');
const subscription = require('./routes/subscription');
const archive = require('./routes/archive');
const api = require('./routes/api');
const blacklist = require('./routes/blacklist');
const editorapi = require('./routes/editorapi');
const grapejs = require('./routes/grapejs');
const mosaico = require('./routes/mosaico');

// These are routes for the new React-based client
const reports = require('./routes/reports');

const namespacesRest = require('./routes/rest/namespaces');
const usersRest = require('./routes/rest/users');
const accountRest = require('./routes/rest/account');
const reportTemplatesRest = require('./routes/rest/report-templates');
const reportsRest = require('./routes/rest/reports');
const campaignsRest = require('./routes/rest/campaigns');
const listsRest = require('./routes/rest/lists');
const formsRest = require('./routes/rest/forms');
const fieldsRest = require('./routes/rest/fields');
const sharesRest = require('./routes/rest/shares');
const segmentsRest = require('./routes/rest/segments');
const subscriptionsRest = require('./routes/rest/subscriptions');

const namespacesLegacyIntegration = require('./routes/namespaces-legacy-integration');
const usersLegacyIntegration = require('./routes/users-legacy-integration');
const accountLegacyIntegration = require('./routes/account-legacy-integration');
const reportsLegacyIntegration = require('./routes/reports-legacy-integration');
const listsLegacyIntegration = require('./routes/lists-legacy-integration');

const interoperableErrors = require('./shared/interoperable-errors');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Handle proxies. Needed to resolve client IP
if (config.www.proxy) {
    app.set('trust proxy', config.www.proxy);
}

// Do not expose software used
app.disable('x-powered-by');

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerPartials(__dirname + '/views/subscription/partials/');
hbs.registerPartials(__dirname + '/views/report-templates/partials/');
hbs.registerPartials(__dirname + '/views/reports/partials/');

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

    let messages = this.flash(); // eslint-disable-line no-invalid-this
    let response = [];

    // group messages by type
    Object.keys(messages).forEach(key => {
        let el = '<div class="alert alert-' + key + ' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';

        if (key === 'danger') {
            el += '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> ';
        }

        let rows = [];

        messages[key].forEach(message => {
            message = hbs.handlebars.escapeExpression(message);
            message = message.replace(/(\r\n|\n|\r)/gm, '<br>');
            rows.push(message);
        });

        if (rows.length > 1) {
            el += '<p>' + rows.join('</p>\n<p>') + '</p>';
        } else {
            el += rows.join('');
        }

        el += '</div>';

        response.push(el);
    });

    return new hbs.handlebars.SafeString(
        response.join('\n')
    );
});

handlebarsHelpers.registerHelpers(hbs.handlebars);


app.use(compression());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

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
app.use(express.static(path.join(__dirname, 'public')));
app.use('/mailtrain', express.static(path.join(__dirname, 'client', 'dist')));
app.use('/locales', express.static(path.join(__dirname, 'client', 'locales')));

app.use(session({
    store: config.redis.enabled ? new RedisStore(config.redis) : false,
    secret: config.www.secret,
    saveUninitialized: false,
    resave: false
}));
app.use(flash());

app.use((req, res, next) => {
    req._ = str => _(str);
    next();
});

app.use(bodyParser.urlencoded({
    extended: true,
    limit: config.www.postsize
}));

app.use(bodyParser.text({
    limit: config.www.postsize
}));

app.use(bodyParser.json({
    limit: config.www.postsize
}));

passport.setup(app);

// make sure flash messages are available
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

    settingsModel.list(['ua_code', 'shoutout'], (err, configItems) => {
        if (err) {
            return next(err);
        }
        Object.keys(configItems).forEach(key => {
            res.locals[key] = configItems[key];
        });
        next();
    });
});

app.use((req, res, next) => {
    req.context = contextHelpers.getRequestContext(req);
    next();
});

app.use('/', routes);
app.use('/lists', lists);
app.use('/templates', templates);
app.use('/campaigns', campaigns);
app.use('/settings', settings);
app.use('/blacklist', blacklist);
app.use('/links', links);
app.use('/fields', fields);
app.use('/forms', forms);
app.use('/segments', segments);
app.use('/triggers', triggers);
app.use('/webhooks', webhooks);
app.use('/subscription', subscription);
app.use('/archive', archive);
app.use('/api', api);
app.use('/editorapi', editorapi);
app.use('/grapejs', grapejs);
app.use('/mosaico', mosaico);


if (config.reports && config.reports.enabled === true) {
    app.use('/reports', reports);
}

/* FIXME - this should be removed once we bind the ReactJS client to / */
app.use('/users', usersLegacyIntegration);
app.use('/namespaces', namespacesLegacyIntegration);
app.use('/account', accountLegacyIntegration);
app.use('/lists', listsLegacyIntegration);

if (config.reports && config.reports.enabled === true) {
    app.use('/reports', reports);
    app.use('/reports', reportsLegacyIntegration);
}
/* ------------------------------------------------------------------- */

app.all('/rest/*', (req, res, next) => {
    req.needsJSONResponse = true;
    next();
});

app.use('/rest', namespacesRest);
app.use('/rest', usersRest);
app.use('/rest', accountRest);
app.use('/rest', campaignsRest);
app.use('/rest', listsRest);
app.use('/rest', formsRest);
app.use('/rest', fieldsRest);
app.use('/rest', sharesRest);
app.use('/rest', segmentsRest);
app.use('/rest', subscriptionsRest);

if (config.reports && config.reports.enabled === true) {
    app.use('/rest', reportTemplatesRest);
    app.use('/rest', reportsRest);
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error(_('Not Found'));
    err.status = 404;
    next(err);
});

// error handlers

if (app.get('env') === 'development') {
    // development error handler
    // will print stacktrace
    app.use((err, req, res, next) => {
        if (!err) {
            return next();
        }

        if (req.needsJSONResponse) {
            const resp = {
                message: err.message,
                error: err
            };

            if (err instanceof interoperableErrors.InteroperableError) {
                resp.type = err.type;
                resp.data = err.data;
            }

            res.status(err.status || 500).json(resp);

        } else {
            if (err instanceof interoperableErrors.NotLoggedInError) {
                req.flash('danger', _('Need to be logged in to access restricted content'));
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
        if (req.needsJSONResponse) {
            const resp = {
                message: err.message,
                error: {}
            };

            if (err instanceof interoperableErrors.InteroperableError) {
                resp.type = err.type;
                resp.data = err.data;
            }

            res.status(err.status || 500).json(resp);

        } else {
            if (err instanceof interoperableErrors.NotLoggedInError) {
                req.flash('danger', _('Need to be logged in to access restricted content'));
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


module.exports = app;
