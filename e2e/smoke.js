'use strict';

const assert = require('node:assert/strict');
const {setTimeout: delay} = require('node:timers/promises');
const {CampaignSource, CampaignStatus} = require('../shared/campaigns');
const {SubscriptionStatus, UnsubscriptionMode} = require('../shared/lists');
const {MailerType} = require('../shared/send-configurations');

async function smoke(trusted, publicBase, catcher) {
    const cookies = new Map();
    let csrf;
    async function request(route, body) {
        const response = await fetch(trusted + route, {
            method: body === undefined ? 'GET' : 'POST',
            headers: {
                Cookie: [...cookies].map(([key, value]) => key + '=' + value).join('; '),
                ...(body === undefined ? {} : {'Content-Type': 'application/json', 'X-CSRF-Token': csrf})
            },
            ...(body === undefined ? {} : {body: JSON.stringify(body)}),
            signal: AbortSignal.timeout(15000)
        });
        for (const cookie of response.headers.getSetCookie()) {
            const pair = cookie.split(';')[0];
            const index = pair.indexOf('=');
            cookies.set(pair.slice(0, index), pair.slice(index + 1));
        }
        const text = await response.text();
        assert.equal(response.status, 200, `${route}: ${response.status} ${text.slice(0, 1000)}`);
        return text;
    }
    async function rest(route, body) {
        const text = await request('/rest/' + route, body);
        return text ? JSON.parse(text) : null;
    }

    const login = await request('/login');
    csrf = login.match(/window\.csrfToken = '([^']+)'/)[1];
    await rest('login', {username: 'admin', password: 'smoke-test-password'});
    assert.equal((await rest('account')).username, 'admin');
    console.log('Authenticated as admin through /rest/login');
    // Passport regenerates the session at login. Read the current page/token.
    csrf = (await request('/')).match(/window\.csrfToken = '([^']+)'/)[1];

    const sendConfiguration = await rest('send-configurations', {
        name: 'Smoke SMTP', description: '', namespace: 1,
        from_email: 'sender@example.test', from_name: 'Mailtrain smoke', reply_to: 'sender@example.test',
        from_email_overridable: false, from_name_overridable: false, reply_to_overridable: false,
        x_mailer: 'Mailtrain', mailer_type: MailerType.GENERIC_SMTP,
        mailer_settings: {hostname: 'smtp', port: 1025, encryption: 'NONE', useAuth: false, maxConnections: 1, maxMessages: 100}
    });
    const list = await rest('lists', {
        name: 'Smoke list', description: '', namespace: 1,
        unsubscription_mode: UnsubscriptionMode.ONE_STEP, fieldWizard: 'none',
        public_subscribe: true, to_name: '', contact_email: 'sender@example.test',
        homepage: 'https://example.test', send_configuration: sendConfiguration
    });
    const recipient = 'campaign-recipient@example.test';
    const subscriber = await rest('subscriptions/' + list, {email: recipient, status: SubscriptionStatus.SUBSCRIBED, is_test: false});
    const template = await rest('templates', {
        name: 'Smoke template', description: '', namespace: 1,
        type: 'codeeditor', tag_language: 'simple', data: {},
        html: '<html><body><p>A real Mailtrain campaign.</p><a href="[LINK_UNSUBSCRIBE]">Unsubscribe</a></body></html>',
        text: 'A real Mailtrain campaign. Unsubscribe: [LINK_UNSUBSCRIBE]'
    });
    const subject = 'Mailtrain campaign smoke';
    const campaign = await rest('campaigns', {
        name: 'Smoke campaign', description: '', namespace: 1,
        source: CampaignSource.CUSTOM_FROM_TEMPLATE, data: {sourceTemplate: template},
        lists: [{list}], send_configuration: sendConfiguration, subject,
        from_name_override: null, from_email_override: null, reply_to_override: null,
        click_tracking_disabled: true, open_tracking_disabled: true
    });
    await rest('campaign-start/' + campaign, {});
    console.log(`Created template ${template}, campaign ${campaign}; sending to ${recipient}`);
    let stats;
    for (let i = 0; i < 120; i++) {
        stats = await rest('campaigns-stats/' + campaign);
        if (stats.status === CampaignStatus.FINISHED) break;
        await delay(1000);
    }
    assert.equal(stats.status, CampaignStatus.FINISHED, 'Campaign did not finish');
    await delay(2000);
    const messages = await (await fetch(catcher + '/api/v1/messages')).json();
    assert.equal(messages.total, 1, JSON.stringify(messages));
    const message = messages.messages[0];
    assert.equal(message.Subject, subject);
    assert.deepEqual(message.To.map(item => item.Address), [recipient]);
    const content = await (await fetch(catcher + '/api/v1/message/' + message.ID)).json();
    const link = content.HTML.match(/href="([^"]*\/subscription\/[^" ]*\/unsubscribe\/[^" ]*)"/);
    assert.ok(link, 'Campaign has no unsubscribe link');
    const unsubscribe = link[1].replace(/&amp;/g, '&');
    assert.equal(new URL(unsubscribe).origin, publicBase, 'Unsubscribe must use the public published port');
    const response = await fetch(unsubscribe, {signal: AbortSignal.timeout(15000)});
    assert.equal(response.status, 200, 'Public unsubscribe link failed');
    assert.equal((await rest(`subscriptions/${list}/${subscriber}`)).status, SubscriptionStatus.UNSUBSCRIBED);
    console.log(`Exactly one message received with expected subject and recipient; ${unsubscribe} returned 200 and unsubscribed the recipient`);
}

module.exports = {smoke};
