'use strict';

const passport = require('../../lib/passport');
const files = require('../../models/files');
const router = require('../../lib/router-async').create();
const fileHelpers = require('../../lib/file-helpers');

router.postAsync('/files-table/:type/:subType/:entityId', passport.loggedIn, async (req, res) => {
    return res.json(await files.listDTAjax(req.context, req.params.type, req.params.subType, req.params.entityId, req.body));
});

router.getAsync('/files/:type/:subType/:fileId', passport.loggedIn, async (req, res) => {
    const file = await files.getFileById(req.context, req.params.type, req.params.subType, req.params.fileId);
    res.type(file.mimetype);
    return res.download(file.path, file.name);
});

router.deleteAsync('/files/:type/:subType/:fileId', passport.loggedIn, async (req, res) => {
    await files.removeFile(req.context, req.params.type, req.params.subType, req.params.fileId);
    return res.json();
});

fileHelpers.installUploadHandler(router, '/files/:type/:subType/:entityId', files.ReplacementBehavior.REPLACE);

module.exports = router;