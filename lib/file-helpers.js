'use strict';

const passport = require('./passport');
const files = require('../models/files');

const path = require('path');
const uploadedFilesDir = path.join(files.filesDir, 'uploaded');

const multer = require('multer')({
    dest: uploadedFilesDir
});

function installUploadHandler(router, url, dontReplace = false) {
    router.postAsync(url, passport.loggedIn, multer.array('files[]'), async (req, res) => {
        return res.json(await files.createFiles(req.context, req.params.type, req.params.entityId, req.files, dontReplace));
    });
}

module.exports = {
    installUploadHandler
};