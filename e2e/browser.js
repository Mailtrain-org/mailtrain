'use strict';

const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const {login} = require('./api');

async function browserWalk(trusted, publicBase, ids, password = 'smoke-test-password', catcher) {
    const browser = await chromium.launch();
    const context = await browser.newContext({timezoneId: 'Australia/Sydney', viewport: {width: 1440, height: 1100}});
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    const failed = [];
    let checkingLogout = false;
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
        if (response.status() >= 400 && new URL(response.url()).origin === trusted && !(checkingLogout && response.url().endsWith('/rest/account'))) failed.push(response.url() + ': ' + response.status());
    });
    const acceptDialog = dialog => dialog.accept();
    page.on('dialog', acceptDialog);
    try {
        await page.goto(trusted + '/login');
        await page.locator('#form_username').fill('admin');
        await page.locator('#form_password').fill(password);
        await page.getByRole('button', {name: 'Sign in', exact: true}).click();
        await page.waitForURL(trusted + '/');
        const areas = [
            ['/lists', 'table'],
            ['/lists/create', '#form_name'],
            [`/lists/${ids.list}/edit`, '#form_name'],
            [`/lists/${ids.list}/subscriptions`, 'table'],
            [`/lists/${ids.list}/subscriptions/${ids.subscriber}/edit`, '#form_email'],
            [`/lists/${ids.list}/fields`, 'table'],
            [`/lists/${ids.list}/fields/create`, '#form_name'],
            [`/lists/${ids.list}/fields/${ids.field}/edit`, '#form_name'],
            [`/lists/${ids.list}/segments`, 'table'],
            [`/lists/${ids.list}/segments/create`, '#form_name'],
            [`/lists/${ids.list}/segments/${ids.segment}/edit`, '.rst__row'],
            [`/lists/${ids.list}/imports`, 'table'],
            [`/lists/${ids.list}/imports/create`, '#form_name'],
            ['/lists/forms', 'table'],
            ['/lists/forms/create', '#form_name'],
            ['/channels', 'table'],
            ['/channels/create', '#form_name'],
            ['/templates', 'table'],
            ['/templates/create', '#form_name'],
            [`/templates/${ids.code}/edit`, '#form_name'],
            [`/templates/${ids.mosaico}/edit`, '#form_name'],
            [`/templates/${ids.mosaicoCustom}/edit`, '#form_name'],
            [`/templates/${ids.code}/files`, 'table'],
            ['/templates/mosaico', 'table'],
            ['/templates/mosaico/create', '#form_name'],
            ['/templates/mosaico/create/versafix', '#form_name'],
            ['/templates/mosaico/create/mjml-sample', '#form_name'],
            [`/templates/mosaico/${ids.mosaicoBase}/edit`, '#form_name'],
            [`/templates/mosaico/${ids.mosaicoBase}/files`, 'table'],
            [`/templates/mosaico/${ids.mosaicoBase}/blocks`, 'table'],
            ['/campaigns', 'table'],
            ['/campaigns/create-regular', '#form_name'],
            [`/campaigns/${ids.sent}/status`, 'h2'],
            [`/campaigns/${ids.scheduled}/status`, 'h2'],
            [`/campaigns/${ids.draft}/edit`, '#form_name'],
            [`/campaigns/${ids.draft}/content`, 'iframe'],
            [`/campaigns/${ids.draft}/files`, 'table'],
            [`/campaigns/${ids.draft}/attachments`, 'table'],
            [`/campaigns/${ids.sent}/statistics`, 'h2'],
            [`/campaigns/${ids.sent}/statistics/delivered`, 'table'],
            [`/campaigns/${ids.sent}/statistics/bounced`, 'table'],
            [`/campaigns/${ids.sent}/statistics/complained`, 'table'],
            [`/campaigns/${ids.sent}/statistics/unsubscribed`, 'table'],
            [`/campaigns/${ids.sent}/statistics/clicks`, 'table'],
            [`/campaigns/${ids.sent}/statistics/opened/countries`, 'table'],
            [`/campaigns/${ids.sent}/statistics/opened/devices`, 'table'],
            ['/blacklist', 'table'],
            ['/settings', 'form'],
            ['/users', 'table'],
            ['/users/create', '#form_username'],
            [`/users/${ids.user}/edit`, '#form_username'],
            ['/namespaces', 'table'],
            ['/namespaces/create', '#form_name'],
            [`/namespaces/${ids.namespace}/edit`, '#form_name'],
            ['/send-configurations', 'table'],
            ['/send-configurations/create', '#form_name'],
            [`/send-configurations/${ids.sendConfiguration}/edit`, '#form_name'],
            ['/account', '#form_name'],
            ['/account/api', 'h2']
        ];
        for (const [route, selector] of areas) {
            await page.goto(trusted + route);
            await page.locator(selector).first().waitFor({state: 'visible'});
            await page.waitForTimeout(150);
            assert.equal(new URL(page.url()).pathname, route, 'Unexpected redirect at ' + route);
            assert.deepEqual(errors, [], 'Browser errors at ' + route);
            assert.deepEqual(failed, [], 'HTTP failures at ' + route);
            console.log('Browser opened ' + route);
        }
        const {rest} = await login(trusted, password);
        await require('./forms').dateWalk(page, trusted, ids);
        await require('./tree').segmentWalk(page, trusted, ids, rest);
        await require('./interactions').interactions(page, trusted, ids, rest, acceptDialog);
        await require('./forms').saveForms(page, trusted, ids, rest);
        const list = await rest('lists/' + ids.list);
        await page.goto(publicBase + '/subscription/' + list.cid);
        await page.locator('input[name="EMAIL"]').waitFor({state: 'visible'});
        if (catcher) await require('./forms').publicWalk(page, publicBase, catcher, list);
        await page.goto(trusted + '/');
        await page.getByRole('button', {name: 'admin', exact: true}).click();
        const logout = page.waitForResponse(r => r.url().endsWith('/rest/logout'));
        logout.catch(() => {});
        await page.getByText('Log out', {exact: true}).click();
        assert.equal((await logout).status(), 200);
        checkingLogout = true;
        const loggedOut = await page.request.get(trusted + '/rest/account');
        assert.equal((await loggedOut.json()).type, 'NotLoggedInError');
        assert.ok(loggedOut.status() >= 400);
        await page.goto(trusted + '/login/forgot');
        await page.locator('form input').first().waitFor({state: 'visible'});
        await page.goto(trusted + '/login/forgot/upgrade-user');
        await page.locator('form input').first().waitFor({state: 'visible'});
        assert.deepEqual(errors, []);
        assert.deepEqual(failed, []);
        console.log('Public subscription page opened');
        return {errors, failed};
    } catch (error) {
        console.error('Browser URL:', page.url(), 'errors:', errors, 'HTTP:', failed);
        console.error((await page.locator('body').innerText()).slice(0, 3000));
        if (process.env.E2E_SCREENSHOT) await page.screenshot({path: process.env.E2E_SCREENSHOT, fullPage: true});
        throw error;
    } finally {
        await browser.close();
    }
}

