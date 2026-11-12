'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {promisify} = require('node:util');
const config = require('wild-config');
Object.assign(config, require('zone-mta/config/default'));
const APIServer = require('zone-mta/lib/api-server');

// Exercise ZoneMTA's real Restify routes and middleware on the supported Node
// runtime. Loading Restify 11 alone fails on Node 24's removed http_parser.
test('ZoneMTA API starts and handles authentication and JSON bodies', async t => {
    config.api = {host: '127.0.0.1', port: 0, user: 'mailtrain-test', pass: 'test-password', maildrop: false};
    const api = new APIServer();
    t.after(() => promisify(api.close.bind(api))());
    await promisify(api.start.bind(api))();
    const base = 'http://127.0.0.1:' + api.server.address().port;

    const response = await fetch(base + '/test-auth', {
        headers: {Authorization: 'Basic ' + Buffer.from('mailtrain-test:test-password').toString('base64')}
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).user, 'mailtrain-test');

    const bounced = await fetch(base + '/report-bounce', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: 'test-message', to: 'recipient@example.test', category: 'test'})
    });
    assert.equal(bounced.status, 202);
    assert.equal(await bounced.json(), 'test-message');
    const bounces = await (await fetch(base + '/bounces')).json();
    assert.equal(bounces.bounces.length, 1);
    assert.equal(bounces.bounces[0].id, 'test-message');

    const disabled = await fetch(base + '/send', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{}'
    });
    assert.equal(disabled.status, 404);
});
