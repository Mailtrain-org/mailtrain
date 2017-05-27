'use strict';

/**
 * Module dependencies.
 */

const config = require('config');
const log = require('npmlog');
const app = require('./app');
const http = require('http');
const fork = require('child_process').fork;
const triggers = require('./services/triggers');
const importer = require('./services/importer');
const verpServer = require('./services/verp-server');
const testServer = require('./services/test-server');
const postfixBounceServer = require('./services/postfix-bounce-server');
const tzupdate = require('./services/tzupdate');
const feedcheck = require('./services/feedcheck');
const dbcheck = require('./lib/dbcheck');
const tools = require('./lib/tools');
const reportProcessor = require('./lib/report-processor');
const executor = require('./lib/executor');
const privilegeHelpers = require('./lib/privilege-helpers');

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

function spawnSenders(callback) {
    let processes = Math.max(Number(config.queue.processes) || 1, 1);
    let spawned = 0;
    let returned = false;

    if (processes > 1 && !config.redis.enabled) {
        log.error('Queue', '%s processes requested but Redis is not enabled, spawning 1 process', processes);
        processes = 1;
    }

    let spawnSender = function () {
        if (spawned >= processes) {
            if (!returned) {
                returned = true;
                return callback();
            }
            return false;
        }

        let child = fork(__dirname + '/services/sender.js', []);
        let pid = child.pid;
        tools.workers.add(child);

        child.on('close', (code, signal) => {
            spawned--;
            tools.workers.delete(child);
            log.error('Child', 'Sender process %s exited with %s', pid, code || signal);
            // Respawn after 5 seconds
            setTimeout(() => spawnSender(), 5 * 1000).unref();
        });

        spawned++;
        setImmediate(spawnSender);
    };

    spawnSender();
}

server.on('listening', () => {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    log.info('Express', 'WWW server listening on %s', bind);

    // start additional services
    function startNextServices() {
        testServer(() => {
            verpServer(() => {

                privilegeHelpers.dropRootPrivileges();

                tzupdate(() => {
                    importer(() => {
                        triggers(() => {
                            spawnSenders(() => {
                                feedcheck(() => {
                                    postfixBounceServer(() => {
                                        reportProcessor.init(() => {
                                            log.info('Service', 'All services started');
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    if (config.reports && config.reports.enabled === true) {
        executor.spawn(startNextServices);
    } else {
        startNextServices();
    }
});
