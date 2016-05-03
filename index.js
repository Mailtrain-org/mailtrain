'use strict';

/**
 * Module dependencies.
 */

let config = require('config');
let log = require('npmlog');
let app = require('./app');
let http = require('http');
let sender = require('./services/sender');
let importer = require('./services/importer');
let verpServer = require('./services/verp-server');
let testServer = require('./services/test-server');
let tzupdate = require('./services/tzupdate');
let feedcheck = require('./services/feedcheck');
let dbcheck = require('./lib/dbcheck');

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


// Check if database needs upgrading before starting the server
dbcheck(err => {
    if (err) {
        log.error('DB', err.message || err);
        return process.exit(1);
    }
    /**
     * Listen on provided port, on all network interfaces.
     */
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
            return process.exit(1);
        case 'EADDRINUSE':
            log.error('Express', '%s is already in use', bind);
            return process.exit(1);
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
            tzupdate(() => {
                importer(() => {
                    sender(() => {
                        feedcheck(() => {
                            log.info('Service', 'All services started');
                            if (config.group) {
                                try {
                                    process.setgid(config.group);
                                    log.info('Service', 'Changed group to "%s" (%s)', config.group, process.getgid());
                                } catch (E) {
                                    log.info('Service', 'Failed to change group to "%s" (%s)', config.group, E.message);
                                }
                            }
                            if (config.user) {
                                try {
                                    process.setuid(config.user);
                                    log.info('Service', 'Changed user to "%s" (%s)', config.user, process.getuid());
                                } catch (E) {
                                    log.info('Service', 'Failed to change user to "%s" (%s)', config.user, E.message);
                                }
                            }
                        });
                    });
                });
            });
        });
    });
});
