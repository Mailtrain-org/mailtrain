'use strict';

const passport = require('../../lib/passport');
const importRuns = require('../../models/import-runs');

const router = require('../../lib/router-async').create();
const {castToInteger} = require('../../lib/helpers');

router.postAsync('/import-runs-table/:listId/:importId', passport.loggedIn, async (req, res) => {
    return res.json(await importRuns.listDTAjax(req.context, castToInteger(req.params.listId), castToInteger(req.params.importId), req.body));
});

router.postAsync('/import-run-failed-table/:listId/:importId/:importRunId', passport.loggedIn, async (req, res) => {
    return res.json(await importRuns.listFailedDTAjax(req.context, castToInteger(req.params.listId), castToInteger(req.params.importId), castToInteger(req.params.importRunId), req.body));
});

router.getAsync('/import-runs/:listId/:importId/:runId', passport.loggedIn, async (req, res) => {
    const entity = await importRuns.getById(req.context, castToInteger(req.params.listId), castToInteger(req.params.importId), castToInteger(req.params.runId));
    return res.json(entity);
});

module.exports = router;