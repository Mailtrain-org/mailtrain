'use strict';

/**
 * Module dependencies.
 */

let config = require('config');
let log = require('npmlog');
let app = require('./app');
let http = require('http');

let port = config.www.port;

log.level = config.log.level;
app.set('port', port);

/**
 * Create HTTP server.
 */

let server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);

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

    // start sending loop
    require('./services/sender'); // eslint-disable-line global-require
    require('./services/importer'); // eslint-disable-line global-require
    require('./services/testserver'); // eslint-disable-line global-require
});
