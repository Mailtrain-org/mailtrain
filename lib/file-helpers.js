'use strict';

const passport = require('./passport');
const files = require('../models/files');

const path = require('path');
const uploadedFilesDir = path.join(files.filesDir, 'uploaded');
const {castToInteger} = require('./helpers');

const multer = require('multer')({
    dest: uploadedFilesDir
});

function installUploadHandler(router, url, replacementBehavior, type, subType) {
    router.postAsync(url, passport.loggedIn, multer.array('files[]'), async (req, res) => {
        return res.json(await files.createFiles(req.context, type || req.params.type, subType || req.params.subType, castToInteger(req.params.entityId), req.files, replacementBehavior));
    });
}

module.exports = {
    installUploadHandler
};