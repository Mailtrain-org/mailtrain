'use strict';

const config = require('./lib/config');
const log = require('./lib/log');
const appBuilder = require('./app-builder');
const translate = require('./lib/translate');
const http = require('http');
const gdprCleanup = require('./services/gdpr-cleanup');
const importer = require('./lib/importer');
const feedcheck = require('./lib/feedcheck');
const verpServer = require('./services/verp-server');
const testServer = require('./services/test-server');
const postfixBounceServer = require('./services/postfix-bounce-server');
const tzupdate = require('./services/tzupdate');
const senders = require('./lib/senders');
const privilegeHelpers = require('./lib/privilege-helpers');
const shares = require('./models/shares');
const { AppType } = require('../shared/app');
const builtinZoneMta = require('./lib/builtin-zone-mta');
const klawSync = require('klaw-sync');
const {promisify} = require("node:util");

const { uploadedFilesDir } = require('./lib/file-helpers');
const { filesDir } = require('./models/files');
const {initDb} = require("./lib/dbupdate");

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

    const serverListenAsync = promisify(server.listen.bind(server));
    await serverListenAsync({port, host});
}

// ---------------------------------------------------------------------------------------
// Start the whole circus
// ---------------------------------------------------------------------------------------
async function init() {

    await initDb();

    await shares.regenerateRoleNamesTable();
    await shares.rebuildPermissions();

    await privilegeHelpers.ensureMailtrainDir(filesDir);

    // Update owner of all files under 'files' dir. This should not be necessary, but when files are copied over,
    // the ownership needs to be fixed.
    for (const dirEnt of klawSync(filesDir, {})) {
        await privilegeHelpers.ensureMailtrainOwner(dirEnt.path);
    }

    await privilegeHelpers.ensureMailtrainDir(uploadedFilesDir);

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

    gdprCleanup.start();

    await postfixBounceServer.start();

    log.info('Service', 'All services started');
    appBuilder.setReady();
}

init().catch(err => {log.error('', err); process.exit(1); });


