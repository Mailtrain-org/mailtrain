'use strict';

const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {randomBytes} = require('node:crypto');
const net = require('node:net');
const path = require('node:path');
const {setTimeout: delay} = require('node:timers/promises');
const {smoke} = require('./smoke');
const {supportedFixture} = require('./fixtures');
const {browserWalk, seedEditors} = require('./browser');
const {upgrade} = require('./upgrade');

const project = 'mailtrain-e2e-' + randomBytes(6).toString('hex');
const root = path.resolve(__dirname, '..');
const args = ['compose', '-p', project, '-f', 'docker-compose.yml', '-f', 'e2e/compose.yml'];
const env = {...process.env};

function compose(command, capture = false) {
    const result = spawnSync('docker', [...args, ...command], {
        cwd: root, env, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit'
    });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, `docker compose ${command.join(' ')} failed: ${result.stderr || ''}`);
    return result.stdout && result.stdout.trim();
}

async function freePort() {
    const server = net.createServer();
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    const port = server.address().port;
    await new Promise(resolve => server.close(resolve));
    return port;
}

async function main() {
    const started = Date.now();
    // Choose all three published ports before the entrypoint generates URLs.
    env.PORT_TRUSTED = String(await freePort());
    env.PORT_SANDBOX = String(await freePort());
    env.PORT_PUBLIC = String(await freePort());
    env.URL_BASE_TRUSTED = `http://localhost:${env.PORT_TRUSTED}`;
    env.URL_BASE_SANDBOX = `http://localhost:${env.PORT_SANDBOX}`;
    env.URL_BASE_PUBLIC = `http://localhost:${env.PORT_PUBLIC}`;
    console.log(`Project ${project}; image ${env.MAILTRAIN_IMAGE || 'mailtrain-local:v3'}`);
    try {
        if (process.argv.includes('--upgrade')) {
            await upgrade({compose, env, project, freePort});
            console.log(`Upgrade suite passed in ${((Date.now() - started) / 1000).toFixed(1)} seconds`);
            return;
        }
        compose(['up', '-d', '--no-build', '--wait', '--wait-timeout', '240']);
        const catcher = 'http://' + compose(['port', 'smtp', '8025'], true);
        const verifyRestart = await smoke(env.URL_BASE_TRUSTED, env.URL_BASE_PUBLIC, catcher);
        const password = 'Changed-smoke-password-79!';
        const ids = await supportedFixture(env.URL_BASE_TRUSTED, false, password);
        await seedEditors(env.URL_BASE_TRUSTED, ids, password);
        await browserWalk(env.URL_BASE_TRUSTED, env.URL_BASE_PUBLIC, ids, password, catcher);
        // Restart against the same SQL and file volumes and prove login still works.
        compose(['restart', 'mailtrain']);
        for (let i = 0; ; i++) {
            try {
                const response = await fetch(env.URL_BASE_TRUSTED + '/health');
                if (response.ok) break;
            } catch (err) {
                if (i === 119) throw err;
            }
            assert.ok(i < 119, 'Mailtrain did not become ready after restart');
            await delay(1000);
        }
        await verifyRestart();
        console.log(`Fresh install, SMTP and browser suite passed in ${((Date.now() - started) / 1000).toFixed(1)} seconds`);
    } catch (err) {
        compose(['logs', '--no-color', '--tail', '150']);
        throw err;
    } finally {
        compose(['down', '--volumes', '--remove-orphans']);
    }
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
