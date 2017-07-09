'use strict';

const passport = require('../../lib/passport');
const _ = require('../../lib/translate')._;
const reportTemplates = require('../../models/report-templates');

const router = require('../../lib/router-async').create();


router.getAsync('/report-templates/:reportTemplateId', passport.loggedIn, async (req, res) => {
    const reportTemplate = await reportTemplates.getById(req.params.reportTemplateId);
    reportTemplate.hash = reportTemplates.hash(reportTemplate);
    return res.json(reportTemplate);
});

router.postAsync('/report-templates', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await reportTemplates.create(req.body);
    return res.json();
});

router.putAsync('/report-templates/:reportTemplateId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const reportTemplate = req.body;
    reportTemplate.id = parseInt(req.params.reportTemplateId);

    await reportTemplates.updateWithConsistencyCheck(reportTemplate);
    return res.json();
});

router.deleteAsync('/report-templates/:reportTemplateId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await reportTemplates.remove(req.params.reportTemplateId);
    return res.json();
});

router.postAsync('/report-templates-table', passport.loggedIn, async (req, res) => {
    return res.json(await reportTemplates.listDTAjax(req.body));
});


module.exports = router;