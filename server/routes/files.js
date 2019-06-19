'use strict';

const router = require('../lib/router-async').create();
const files = require('../models/files');
const contextHelpers = require('../lib/context-helpers');

router.getAsync('/:type/:subType/:entityId/:fileName', async (req, res) => {
    const file = await files.getFileByFilename(contextHelpers.getAdminContext(), req.params.type, req.params.subType, req.params.entityId, req.params.fileName);
    res.type(file.mimetype);
    return res.download(file.path, file.name);
});

module.exports = router;
