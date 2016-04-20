'use strict';

/**
 * Module dependencies.
 */

let config = require('config');
let log = require('npmlog');
let app = require('./app');
let http = require('http');
let sender = require('./services/sender');
let importer = require('./services/importer'); // eslint-disable-line global-require
let verpServer = require('./services/verp-server'); // eslint-disable-line global-require
let testServer = require('./services/test-server'); // eslint-disable-line global-require
let settings = require('./lib/models/settings');

let port = config.www.port;
let host = config.www.host;

if (config.title) {
    process.title = config.title;
}

log.level = config.log.level;
app.set('port', port);

/**
 * Create HTTP server.
 */

let server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

settings.list(['db_schema_version'], (err, configItems) => {
    if (err) {
        throw err;
    }
    let dbSchemaVersion = Number(configItems.dbSchemaVersion) || 0;

    if (dbSchemaVersion < config.mysql.schema_version) {
        log.error('Database', 'Database schema outdated. Run `npm run sql` to upgrade');
        return process.exit(1);
    }

    server.listen(port, host);

});

server.on('error', err => {
    if (err.syscall !== 'listen') {
        throw err;
    }

    let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (err.code) {
        case 'EACCES':
            log.error('Express', '%s requires elevated privileges', bind);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            log.error('Express', '%s is already in use', bind);
            process.exit(1);
            break;
        default:
            throw err;
    }
});

server.on('listening', () => {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    log.info('Express', 'WWW server listening on %s', bind);

    // start additional services
    testServer(() => {
        verpServer(() => {
            importer(() => {
                sender(() => {
                    log.info('Service', 'All services started');
                    if (config.group) {
                        try {
                            process.setgid(config.group);
                            log.info('Service', 'Changed group to "%s" (%s)', config.group, process.getgid());
                        } catch (E) {
                            log.info('Service', 'Failed changed group to "%s"', config.group);
                        }
                    }
                    if (config.user) {
                        try {
                            process.setuid(config.user);
                            log.info('Service', 'Changed user to "%s" (%s)', config.user, process.getuid());
                        } catch (E) {
                            log.info('Service', 'Failed changed user to "%s"', config.user);
                        }
                    }
                });
            });
        });
    });
});
