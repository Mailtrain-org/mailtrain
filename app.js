'use strict';

let config = require('config');
let log = require('npmlog');

let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let RedisStore = require('connect-redis')(session);
let flash = require('connect-flash');
let hbs = require('hbs');
let compression = require('compression');
let passport = require('./lib/passport');
let tools = require('./lib/tools');

let routes = require('./routes/index');
let users = require('./routes/users');
let lists = require('./routes/lists');
let settings = require('./routes/settings');
let settingsModel = require('./lib/models/settings');
let templates = require('./routes/templates');
let campaigns = require('./routes/campaigns');
let links = require('./routes/links');
let fields = require('./routes/fields');
let segments = require('./routes/segments');
let triggers = require('./routes/triggers');
let webhooks = require('./routes/webhooks');
let subscription = require('./routes/subscription');
let archive = require('./routes/archive');
let api = require('./routes/api');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Handle proxies. Needed to resolve client IP
if (config.www.proxy) {
    app.set('trust proxy', config.www.proxy);
}

// Do not expose software used
app.disable('x-powered-by');

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
            rows.push(hbs.handlebars.escapeExpression(message));
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
        title: 'Home',
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
app.use('/links', links);
app.use('/fields', fields);
app.use('/segments', segments);
app.use('/triggers', triggers);
app.use('/webhooks', webhooks);
app.use('/subscription', subscription);
app.use('/archive', archive);
app.use('/api', api);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found');
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
