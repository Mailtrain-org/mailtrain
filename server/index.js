'use strict';

const config = require('./lib/config');
const log = require('./lib/log');
const appBuilder = require('./app-builder');
const translate = require('./lib/translate');
const http = require('http');
const triggers = require('./services/triggers');
const gdprCleanup = require('./services/gdpr-cleanup');
const importer = require('./lib/importer');
const feedcheck = require('./lib/feedcheck');
const verpServer = require('./services/verp-server');
const testServer = require('./services/test-server');
const postfixBounceServer = require('./services/postfix-bounce-server');
const tzupdate = require('./services/tzupdate');
const dbcheck = require('./lib/dbcheck');
const senders = require('./lib/senders');
const reportProcessor = require('./lib/report-processor');
const executor = require('./lib/executor');
const privilegeHelpers = require('./lib/privilege-helpers');
const knex = require('./lib/knex');
const bluebird = require('bluebird');
const shares = require('./models/shares');
const { AppType } = require('../shared/app');
const builtinZoneMta = require('./lib/builtin-zone-mta');
const klawSync = require('klaw-sync');

const { uploadedFilesDir } = require('./lib/file-helpers');
const { reportFilesDir } = require('./lib/report-helpers');
const { filesDir } = require('./models/files');

const trustedPort = config.www.trustedPort;
const sandboxPort = config.www.sandboxPort;
const publicPort = config.www.publicPort;
const host = config.www.host;

if (config.title) {
    process.title = config.title;
}

async function startHTTPServer(appType, appName, port) {
    const app = await appBuilder.createApp(appType);
    app.set('port', port);

    const server = http.createServer(app);

    server.on('error', err => {
        if (err.syscall !== 'listen') {
            throw err;
        }

        const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

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
        const addr = server.address();
        const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        log.info('Express', 'WWW server [%s] listening on %s', appName, bind);
    });

    const serverListenAsync = bluebird.promisify(server.listen.bind(server));
    await serverListenAsync({port, host});
}


// ---------------------------------------------------------------------------------------
// Start the whole circus
// ---------------------------------------------------------------------------------------
async function init() {
    await dbcheck();

    await knex.migrate.latest(); // And now the current migration with Knex

    await shares.regenerateRoleNamesTable();
    await shares.rebuildPermissions();

    await privilegeHelpers.ensureMailtrainDir(filesDir);

    // Update owner of all files under 'files' dir. This should not be necessary, but when files are copied over,
    // the ownership needs to be fixed.
    for (const dirEnt of klawSync(filesDir, {})) {
        await privilegeHelpers.ensureMailtrainOwner(dirEnt.path);
    }

    await privilegeHelpers.ensureMailtrainDir(uploadedFilesDir);
    await privilegeHelpers.ensureMailtrainDir(reportFilesDir);

    await executor.spawn();
    await testServer.start();
    await verpServer.start();
    await builtinZoneMta.spawn();

    await startHTTPServer(AppType.TRUSTED, 'trusted', trustedPort);
    await startHTTPServer(AppType.SANDBOXED, 'sandbox', sandboxPort);
    await startHTTPServer(AppType.PUBLIC, 'public', publicPort);

    privilegeHelpers.dropRootPrivileges();

    tzupdate.start();

    await importer.spawn();
    await feedcheck.spawn();
    await senders.spawn();

    triggers.start();
    gdprCleanup.start();

    await postfixBounceServer.start();

    await reportProcessor.init();

    log.info('Service', 'All services started');
    appBuilder.setReady();
}

init().catch(err => {log.error('', err); process.exit(1); });


