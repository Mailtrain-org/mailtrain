'use strict';

const assert = require('node:assert/strict');
const {setTimeout: delay} = require('node:timers/promises');
const {login} = require('./api');

async function supportedFixture(trusted, v2 = false, password = 'smoke-test-password') {
    const {rest, request} = await login(trusted, password);
    const ids = {};
    ids.token = await rest('access-token-reset', {});
    ids.namespace = await rest('namespaces', {name: 'Upgrade namespace', description: 'Preserved namespace', namespace: 1});
    ids.user = await rest('users', {
        username: 'upgrade-user', name: 'Upgrade user', email: 'upgrade-user@example.test',
        password: 'Upgrade-user-password-79!', namespace: ids.namespace, role: v2 ? 'master' : 'globalMaster'
    });
    ids.roles = {};
    for (const role of v2 ? ['campaignsAdmin', 'campaignsAdminWithoutNamespace', 'nobody'] : ['campaignsAdmin', 'none']) {
        ids.roles[role] = await rest('users', {
            username: 'upgrade-' + role.toLowerCase(), name: role, email: role.toLowerCase() + '@example.test',
            password: 'Upgrade-user-password-79!', namespace: ids.namespace, role
        });
        if (role === 'campaignsAdminWithoutNamespace') {
            await rest('shares', {entityTypeId: 'namespace', entityId: ids.namespace, userId: ids.roles[role], role: 'campaignsAdmin'}, 'PUT');
        }
    }
    ids.sendConfiguration = await rest('send-configurations', {
        name: 'Upgrade SMTP', description: '', namespace: ids.namespace,
        from_email: 'sender@example.test', from_name: 'Upgrade sender', reply_to: 'sender@example.test',
        from_email_overridable: false, from_name_overridable: false, reply_to_overridable: false,
        x_mailer: 'Mailtrain', mailer_type: 'generic_smtp',
        mailer_settings: {hostname: 'smtp', port: 1025, encryption: 'NONE', useAuth: false, maxConnections: 1, maxMessages: 100}
    });
    ids.list = await rest('lists', {
        name: 'Upgrade list', description: 'Preserved list', namespace: ids.namespace,
        unsubscription_mode: 0, fieldWizard: 'none', public_subscribe: true, to_name: '',
        contact_email: 'sender@example.test', homepage: 'https://example.test', send_configuration: ids.sendConfiguration
    });
    ids.field = await rest('fields/' + ids.list, {
        name: 'Company', help: 'Your company', key: 'COMPANY', type: 'text', default_value: '', required: false,
        settings: {}, orderListBefore: 'end', orderSubscribeBefore: 'end', orderManageBefore: 'end'
    });
    ids.dateField = await rest('fields/' + ids.list, {
        name: 'Anniversary', help: '', key: 'ANNIVERSARY', type: 'date', default_value: null, required: false,
        settings: {dateFormat: 'intl'}, orderListBefore: 'end', orderSubscribeBefore: 'end', orderManageBefore: 'end'
    });
    ids.birthdayField = await rest('fields/' + ids.list, {
        name: 'Birthday', help: '', key: 'BIRTHDAY', type: 'birthday', default_value: null, required: false,
        settings: {dateFormat: 'eur'}, orderListBefore: 'end', orderSubscribeBefore: 'end', orderManageBefore: 'end'
    });
    const fields = await rest('fields/' + ids.list);
    ids.dateColumn = fields.find(field => field.id === ids.dateField).column;
    ids.birthdayColumn = fields.find(field => field.id === ids.birthdayField).column;
    ids.column = fields.find(field => field.id === ids.field).column;
    ids.subscriber = await rest('subscriptions/' + ids.list, {
        email: 'upgrade-recipient@example.test', status: 1, is_test: true, [ids.column]: 'Preserved company'
    });
    ids.segment = await rest('segments/' + ids.list, {
        name: 'Nested upgrade segment', settings: {rootRule: {type: 'all', rules: [
            {type: 'some', rules: [{type: 'eq', column: ids.column, value: 'Preserved company'}]},
            {type: 'eq', column: 'email', value: 'upgrade-recipient@example.test'}
        ]}}
    });
    ids.code = await rest('templates', {
        name: 'Upgrade code template', description: '', namespace: ids.namespace,
        type: 'codeeditor', tag_language: 'simple', data: {sourceType: 'html', source: '<p>Preserved code</p>'},
        html: '<p>Preserved code</p><a href="[LINK_UNSUBSCRIBE]">Unsubscribe</a>', text: 'Preserved code [LINK_UNSUBSCRIBE]'
    });
    ids.mosaico = await rest('templates', {
        name: 'Upgrade Mosaico template', description: '', namespace: ids.namespace,
        type: 'mosaicoWithFsTemplate', tag_language: 'simple', data: {mosaicoFsTemplate: 'versafix-1'}, html: '', text: ''
    });
    const mosaicoHtml = await request('/static/mosaico/templates/versafix-1/template-versafix-1.html');
    ids.mosaicoBase = await rest('mosaico-templates', {
        name: 'Upgrade Mosaico base', description: '', namespace: ids.namespace,
        type: 'html', tag_language: 'simple', data: {html: mosaicoHtml}
    });
    ids.mosaicoCustom = await rest('templates', {
        name: 'Upgrade custom Mosaico template', description: '', namespace: ids.namespace,
        type: 'mosaico', tag_language: 'simple', data: {mosaicoTemplate: ids.mosaicoBase}, html: '', text: ''
    });
    for (const [type, subType, id] of [['template', 'file', ids.code], ['template', 'file', ids.mosaico], ['mosaicoTemplate', 'file', ids.mosaicoBase], ['mosaicoTemplate', 'block', ids.mosaicoBase]]) {
        const upload = new FormData();
        upload.append('files[]', new Blob(['Preserved upload for ' + id], {type: 'text/plain'}), 'upgrade-file.txt');
        await request(`/rest/files/${type}/${subType}/${id}`, upload, 'POST', true);
    }
    ids.channel = await rest('channels', {
        name: 'Upgrade channel', description: '', namespace: ids.namespace, cpg_name: 'Channel campaign', cpg_description: '',
        source: 1, data: {sourceTemplate: ids.code}, lists: [{list: ids.list}], send_configuration: ids.sendConfiguration,
        subject: 'Channel subject', from_name_override: null, from_email_override: null, reply_to_override: null,
        click_tracking_disabled: true, open_tracking_disabled: true
    });
    const campaign = name => rest('campaigns', {
        name, description: '', namespace: ids.namespace, ...(v2 ? {type: 1} : {}), source: 3,
        data: {sourceTemplate: ids.code}, lists: [{list: ids.list}], send_configuration: ids.sendConfiguration,
        subject: name, from_name_override: null, from_email_override: null, reply_to_override: null,
        click_tracking_disabled: true, open_tracking_disabled: true
    });
    ids.sent = await campaign('Upgrade sent campaign');
    await rest('campaign-start/' + ids.sent, {});
    let stats;
    for (let i = 0; i < 120; i++) {
        stats = await rest('campaigns-stats/' + ids.sent);
        if (stats.status === 3) break;
        await delay(1000);
    }
    assert.equal(stats.status, 3, 'v2 campaign must really finish');
    ids.scheduled = await campaign('Upgrade scheduled campaign');
    ids.startAt = new Date(Date.now() + 7 * 86400000).toISOString();
    await rest('campaign-start-at/' + ids.scheduled, {startAt: ids.startAt, timezone: 'UTC'});
    ids.draft = await campaign('Upgrade draft campaign');
    const upload = new FormData();
    upload.append('files[]', new Blob(['Preserved campaign attachment'], {type: 'text/plain'}), 'attachment.txt');
    await request(`/rest/files/campaign/attachment/${ids.draft}`, upload, 'POST', true);
    return ids;
}

module.exports = {supportedFixture};
