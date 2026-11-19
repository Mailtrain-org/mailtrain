'use strict';

const assert = require('node:assert/strict');
const {setTimeout: delay} = require('node:timers/promises');

async function interactions(page, trusted, ids, rest, acceptDialog) {
    // Exercise real CSV intake/preparation, mapping, execution and export.
    await page.goto(`${trusted}/lists/${ids.list}/imports/create`);
    await page.locator('input[type="file"]').setInputFiles({
        name: 'browser-import.csv', mimeType: 'text/csv', buffer: Buffer.from('EMAIL,COMPANY\nimported@example.test,Imported company\n')
    });
    await page.locator('#form_name').fill('Browser CSV import');
    console.log('Import buttons:', await page.getByRole('button').allTextContents());
    const created = page.waitForResponse(response => response.url().endsWith('/rest/imports/' + ids.list) && response.request().method() === 'POST');
    created.catch(() => {});
    await page.getByRole('button', {name: /save/i}).first().click();
    const response = await created;
    assert.equal(response.status(), 200, 'CSV upload must succeed');
    const importId = await response.json();
    let entity;
    for (let i = 0; i < 60; i++) {
        entity = await rest(`imports/${ids.list}/${importId}`);
        if ([3, 4].includes(entity.status)) break;
        await delay(500);
    }
    assert.equal(entity.status, 3, 'CSV preparation failed: ' + entity.error);
    console.log('CSV prepared', importId);

    await page.goto(`${trusted}/lists/${ids.list}/imports/${importId}/edit`);
    await page.locator('#form_mapping_fields_email_column').selectOption('column_0');
    await page.locator('#form_mapping_fields_' + ids.column + '_column').selectOption('column_1');
    await page.getByRole('button', {name: /save and run/i}).click();
    for (let i = 0; i < 60; i++) {
        entity = await rest(`imports/${ids.list}/${importId}`);
        if ([8, 9].includes(entity.status)) break;
        await delay(500);
    }
    assert.equal(entity.status, 8, 'CSV import run failed: ' + entity.error);
    const exported = await page.request.get(`${trusted}/subscriptions/export/${ids.list}/0`);
    assert.equal(exported.status(), 200);
    assert.match(await exported.text(), /imported@example.test/);
    await page.goto(`${trusted}/campaigns/${ids.sent}/statistics`);
    const downloadPending = page.waitForEvent('download');
    downloadPending.catch(() => {});
    await page.getByRole('link', {name: 'Open and click counts per currently subscribed subscriber'}).click();
    const download = await downloadPending;
    assert.equal(await download.failure(), null);
    console.log('CSV import/mapping/run/subscriber export and quick-report download passed');

    // Cancellation must preserve both the URL and the mounted form contents.
    page.off('dialog', acceptDialog);
    async function dialogAction(action, accept, expectedType = 'confirm') {
        const pendingDialog = page.waitForEvent('dialog');
        pendingDialog.catch(() => {});
        const pendingAction = action();
        pendingAction.catch(() => {}); // A navigation timeout must not become an unhandled rejection while awaiting its dialog.
        const dialog = await pendingDialog;
        assert.equal(dialog.type(), expectedType);
        await (accept ? dialog.accept() : dialog.dismiss());
        await pendingAction.catch(error => {
            if (expectedType !== 'beforeunload' || accept) throw error;
        });
    }
    await page.goto(trusted + '/lists');
    await page.locator('header a[href="/templates"]').click();
    await page.waitForURL(trusted + '/templates');
    await page.locator('header a[href="/campaigns"]').click();
    await page.waitForURL(trusted + '/campaigns');
    await page.locator('header a[href="/lists"]').click();
    await page.waitForURL(trusted + '/lists');
    await page.locator('a[href="/lists/create"]').click();
    await page.locator('#form_name').fill('Unsaved list');
    await dialogAction(() => page.locator('header a[href="/templates"]').click(), false);
    assert.equal(new URL(page.url()).pathname, '/lists/create');
    assert.equal(await page.locator('#form_name').inputValue(), 'Unsaved list');
    await dialogAction(() => page.goBack(), false);
    await page.waitForURL(trusted + '/lists/create');
    assert.equal(await page.locator('#form_name').inputValue(), 'Unsaved list');
    const originalIndex = await page.evaluate(() => history.state.mailtrainHistoryIndex);
    let rapidDialogs = 0;
    const dismissRapid = async dialog => { rapidDialogs++; await dialog.dismiss(); };
    page.on('dialog', dismissRapid);
    await page.evaluate(() => { history.back(); history.back(); });
    await page.waitForTimeout(750);
    await page.evaluate(() => { history.go(-2); history.forward(); });
    await page.waitForTimeout(750);
    page.off('dialog', dismissRapid);
    assert.equal(new URL(page.url()).pathname, '/lists/create', 'Repeated back must preserve the cancelled form');
    assert.equal(await page.evaluate(() => history.state.mailtrainHistoryIndex), originalIndex);
    assert.equal(await page.locator('#form_name').inputValue(), 'Unsaved list');
    assert.ok(rapidDialogs >= 1);
    await dialogAction(() => page.reload(), false, 'beforeunload');
    assert.equal(await page.locator('#form_name').inputValue(), 'Unsaved list');
    await dialogAction(() => page.goBack(), true);
    await page.waitForURL(trusted + '/lists');
    await page.goForward();
    await page.waitForURL(trusted + '/lists/create');
    await page.locator('header a[href="/templates"]').click();
    await page.waitForURL(trusted + '/templates');
    await page.goBack();
    await page.waitForURL(trusted + '/lists/create');
    await page.locator('#form_name').fill('Forward unsaved');
    await dialogAction(() => page.goForward(), false);
    await page.waitForURL(trusted + '/lists/create');
    assert.equal(await page.locator('#form_name').inputValue(), 'Forward unsaved');
    await dialogAction(() => page.goForward(), true);
    await page.waitForURL(trusted + '/templates');
    await page.goto(trusted + '/lists/create');
    await page.locator('#form_name').fill('Reload unsaved');
    await dialogAction(() => page.reload(), true, 'beforeunload');
    assert.equal(await page.locator('#form_name').inputValue(), '');
    page.on('dialog', acceptDialog);
    console.log('Dirty form link/back/forward/reload cancellation and acceptance passed');

    await page.goto(`${trusted}/campaigns/${ids.draft}/status`);
    await page.locator(`a[href="/campaigns/${ids.draft}/content"]`).click();
    const editor = page.frameLocator('iframe').first();
    await editor.locator('.ace_editor').click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText('<p>Unsaved editor content</p>');
    page.off('dialog', acceptDialog);
    await dialogAction(() => page.locator('header a[href="/lists"]').click(), false);
    assert.equal(new URL(page.url()).pathname, `/campaigns/${ids.draft}/content`);
    await dialogAction(() => page.goBack(), false);
    await page.waitForURL(`${trusted}/campaigns/${ids.draft}/content`);
    assert.match(await editor.locator('.ace_content').innerText(), /Unsaved editor content/);
    await dialogAction(() => page.reload(), false, 'beforeunload');
    assert.match(await editor.locator('.ace_content').innerText(), /Unsaved editor content/);
    await dialogAction(() => page.goBack(), true);
    await page.waitForURL(`${trusted}/campaigns/${ids.draft}/status`);
    await page.goForward();
    await page.waitForURL(`${trusted}/campaigns/${ids.draft}/content`);
    await editor.locator('.ace_editor').waitFor({state: 'visible'});
    assert.doesNotMatch(await editor.locator('.ace_content').innerText(), /Unsaved editor content/);
    await editor.locator('.ace_editor').click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText('<p>Reload editor content</p>');
    await dialogAction(() => page.reload(), true, 'beforeunload');
    await editor.locator('.ace_editor').waitFor({state: 'visible'});
    assert.doesNotMatch(await editor.locator('.ace_content').innerText(), /Reload editor content/);
    page.on('dialog', acceptDialog);
    console.log('Campaign editor link/back/forward/reload cancellation and acceptance passed');
}

module.exports = {interactions};
