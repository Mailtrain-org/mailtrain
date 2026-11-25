'use strict';

const assert = require('assert').strict;
const {test, before, after} = require('node:test');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const https = require('https');
const {EventEmitter} = require('events');
const {Readable} = require('stream');
const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const path = require('path');
const config = require('../lib/config');
const webhookAuth = require('../lib/webhook-auth');
const {formatTemplate, getTemplate} = require('../lib/tools');
const {TagLanguages} = require('../../shared/templates');
const {CampaignMessageStatus} = require('../../shared/campaigns');
const {MailerType} = require('../../shared/send-configurations');
const {notificationV1, notificationV2, confirmation} = require('./fixtures/sns-messages.json');
const cert = fs.readFileSync(path.join(__dirname, 'fixtures', 'sns-test-cert.pem'));

const calls = [];
const snsRequests = [];
const campaignMessage = {id: 1};
let nextSnsStatus = 200;
let server;

require.cache[require.resolve('../models/campaigns')] = {exports: {
    async getMessageByCid() {},
    async getMessageByResponseId(id) {
        calls.push(['lookup', id]);
        return id === 'test-message' ? campaignMessage : undefined;
    },
    async changeStatusByMessage(context, message, status, updateSubscription) {
        calls.push(['change', message, status, updateSubscription]);
    }
}};
require.cache[require.resolve('../models/send-configurations')] = {exports: {
    async getByCid() {
        return {
            mailer_type: MailerType.ZONE_MTA,
            mailer_settings: {dkimApiKey: 'test-dkim-key', dkimSelector: 'test', dkimPrivateKey: 'test-only-key'}
        };
    }
}};
require.cache[require.resolve('../lib/message-sender')] = {exports: {
    async getMessage(campaign) {
        return {html: campaign === 'raw' ? '<html><body>Test archive</body></html>' : '<p>Test archive</p>'};
    }
}};

const originalHttpsGet = https.get;

before(async () => {
    https.get = (url, options, onResponse) => {
        assert.equal(options.rejectUnauthorized, true);
        snsRequests.push(url.href);
        const request = new EventEmitter();
        process.nextTick(() => {
            const response = new Readable({
                read() {
                    this.push(cert);
                    this.push(null);
                }
            });
            response.statusCode = nextSnsStatus;
            response.headers = {location: 'https://example.invalid/'};
            response.on('close', () => request.emit('close'));
            response.on('end', () => request.emit('close'));
            onResponse(response);
        });
        return request;
    };

    const app = express();
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, '..', 'views'));
    app.locals.uaCode = 'UA-TEST-1';
    hbs.registerPartials(path.join(__dirname, '..', 'views', 'partials'));

    app.use(bodyParser.text({verify: webhookAuth.captureSignedBody}));
    app.use(bodyParser.json({verify: webhookAuth.captureSignedBody}));
    app.use('/webhooks', require('../routes/webhooks'));
    app.use('/archive', require('../routes/archive'));

    await new Promise(resolve => {
        server = app.listen(0, '127.0.0.1', resolve);
    });
});

after(async () => {
    https.get = originalHttpsGet;
    await new Promise(resolve => server.close(resolve));
});

function request(route, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            host: '127.0.0.1', port: server.address().port, method: body === undefined ? 'GET' : 'POST',
            path: route, headers
        }, res => {
            let text = '';
            res.setEncoding('utf8');
            res.on('data', chunk => { text += chunk; });
            res.on('end', () => resolve({status: res.statusCode, headers: res.headers, text}));
        });
        req.on('error', reject);
        req.end(body);
    });
}

function postAws(message) {
    return request('/webhooks/aws', JSON.stringify(message), {'Content-Type': 'text/plain'});
}

