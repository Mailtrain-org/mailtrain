'use strict';

const passport = require('../lib/passport');
const _ = require('../lib/translate')._;
const reports = require('../models/reports');
const fileHelpers = require('../lib/file-helpers');
const shares = require('../models/shares');
const contextHelpers = require('../lib/context-helpers');

const router = require('../lib/router-async').create();

router.getAsync('/:id/download', passport.loggedIn, async (req, res) => {
    await shares.enforceEntityPermission(req.context, 'report', req.params.id, 'viewContent');

    const report = await reports.getByIdWithTemplate(contextHelpers.getAdminContext(), req.params.id);

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
