'use strict';

const passport = require('../lib/passport');
const _ = require('../lib/translate')._;
const reports = require('../models/reports');
const fileHelpers = require('../lib/file-helpers');

const router = require('../lib/router-async').create();

router.getAsync('/download/:id', passport.loggedIn, async (req, res) => {
    const report = await reports.getByIdWithTemplate(req.params.id);

    if (report.state == reports.ReportState.FINISHED) {
        const headers = {
            'Content-Disposition': 'attachment;filename=' + fileHelpers.nameToFileName(report.name) + '.csv',
            'Content-Type': report.mime_type
        };

        res.sendFile(fileHelpers.getReportContentFile(report), {headers: headers});

    } else {
        return res.status(404).send(_('Report not found'));
    }
});

module.exports = router;
