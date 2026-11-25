'use strict';

const {test, after, mock} = require('node:test');
const assert = require('node:assert/strict');
const {SMTPServer} = require('smtp-server');
const nodemailer = require('nodemailer');
// Sender dependencies create service timers when loaded. Keep them out of this SMTP test.
const setInterval = global.setInterval;
const timerMock = mock.method(global, 'setInterval', (...args) => setInterval(...args).unref());
const {MessageSender} = require('../lib/message-sender');
const mailers = require('../lib/mailers');
const subscriptions = require('../models/subscriptions');
const blacklist = require('../models/blacklist');
const knex = require('../lib/knex');
timerMock.mock.restore();

after(() => knex.destroy());

test('Send copies to SMTP recipients with and without VERP', async t => {
    const deliveries = [];
    const server = new SMTPServer({
        disabledCommands: ['AUTH', 'STARTTLS'],
        onData(stream, session, callback) {
            const chunks = [];
            stream.on('data', chunk => chunks.push(chunk));
            stream.on('end', () => {
                deliveries.push({
                    envelope: session.envelope,
                    message: Buffer.concat(chunks).toString()
                });
                callback();
            });
        }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

    const transport = nodemailer.createTransport({
        host: '127.0.0.1',
        port: server.server.address().port,
        ignoreTLS: true
    });
    t.after(() => {
        transport.close();
        return new Promise(resolve => server.close(resolve));
    });

    mock.method(blacklist, 'isBlacklisted', async () => false);
    mock.method(subscriptions, 'getById', async () => ({cid: 'subscriber', email: 'reader@example.com'}));
    mock.method(mailers, 'getOrCreateMailer', async () => ({
        throttleWait: async () => {},
        sendMassMail: mail => transport.sendMail(mail),
        sendTransactionalMail: mail => transport.sendMail(mail)
    }));
    t.after(() => mock.restoreAll());

    for (const useVerp of [false, true]) {
        const sender = new MessageSender();
        sender.sendConfiguration = {
            id: 1,
            from_email: 'sender@example.com',
            cc: 'Copy <copy@example.com>, second@example.com',
            bcc: 'hidden@example.com',
            verp_hostname: 'bounce.example.com'
        };
        sender.campaign = {cid: 'campaign'};
        sender.subject = 'Copies';
        sender.isMassMail = true;
        sender.useVerp = useVerp;
        sender.listsById = new Map([[1, {id: 1, cid: 'list', name: 'List', to_name: null, listunsubscribe_disabled: true}]]);
        sender.listsFieldsGrouped = new Map([[1, []]]);
        mock.method(sender, '_getMessage', async () => ({html: '<p>Hello</p>', text: 'Hello'}));

        await sender._sendMessage({listId: 1, subscriptionId: 1, mergeTags: {}});
        const delivery = deliveries.pop();
        assert.deepEqual(delivery.envelope.rcptTo.map(recipient => recipient.address).sort(),
            ['reader@example.com', 'copy@example.com', 'second@example.com', 'hidden@example.com'].sort());
        assert.equal(delivery.envelope.mailFrom.address, useVerp ? 'campaign.list.subscriber@bounce.example.com' : 'sender@example.com');
        assert.match(delivery.message, /^Cc: Copy <copy@example.com>, second@example.com\r?$/m);
        assert.doesNotMatch(delivery.message, /^Bcc:/mi);

        sender.isMassMail = false;
        await sender._sendMessage({to: {address: 'transactional@example.com'}, mergeTags: {}});
        assert.deepEqual(deliveries.pop().envelope.rcptTo.map(recipient => recipient.address).sort(),
            ['transactional@example.com', 'copy@example.com', 'second@example.com', 'hidden@example.com'].sort());
    }
});

test('Send a transactional message through the Amazon SES v2 transport', async t => {
    const {SESv2Client, SendEmailCommand} = require('@aws-sdk/client-sesv2');
    const sendConfigurations = require('../models/send-configurations');
    const settings = require('../models/settings');
    const {MailerType} = require('../../shared/send-configurations');
    const credentials = {accessKeyId: 'fixture-key', secretAccessKey: 'fixture-secret'};
    const {default: PQueue} = await import('p-queue');
    const admissions = [];
    const add = PQueue.prototype.add;
    t.mock.timers.enable({apis: ['Date', 'setTimeout'], now: 0});
    // SES message assembly can move the SDK call away from the queue admission time.
    t.mock.method(PQueue.prototype, 'add', function (task, options) {
        return add.call(this, context => {
            admissions.push(Date.now());
            return task(context);
        }, options);
    });

    t.mock.method(sendConfigurations, 'getSystemSendConfiguration', async () => ({
        id: 2,
        mailer_type: MailerType.AWS_SES,
        mailer_settings: {
            key: credentials.accessKeyId, secret: credentials.secretAccessKey, region: 'us-east-1',
            maxConnections: 1, throttling: 3600
        }
    }));
    t.mock.method(settings, 'get', async () => ({}));

    const send = t.mock.method(SESv2Client.prototype, 'send', async function (command) {
        assert.ok(command instanceof SendEmailCommand);
        assert.equal(await this.config.region(), 'us-east-1');
        const resolved = await this.config.credentials();
        assert.equal(resolved.accessKeyId, credentials.accessKeyId);
        assert.equal(resolved.secretAccessKey, credentials.secretAccessKey);
        assert.deepEqual(command.input.Destination.ToAddresses, ['reader@example.com']);
        assert.match(Buffer.from(command.input.Content.Raw.Data).toString(), /^Subject: Transactional fixture\r?$/m);
        return {MessageId: 'fixture-message'};
    });

    const mailer = await mailers.getOrCreateMailer();
    const message = () => ({
        from: 'sender@example.com', to: 'reader@example.com', subject: 'Transactional fixture', text: 'Hello'
    });
    const first = mailer.sendTransactionalMail(message());
    const second = mailer.sendTransactionalMail(message());

    assert.equal((await first).response, 'fixture-message');
    assert.deepEqual(admissions, [0]);
    t.mock.timers.tick(999);
    assert.deepEqual(admissions, [0]);
    t.mock.timers.tick(1);

    assert.equal((await second).response, 'fixture-message');
    assert.deepEqual(admissions, [0, 1000]);
    assert.equal(send.mock.callCount(), 2);
});
