'use strict';

const passport = require('../../lib/passport');
const reportTemplates = require('../../models/report-templates');

const router = require('../../lib/router-async').create();
const {castToInteger} = require('../../lib/helpers');


router.getAsync('/report-templates/:reportTemplateId', passport.loggedIn, async (req, res) => {
    const reportTemplate = await reportTemplates.getById(req.context, castToInteger(req.params.reportTemplateId));
    reportTemplate.hash = reportTemplates.hash(reportTemplate);
    return res.json(reportTemplate);
});

router.postAsync('/report-templates', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await reportTemplates.create(req.context, req.body));
});

router.putAsync('/report-templates/:reportTemplateId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const reportTemplate = req.body;
    reportTemplate.id = castToInteger(req.params.reportTemplateId);

    await reportTemplates.updateWithConsistencyCheck(req.context, reportTemplate);
    return res.json();
});

router.deleteAsync('/report-templates/:reportTemplateId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await reportTemplates.remove(req.context, castToInteger(req.params.reportTemplateId));
    return res.json();
});

router.postAsync('/report-templates-table', passport.loggedIn, async (req, res) => {
    return res.json(await reportTemplates.listDTAjax(req.context, req.body));
});

router.getAsync('/report-template-user-fields/:reportTemplateId', passport.loggedIn, async (req, res) => {
    const userFields = await reportTemplates.getUserFieldsById(req.context, castToInteger(req.params.reportTemplateId));
    return res.json(userFields);
});

module.exports = router;