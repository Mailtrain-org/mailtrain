'use strict';

const assert = require('node:assert/strict');

async function dateWalk(page, trusted, ids) {
    await page.goto(`${trusted}/lists/${ids.list}/subscriptions/${ids.subscriber}/edit`);
    const date = page.locator('#form_' + ids.dateColumn);
    await date.fill('2001-02-03');
    await date.locator('..').getByRole('button').click();
    assert.match(await page.locator('.rdp-caption_label').innerText(), /February 2001/, 'Calendar must open at its selected date');
    await date.locator('..').getByRole('button').click();
    const birthday = page.locator('#form_' + ids.birthdayColumn);
    await birthday.fill('03/02');
    await birthday.locator('..').getByRole('button').click();
    assert.equal(await page.locator('.rdp-caption_label').innerText(), 'February', 'Birthday calendar must omit the synthetic year');
    await page.locator('.rdp-day_button').filter({hasText: /^4$/}).click();
    assert.equal(await birthday.inputValue(), '04/02');
    const saved = page.waitForResponse(r => r.url().endsWith(`/rest/subscriptions/${ids.list}/${ids.subscriber}`) && r.request().method() === 'PUT');
    saved.catch(() => {});
    await page.getByRole('button', {name: 'Save', exact: true}).click();
    assert.equal((await saved).status(), 200);
    console.log('Date and birthday picker selected month/selection passed');
}

async function saveForms(page, trusted, ids, rest) {
    for (const [route, endpoint] of [
        [`/lists/${ids.list}/edit`, `lists/${ids.list}`],
        [`/namespaces/${ids.namespace}/edit`, `namespaces/${ids.namespace}`],
        [`/users/${ids.user}/edit`, `users/${ids.user}`],
        [`/send-configurations/${ids.sendConfiguration}/edit`, `send-configurations-private/${ids.sendConfiguration}`]
    ]) {
        await page.goto(trusted + route);
        const original = await page.locator('#form_name').inputValue();
        await page.locator('#form_name').fill(original + ' browser');
        const saved = page.waitForResponse(response => response.request().method() === 'PUT' && response.status() === 200);
        saved.catch(() => {});
        await page.getByRole('button', {name: 'Save', exact: true}).click();
        await saved;
        assert.equal((await rest(endpoint)).name, original + ' browser');
        console.log('Browser saved ' + route);
    }
    await page.goto(trusted + '/settings');
    await page.locator('#form_defaultHomepage').fill('https://example.test/browser-home');
    const settingsSaved = page.waitForResponse(r => r.url().endsWith('/rest/settings') && r.request().method() === 'PUT');
    settingsSaved.catch(() => {});
    await page.getByRole('button', {name: 'Save', exact: true}).click();
    assert.equal((await settingsSaved).status(), 200);
    assert.equal((await rest('settings')).defaultHomepage, 'https://example.test/browser-home');
    await page.goto(trusted + '/account/api');
    const oldToken = await rest('access-token');
    const tokenReset = page.waitForResponse(r => r.url().endsWith('/rest/access-token-reset'));
    tokenReset.catch(() => {});
    await page.getByRole('button', {name: /^reset access token$/i}).click();
    assert.equal((await tokenReset).status(), 200);
    assert.notEqual(await rest('access-token'), oldToken);
    console.log('Settings and personal API token browser save/reset passed');
    await rest('blacklist/blocked-browser@example.test', undefined, 'DELETE');
    await page.goto(trusted + '/blacklist');
    await page.locator('#form_email').fill('blocked-browser@example.test');
    const added = page.waitForResponse(r => r.url().endsWith('/rest/blacklist') && r.request().method() === 'POST');
    added.catch(() => {});
    await page.getByRole('button', {name: /add/i}).last().click();
    assert.equal((await added).status(), 200);
    await page.getByRole('cell', {name: 'blocked-browser@example.test', exact: true}).waitFor({state: 'visible'});
    console.log('Blacklist browser add/readback passed');
}

module.exports = {dateWalk, saveForms};

async function publicWalk(page, publicBase, catcher, list) {
    const {setTimeout: delay} = require('node:timers/promises');
    const email = 'public-browser-' + Date.now().toString(36) + '@example.test';
    async function messageLink(pattern, recipient = email) {
        for (let i = 0; i < 120; i++) {
            const messages = await (await fetch(catcher + '/api/v1/messages')).json();
            for (const message of messages.messages.filter(item => item.To.some(to => to.Address === recipient))) {
                const content = await (await fetch(catcher + '/api/v1/message/' + message.ID)).json();
                const link = content.HTML.match(pattern);
                if (link) {
                    const url = link[1].replace(/&amp;/g, '&');
                    assert.equal(new URL(url).origin, publicBase);
                    return url;
                }
            }
            await delay(250);
        }
        throw new Error('Public subscription email/link was not received');
    }
    await page.goto(publicBase + '/subscription/' + list.cid);
    await page.locator('input[name="EMAIL"]').fill(email);
    await page.locator('form [type="submit"]').click();
    await page.waitForURL(/confirm-subscription-notice/);
    const confirm = await messageLink(/href="([^"]*\/subscription\/confirm\/subscribe\/[^" ]*)"/);
    assert.equal((await page.goto(confirm)).status(), 200);
    await page.waitForURL(/subscribed-notice/);
    const preferences = await messageLink(/href="([^"]*\/subscription\/[^" ]*\/manage\/[^" ]*)"/);
    await page.goto(preferences);
    await page.locator('input[name="COMPANY"]').fill('Public preferences');
    await page.locator('form [type="submit"]').click();
    await page.waitForURL(/updated-notice/);
    await page.goto(preferences);
    assert.equal(await page.locator('input[name="COMPANY"]').inputValue(), 'Public preferences');
    assert.equal((await page.goto(preferences.replace('/manage/', '/manage-address/'))).status(), 200);
    await page.locator('input[name="EMAIL"]').waitFor({state: 'visible'});
    const unsubscribe = await messageLink(/href="([^"]*\/subscription\/[^" ]*\/unsubscribe\/[^" ]*)"/);
    assert.equal((await page.goto(unsubscribe)).status(), 200);
    await page.waitForURL(/unsubscribed-notice/);
    assert.equal((await page.request.get(preferences)).status(), 404);
    assert.equal((await page.goto(publicBase + '/subscription/' + list.cid + '/privacy-policy')).status(), 200);
    console.log('Public subscribe/email confirmation/preferences/address/unsubscribe/privacy pages passed');
}

module.exports.publicWalk = publicWalk;