async function seedEditors(trusted, ids, password = 'smoke-test-password') {
    const browser = await chromium.launch();
    const page = await browser.newPage({viewport: {width: 1440, height: 1100}});
    page.setDefaultTimeout(15000);
    page.on('dialog', dialog => dialog.accept());
    try {
        await page.goto(trusted + '/login');
        await page.locator('#form_username').fill('admin');
        await page.locator('#form_password').fill(password);
        await page.getByRole('button', {name: 'Sign in', exact: true}).click();
        await page.waitForURL(trusted + '/');
        for (const id of [ids.mosaico, ids.mosaicoCustom]) {
            await page.goto(`${trusted}/templates/${id}/edit`);
            const editor = page.frameLocator('iframe').first();
            await editor.locator('.block-list .block:has(img[alt="Block singleArticleBlock"]) .handle').click();
            const saved = page.waitForResponse(r => r.url().endsWith('/rest/templates/' + id) && r.request().method() === 'PUT');
            saved.catch(() => {});
            await page.getByRole('button', {name: 'Save', exact: true}).click();
            assert.equal((await saved).status(), 200);
        }
        await page.goto(`${trusted}/templates/${ids.code}/edit`);
        const editor = page.frameLocator('iframe').first();
        await editor.locator('.ace_editor').click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.insertText('<p>Preserved code editor content</p><a href="[LINK_UNSUBSCRIBE]">Unsubscribe</a>');
        const saved = page.waitForResponse(r => r.url().endsWith('/rest/templates/' + ids.code) && r.request().method() === 'PUT');
        saved.catch(() => {});
        await page.getByRole('button', {name: 'Save', exact: true}).click();
        assert.equal((await saved).status(), 200);
        const {rest} = await login(trusted, password);
        for (const id of [ids.mosaico, ids.mosaicoCustom]) {
            const template = await rest('templates/' + id);
            assert.ok(template.data.model && template.html.length > 1000, 'Mosaico must save real editor content');
        }
        assert.match((await rest('templates/' + ids.code)).data.source, /Preserved code editor content/);
        console.log('Both Mosaico modes and the code editor saved real content through the browser');
    } finally {
        await browser.close();
    }
}

module.exports = {browserWalk, seedEditors};
