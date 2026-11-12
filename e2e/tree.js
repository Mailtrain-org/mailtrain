'use strict';

const assert = require('node:assert/strict');

async function segmentWalk(page, trusted, ids, rest) {
    await page.goto(`${trusted}/lists/${ids.list}/segments/${ids.segment}/edit`);
    await page.locator('.rst__row').first().waitFor({state: 'visible'});
    assert.equal(await page.locator('.rst__row').count(), 3);
    async function save() {
        const response = page.waitForResponse(r => r.url().endsWith(`/rest/segments/${ids.list}/${ids.segment}`) && r.request().method() === 'PUT');
        response.catch(() => {});
        await page.getByRole('button', {name: 'Save', exact: true}).click();
        assert.equal((await response).status(), 200);
    }
    const before = (await rest(`segments/${ids.list}/${ids.segment}`)).settings;
    console.log('Tree rows:', await page.locator('.rst__rowTitle').allTextContents());
    await page.getByRole('button', {name: 'Add Composite Rule', exact: true}).click();
    await page.locator('#form_type').selectOption('none');
    await page.getByRole('button', {name: 'OK', exact: true}).click();
    await save();
    let saved = (await rest(`segments/${ids.list}/${ids.segment}`)).settings;
    assert.equal(saved.rootRule.rules.length, 3);
    assert.equal(saved.rootRule.rules[2].type, 'none');
    const source = page.locator('.rst__moveHandle').nth(2);
    const target = page.locator('.rst__row').nth(1);
    await source.dragTo(target, {targetPosition: {x: 110, y: 25}});
    await save();
    saved = (await rest(`segments/${ids.list}/${ids.segment}`)).settings;
    console.log('After nesting:', JSON.stringify(saved));
    assert.equal(saved.rootRule.rules[0].rules.length, 2, 'Dragging must nest the email rule');
    assert.equal(saved.rootRule.rules.length, 2);
    await page.reload();
    await page.locator('.rst__row').nth(3).waitFor({state: 'visible'});
    assert.equal(await page.locator('.rst__row').count(), 4);
    const group = page.locator('.rst__moveHandle').last();
    await group.dragTo(page.locator('.rst__row').first(), {targetPosition: {x: 10, y: 1}});
    await save();
    saved = (await rest(`segments/${ids.list}/${ids.segment}`)).settings;
    assert.equal(saved.rootRule.rules[0].type, 'none', 'Dragging must reorder the root groups');
    await page.reload();
    assert.deepEqual((await rest(`segments/${ids.list}/${ids.segment}`)).settings, saved);
    await page.locator('.rst__row').first().locator('a').last().click();
    await save();
    assert.equal((await rest(`segments/${ids.list}/${ids.segment}`)).settings.rootRule.rules.length, 1);
    // Restore the representative segment through the normal form/API contract.
    const entity = await rest(`segments/${ids.list}/${ids.segment}`);
    await rest(`segments/${ids.list}/${ids.segment}`, {name: entity.name, settings: before, originalHash: entity.hash}, 'PUT');
    console.log('Segment add/edit/nest/reorder/persistence passed');
}

module.exports = {segmentWalk};