test('simple merge tags escape markup and preserve line breaks, links, plain text and numbers', () => {
    const data = {FIELD: '<b>"A & B"</b>\r\nnext\rline\nlast', COUNT: 0, LINK: 'https://example.invalid/?a=1&b=2', EMPTY: null};
    assert.equal(
        formatTemplate('[FIELD] [COUNT] <a href="[LINK]">[EMPTY/fallback]</a> [EMPTY.NESTED]', TagLanguages.SIMPLE, data, true),
        '&lt;b&gt;&quot;A &amp; B&quot;&lt;/b&gt;<br/>next<br/>line<br/>last 0 <a href="https://example.invalid/?a=1&amp;b=2">fallback</a> [EMPTY.NESTED]'
    );
    assert.equal(formatTemplate('[FIELD]', TagLanguages.SIMPLE, {FIELD: '<b>hello</b>'}, false), 'hello');
    assert.equal(formatTemplate('[COUNT]', TagLanguages.SIMPLE, data, false), '0');
});

test('both archive layouts restrict scripts and permit configured tracking with a nonce', async () => {
    const nonces = [];
    for (const layout of ['raw', 'wrapped']) {
        const response = await request('/archive/' + layout + '/list/subscriber');
        assert.equal(response.status, 200);
        const policy = response.headers['content-security-policy'];
        const nonce = /'nonce-([^']+)'/.exec(policy)[1];
        assert.ok(policy.includes("'strict-dynamic'"));
        assert.ok(response.text.includes('<script nonce="' + nonce + '">'));
        nonces.push(nonce);
    }
    assert.notEqual(nonces[0], nonces[1]);
});

test('signed SNS notifications reach the campaign boundary for both signature versions', async () => {
    for (const message of [notificationV1, notificationV2]) {
        calls.length = 0;
        assert.equal((await postAws(message)).status, 200);
        assert.deepEqual(calls, [
            ['lookup', 'test-message'],
            ['change', campaignMessage, CampaignMessageStatus.BOUNCED, true]
        ]);
    }
});

test('an invalid SNS signature returns 403 before looking up a campaign', async () => {
    calls.length = 0;
    assert.equal((await postAws({...notificationV2, Subject: 'Changed subject'})).status, 403);
    assert.equal((await postAws({...notificationV2, Signature: notificationV1.Signature})).status, 403);
    assert.equal(calls.length, 0);
});

test('an unexpected SNS topic is rejected before certificate download', async () => {
    const original = config.webhooks.awsTopicArns;
    config.webhooks.awsTopicArns = ['arn:aws:sns:us-east-1:123456789012:other-topic'];
    snsRequests.length = 0;
    try {
        assert.equal((await postAws(notificationV2)).status, 403);
        assert.deepEqual(snsRequests, []);
    } finally {
        config.webhooks.awsTopicArns = original;
    }
});

test('a non-Amazon certificate or confirmation host is rejected without a request', async () => {
    snsRequests.length = 0;
    assert.equal((await postAws({...notificationV2, SigningCertURL: 'https://example.invalid/cert.pem'})).status, 403);
    assert.equal((await postAws({...confirmation, SubscribeURL: 'https://example.invalid/confirmation'})).status, 403);
    assert.deepEqual(snsRequests, []);
});

test('SNS certificate redirects are rejected without a second request', async () => {
    snsRequests.length = 0;
    nextSnsStatus = 302;
    try {
        assert.equal((await postAws(notificationV2)).status, 403);
        assert.deepEqual(snsRequests, [notificationV2.SigningCertURL]);
    } finally {
        nextSnsStatus = 200;
    }
});

test('a signed China-region confirmation reaches the verified subscription URL', async () => {
    snsRequests.length = 0;
    assert.equal((await postAws(confirmation)).status, 200);
    assert.deepEqual(snsRequests, [confirmation.SigningCertURL, confirmation.SubscribeURL]);
});

