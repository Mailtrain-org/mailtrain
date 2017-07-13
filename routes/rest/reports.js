'use strict';

const passport = require('../../lib/passport');
const _ = require('../../lib/translate')._;
const reports = require('../../models/reports');
const reportProcessor = require('../../lib/report-processor');
const fileHelpers = require('../../lib/file-helpers');

const router = require('../../lib/router-async').create();


router.getAsync('/reports/:reportId', passport.loggedIn, async (req, res) => {
    const report = await reports.getByIdWithTemplate(req.params.reportId);
    report.hash = reports.hash(report);
    return res.json(report);
});

router.postAsync('/reports', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await reports.create(req.body);
    return res.json();
});

router.putAsync('/reports/:reportId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const report = req.body;
    report.id = parseInt(req.params.reportId);

    await reports.updateWithConsistencyCheck(report);
    return res.json();
});

router.deleteAsync('/reports/:reportId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await reports.remove(req.params.reportId);
    return res.json();
});

router.postAsync('/reports-table', passport.loggedIn, async (req, res) => {
    return res.json(await reports.listDTAjax(req.body));
});

router.postAsync('/report-start/:id', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await reportProcessor.start(req.params.id);
    res.json();
});

router.postAsync('/report-stop/:id', async (req, res) => {
    await reportProcessor.stop(req.params.id);
    res.json();
});

router.getAsync('/report-content/:id', async (req, res) => {
    const report = await reports.getByIdWithTemplate(req.params.id);
    res.sendFile(fileHelpers.getReportContentFile(report));
});

router.getAsync('/report-output/:id', async (req, res) => {
    const report = await reports.getByIdWithTemplate(req.params.id);
    res.sendFile(fileHelpers.getReportOutputFile(report));
});


module.exports = router;