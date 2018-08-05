'use strict';

const passport = require('../../lib/passport');
const imports = require('../../models/imports');

const router = require('../../lib/router-async').create();


const path = require('path');
const files = require('../../models/files');
const uploadedFilesDir = path.join(files.filesDir, 'uploaded');

const multer = require('multer')({
    dest: uploadedFilesDir
});

router.postAsync('/imports-table/:listId', passport.loggedIn, async (req, res) => {
    return res.json(await imports.listDTAjax(req.context, req.params.listId, req.body));
});

router.getAsync('/imports/:listId/:importId', passport.loggedIn, async (req, res) => {
    const entity = await imports.getById(req.context, req.params.listId, req.params.importId);
    entity.hash = imports.hash(entity);
    return res.json(entity);
});

const fileFields = [
    {name: 'csvFile', maxCount: 1}
];

router.postAsync('/imports/:listId', passport.loggedIn, passport.csrfProtection, multer.fields(fileFields), async (req, res) => {
    const entity = JSON.parse(req.body.entity);

    return res.json(await imports.create(req.context, req.params.listId, entity, req.files));
});

router.putAsync('/imports/:listId/:importId', passport.loggedIn, passport.csrfProtection, multer.fields(fileFields), async (req, res) => {
    const entity = JSON.parse(req.body.entity);
    entity.id = parseInt(req.params.importId);

    await imports.updateWithConsistencyCheck(req.context, req.params.listId, entity, req.files);
    return res.json();
});

router.deleteAsync('/imports/:listId/:importId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await imports.remove(req.context, req.params.listId, req.params.importId);
    return res.json();
});


module.exports = router;