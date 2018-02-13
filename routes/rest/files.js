'use strict';

const passport = require('../../lib/passport');
const files = require('../../models/files');

const router = require('../../lib/router-async').create();
const multer = require('../../lib/multer');

router.postAsync('/files-table/:type/:entityId', passport.loggedIn, async (req, res) => {
    const files = await files.listFilesDTAjax(req.context, req.params.type, req.params.entityId, req.body);
    return res.json(files);
});

router.getAsync('/files/:type/:fileId', passport.loggedIn, async (req, res) => {
    const file = await files.getFileById(req.context, req.params.type, req.params.fileId);
    res.type(file.mimetype);
    return res.download(file.path, file.name);
});

router.getAsync('/files-by-name/:type/:entityId/:fileName', passport.loggedIn, async (req, res) => {
    const file = await templates.getFileByName(req.context, req.params.type, req.params.entityId, req.params.fileName);
    res.type(file.mimetype);
//    return res.sendFile(file.path);  FIXME - remove this comment if the download below is OK
    return res.download(file.path, file.name);
});


router.putAsync('/files/:type/:entityId', passport.loggedIn, multer.array('file'), async (req, res) => {
    const summary = await files.createFiles(req.context, req.params.type, req.params.entityId, req.files);
    return res.json(summary);
});

router.deleteAsync('/files/:type/:fileId', passport.loggedIn, async (req, res) => {
    await files.removeFile(req.context, req.params.type, req.params.fileId);
    return res.json();
});

module.exports = router;