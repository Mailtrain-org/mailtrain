'use strict';

const passport = require('../lib/passport');
const reports = require('../models/reports');
const reportHelpers = require('../lib/report-helpers');
const shares = require('../models/shares');
const contextHelpers = require('../lib/context-helpers');

const router = require('../lib/router-async').create();

const fileSuffixes = {
    'text/html': '.html',
    'text/csv': '.csv'
};

router.getAsync('/:id/download', passport.loggedIn, async (req, res) => {
    await shares.enforceEntityPermission(req.context, 'report', req.params.id, 'viewContent');

    const report = await reports.getByIdWithTemplate(contextHelpers.getAdminContext(), req.params.id, false);

    if (report.state == reports.ReportState.FINISHED) {
        const headers = {
            'Content-Disposition': 'attachment;filename=' + reportHelpers.nameToFileName(report.name) + (fileSuffixes[report.mime_type] || ''),
            'Content-Type': report.mime_type
        };

        res.sendFile(reportHelpers.getReportContentFile(report), {headers: headers});

    } else {
        return res.status(404).send('Report not found');
    }
});

module.exports = router;
