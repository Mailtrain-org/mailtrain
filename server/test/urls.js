'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const path = require('node:path');

for (const prefix of ['', '/', '/email-marketing', '/email-marketing/']) {
    test('Generate message links with URL base ' + (prefix || '(root)'), () => {
        const base = 'https://example.org' + prefix;
        const result = spawnSync(process.execPath, ['-e', `
            const assert = require('node:assert/strict');
            const urls = require('./lib/urls');
            const {getMessageLinks} = require('./lib/tools');
            const base = ${JSON.stringify(base.replace(/\/$/, '') + '/')};
            for (const route of ['subscription/list', '/subscription/list']) {
                assert.equal(urls.getPublicUrl(route), base + 'subscription/list');
                assert.equal(urls.getTrustedUrl(route), base + 'subscription/list');
            }
            assert.equal(urls.getSandboxUrl('preview', {user: {restrictedAccessToken: 'token'}}), base + 'token/preview');
            assert.equal(urls.getPublicUrl('/subscription/list?c=campaign', {locale: 'de_DE'}), base + 'subscription/list?c=campaign&locale=de-DE');
            const list = {cid: 'list', public_subscribe: true};
            const campaign = {cid: 'campaign', lists: [{list: 1}]};
            const links = getMessageLinks(campaign, new Map([[1, list]]), list, {cid: 'subscriber'});
            assert.equal(links.LINK_BROWSER, base + 'archive/campaign/list/subscriber');
            assert.equal(links.LINK_UNSUBSCRIBE, base + 'subscription/list/unsubscribe/subscriber?c=campaign');
            assert.equal(links.LINK_PREFERENCES, base + 'subscription/list/manage/subscriber');
            assert.equal(links.LINK_PUBLIC_SUBSCRIBE, base + 'subscription/list');
        `], {
            cwd: path.join(__dirname, '..'),
            env: {...process.env, NODE_CONFIG: JSON.stringify({www: {publicUrlBase: base, trustedUrlBase: base, sandboxUrlBase: base}})},
            encoding: 'utf8'
        });
        assert.equal(result.status, 0, result.stderr);
    });
}
