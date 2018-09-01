'use strict';

const passport = require('../../lib/passport');
const importRuns = require('../../models/import-runs');

const router = require('../../lib/router-async').create();

router.postAsync('/import-runs-table/:listId/:importId', passport.loggedIn, async (req, res) => {
    return res.json(await importRuns.listDTAjax(req.context, req.params.listId, req.params.importId, req.body));
});

router.postAsync('/import-run-failed-table/:listId/:importId/:importRunId', passport.loggedIn, async (req, res) => {
    return res.json(await importRuns.listFailedDTAjax(req.context, req.params.listId, req.params.importId, req.params.importRunId, req.body));
});

router.getAsync('/import-runs/:listId/:importId/:runId', passport.loggedIn, async (req, res) => {
    const entity = await importRuns.getById(req.context, req.params.listId, req.params.importId, req.params.runId);
    return res.json(entity);
});

module.exports = router;