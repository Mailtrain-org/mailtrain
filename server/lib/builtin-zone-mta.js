'use strict';

const config = require('./config');
const fork = require('./fork').fork;
const log = require('./log');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');
const bluebird = require('bluebird');
const os = require('os');

let zoneMtaProcess = null;

const zoneMtaDir = path.join(__dirname, '..', '..', 'zone-mta');
const zoneMtaBuiltingConfig = path.join(zoneMtaDir, 'config', 'builtin-zonemta.json');

const password = process.env.BUILTIN_ZONE_MTA_PASSWORD || crypto.randomBytes(20).toString('hex').toLowerCase();

let restartCount = 0;
let lastRestartCount = 0;

let restartBackoffIdx = 0;
const restartBackoff = [0, 30, 60, 300]; // in seconds

setInterval(() => {
    if (restartCount === lastRestartCount) {
        restartBackoffIdx = 0;
    }

    lastRestartCount = restartCount;
}, 300000 /* 5 mins */);

function getUsername() {
    return 'mailtrain';
}

function getPassword() {
    return password;
}

async function createConfig() {
    const cnf = {    // This is the main config file
        name: 'ZoneMTA',

        // Process identifier
        ident: 'zone-mta',

        // Run as the following user. Only use this if the application starts up as root
        user: config.user,
        group: config.group,

        log: config.builtinZoneMTA.log,

        dbs: {
            // MongoDB connection string
            mongo: config.builtinZoneMTA.mongo,

            // Redis connection string
            redis: config.builtinZoneMTA.redis,

            // Database name for ZoneMTA data in MongoDB. In most cases it should be the same as in the connection string
            sender: 'zone-mta'
        },

        api: {
            maildrop: false,
            user: getUsername(),
            pass: getPassword()
        },

        smtpInterfaces: {
            // Default SMTP interface for accepting mail for delivery
            feeder: {
                enabled: true,

                // How many worker processes to spawn
                processes: 1,

                // Maximum allowed message size 30MB
                maxSize: 31457280,

                // Local IP and port to bind to
                host: config.builtinZoneMTA.host,
                port: config.builtinZoneMTA.port,

                // Set to true to require authentication
                // If authentication is enabled then you need to use a plugin with an authentication hook
                authentication: true,

                // How many recipients to allow per message
                maxRecipients: 1,

                // Set to true to enable STARTTLS. Do not forget to change default TLS keys
                starttls: false,

                // set to true to start in TLS mode if using port 465
                // this probably does not work as TLS support with 465 in ZoneMTA is a bit buggy
                secure: false,
            }
        },

        plugins: {
            "core/email-bounce": false,
            "core/http-bounce": {
                enabled: "main",
                url: `${config.www.trustedUrlBase}/webhooks/zone-mta`
            },
            "core/default-headers": {
                enabled: ["receiver", "main", "sender"],
                futureDate: false,
                xOriginatingIP: false
            },
            'mailtrain-main': {
                enabled: ['main']
            },
            'mailtrain-receiver': {
                enabled: ['receiver'],
                username: getUsername(),
                password: getPassword()
            }
        },

        pools: {
            default: {
              address: '0.0.0.0',
              name: config.builtinZoneMTA.poolName || os.hostname()
            }
        },

        zones: {
            default: {
                preferIPv6: false,
                ignoreIPv6: true,
                processes: config.builtinZoneMTA.processes,
                connections: config.builtinZoneMTA.connections,
                pool: 'default'
            }
        }
    };

    await fs.writeFile(zoneMtaBuiltingConfig, JSON.stringify(cnf, null, 2));
}

function restart(callback) {
    if (zoneMtaProcess) return callback();

    if (restartCount === 0) {
        log.info('ZoneMTA', 'Starting built-in Zone MTA process');
    } else {
        log.info('ZoneMTA', `Restarting built-in Zone MTA process (restart count ${restartCount})`);
    }

    zoneMtaProcess = fork(
        path.join(zoneMtaDir, 'index.js'),
        ['--config=' + zoneMtaBuiltingConfig],
        {
            cwd: zoneMtaDir,
            env: {NODE_ENV: process.env.NODE_ENV}
        }
    );

    zoneMtaProcess.on('message', msg => {
        if (msg) {
            if (msg.type === 'zone-mta-started') {
                log.info('ZoneMTA', 'ZoneMTA process started');

                if (callback) {
                    return callback();
                } else {
                    return;
                }
            }
        }
    });

    zoneMtaProcess.on('close', (code, signal) => {
        log.error('ZoneMTA', 'ZoneMTA process exited with code %s signal %s', code, signal);

        zoneMtaProcess = null;
        restartCount += 1;

        const backoffTimeout = restartBackoff[restartBackoffIdx] * 1000;
        if (restartBackoffIdx < restartBackoff.length - 1) {
            restartBackoffIdx += 1;
        }

        setTimeout(restart, backoffTimeout, callback);
    });
}

function spawn(callback) {
    if (config.builtinZoneMTA.enabled) {

        createConfig().then(() => {
            restart(callback);
        }).catch(err => callback(err));

    } else {
        callback();
    }
}

module.exports.spawn = bluebird.promisify(spawn);
module.exports.getUsername = getUsername;
module.exports.getPassword = getPassword;