test('configured provider checks verify authentication and preserve unconfigured callbacks', async () => {
    const {privateKey: ecPrivate, publicKey: ecPublic} = crypto.generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        publicKeyEncoding: {type: 'spki', format: 'der'},
        privateKeyEncoding: {type: 'pkcs8', format: 'pem'}
    });
    const {privateKey: rsaPrivate, publicKey: rsaPublic} = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {type: 'spki', format: 'pem'},
        privateKeyEncoding: {type: 'pkcs8', format: 'pem'}
    });

    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = '{ "event": "Test event" }';
    const mailgun = {timestamp, token: 'test-token'};
    mailgun.signature = crypto.createHmac('sha256', 'test-mailgun').update(timestamp + mailgun.token).digest('hex');
    const sign = (algorithm, key, text) => crypto.createSign(algorithm).update(text).sign(key, 'base64');
    const providers = [
        ['sparkpost', 'sparkpostToken', 'test-sparkpost', '[]', {'X-Mailtrain-Webhook-Token': 'test-sparkpost'}],
        ['sendgrid', 'sendgridPublicKey', ecPublic.toString('base64'), '[  ]', {
            'X-Twilio-Email-Event-Webhook-Timestamp': timestamp,
            'X-Twilio-Email-Event-Webhook-Signature': sign('sha256', ecPrivate, timestamp + '[  ]')
        }],
        ['mailgun', 'mailgunSigningKey', 'test-mailgun', JSON.stringify(mailgun), {}],
        ['zone-mta', 'zoneMtaToken', 'test-zone', body, {Authorization: 'Basic ' + Buffer.from('mailtrain:test-zone').toString('base64')}],
        ['postal', 'postalPublicKey', rsaPublic, body, {'X-Postal-Signature-256': sign('RSA-SHA256', rsaPrivate, body)}],
        ['postal', 'postalPublicKey', rsaPublic, body, {'X-Postal-Signature': sign('RSA-SHA1', rsaPrivate, body)}]
    ];

    const json = {'Content-Type': 'application/json'};
    for (const [route, setting, key, payload, headers] of providers) {
        const target = '/webhooks/' + route;
        assert.equal((await request(target, '{}', json)).status, 200, route + ' legacy');
        config.webhooks[setting] = key;
        try {
            assert.equal((await request(target, '{}', json)).status, 403, route + ' missing auth');
            assert.equal((await request(target, payload, {...json, ...headers})).status, 200, route + ' valid auth');
        } finally {
            config.webhooks[setting] = '';
        }
    }
});

test('ZoneMTA only returns DKIM material for the configured key and sets no-store', async () => {
    const route = '/webhooks/zone-mta/sender-config/test-config';
    const json = {'Content-Type': 'application/json'};
    assert.equal((await request(route, '{}', json)).status, 403);
    const denied = await request(route + '?api_token=test-wrong', '{}', json);
    assert.equal(denied.status, 403);
    assert.ok(!denied.text.includes('test-only-key'));

    const accepted = await request(route + '?api_token=test-dkim-key', '{"from":"sender@example.invalid"}', json);
    assert.equal(accepted.status, 200);
    assert.equal(accepted.headers['cache-control'], 'no-store');
    assert.deepEqual(JSON.parse(accepted.text).dkim.keys, [
        {domainName: 'example.invalid', keySelector: 'test', privateKey: 'test-only-key'}
    ]);
});

test('MJML forms render without reading include files', async t => {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'mailtrain-mjml-'));
    t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
    const fixture = path.join(directory, 'fragment.mjml');
    fs.writeFileSync(fixture, '<mj-section><mj-column><mj-text>Local fixture fragment</mj-text></mj-column></mj-section>');

    const render = await getTemplate({
        type: 'mjml',
        template: '<mj-section><mj-column><mj-text>Inline content</mj-text></mj-column></mj-section>' +
            '<mj-include path="' + fixture + '" />',
        layout: '<mjml><mj-body>{{{body}}}</mj-body></mjml>'
    }, 'en-US');
    const html = render({});
    assert.match(html, /Inline content/);
    assert.doesNotMatch(html, /Local fixture fragment/);
});
