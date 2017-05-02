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

const routes = require('./routes/index');
const users = require('./routes/users');
const lists = require('./routes/lists');
const settings = require('./routes/settings');
const settingsModel = require('./lib/models/settings');
const templates = require('./routes/templates');
const campaigns = require('./routes/campaigns');
const links = require('./routes/links');
const fields = require('./routes/fields');
const forms = require('./routes/forms');
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
const reports = require('./routes/reports');
const reportsTemplates = require('./routes/report-templates');

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

app.use('/', routes);
app.use('/users', users);
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
    app.use('/report-templates', reportsTemplates);
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error(_('Not Found'));
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        if (!err) {
            return next();
        }
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    if (!err) {
        return next();
    }
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
