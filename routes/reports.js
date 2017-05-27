'use strict';

const express = require('express');
const passport = require('../lib/passport');
const router = new express.Router();
const _ = require('../lib/translate')._;
const reportTemplates = require('../lib/models/report-templates');
const reports = require('../lib/models/reports');
const reportProcessor = require('../lib/report-processor');
const campaigns = require('../lib/models/campaigns');
const lists = require('../lib/models/lists');
const tools = require('../lib/tools');
const fileHelpers = require('../lib/file-helpers');
const util = require('util');
const htmlescape = require('escape-html');
const striptags = require('striptags');
const fs = require('fs');
const hbs = require('hbs');

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    res.setSelectedMenu('reports');
    next();
});

router.get('/', (req, res) => {
    res.render('reports/reports', {
        title: _('Reports')
    });
});



router.post('/ajax', (req, res) => {
    reports.filter(req.body, (err, data, total, filteredTotal) => {
        if (err) {
            return res.json({
                error: err.message || err,
                data: []
            });
        }

        res.json({
            draw: req.body.draw,
            recordsTotal: total,
            recordsFiltered: filteredTotal,
            data: data.map((row, i) => [
                (Number(req.body.start) || 0) + 1 + i,
                htmlescape(row.name || ''),
                htmlescape(row.reportTemplateName || ''),
                htmlescape(striptags(row.description) || ''),
                getRowLastRun(row),
                getRowActions(row)
            ])
        });
    });
});

router.get('/row/ajax/:id', (req, res) => {
    respondRowActions(req.params.id, res);
});

router.get('/start/ajax/:id', (req, res) => {
    reportProcessor.start(req.params.id, () => {
        respondRowActions(req.params.id, res);
    });
});

router.get('/stop/ajax/:id', (req, res) => {
    reportProcessor.stop(req.params.id, () => {
        respondRowActions(req.params.id, res);
    });
});

router.get('/create', passport.csrfProtection, (req, res) => {
    const reqData = req.query;
    reqData.csrfToken = req.csrfToken();
    reqData.title = _('Create Report');
    reqData.useEditor = true;

    reportTemplates.quicklist((err, items) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/reports');
        }

        const reportTemplateId = Number(reqData.reportTemplate);

        if (reportTemplateId) {
            items.forEach(item => {
                if (item.id === reportTemplateId) {
                    item.selected = true;
                }
            });
        }

        reqData.reportTemplates = items;

        if (!reportTemplateId) {
            res.render('reports/create-select-template', reqData);
        } else {
            addUserFields(reportTemplateId, reqData, null, (err, data) => {
                if (err) {
                    req.flash('danger', err.message || err);
                    return res.redirect('/reports');
                }

                res.render('reports/create', data);
            });
        }
    });
});

router.post('/create', passport.parseForm, passport.csrfProtection, (req, res) => {
    const reqData = req.body;

    const reportTemplateId = Number(reqData.reportTemplate);

    addParamsObject(reportTemplateId, reqData, (err, data) => {
        if (err) {
            req.flash('danger', err && err.message || err || _('Could not create report'));
            return res.redirect('/reports/create?' + tools.queryParams(data));
        }

        reports.createOrUpdate(true, data, (err, id) => {
            if (err || !id) {
                req.flash('danger', err && err.message || err || _('Could not create report'));
                return res.redirect('/reports/create?' + tools.queryParams(data));
            }

            reportProcessor.start(id, () => {
                req.flash('success', util.format(_('Report “%s” created'), data.name));
                res.redirect('/reports');
            });
        });
    });
});

router.get('/edit/:id', passport.csrfProtection, (req, res) => {
    const reqData = req.query;
    reports.get(req.params.id, (err, report) => {
        if (err || !report) {
            req.flash('danger', err && err.message || err || _('Could not find report with specified ID'));
            return res.redirect('/reports');
        }

        report.csrfToken = req.csrfToken();
        report.title = _('Edit Report');
        report.useEditor = true;

        reportTemplates.quicklist((err, items) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/');
            }

            const reportTemplateId = report.reportTemplate;

            items.forEach(item => {
                if (item.id === reportTemplateId) {
                    item.selected = true;
                }
            });

            report.reportTemplates = items;

            addUserFields(reportTemplateId, reqData, report, (err, data) => {
                if (err) {
                    req.flash('danger', err.message || err);
                    return res.redirect('/reports');
                }

                res.render('reports/edit', data);
            });
        });
    });
});

router.post('/edit', passport.parseForm, passport.csrfProtection, (req, res) => {
    const reqData = req.body;
    const reportTemplateId = Number(reqData.reportTemplate);

    addParamsObject(reportTemplateId, reqData, (err, data) => {
        if (err) {
            req.flash('danger', err && err.message || err || _('Could not update report'));
            return res.redirect('/reports/create?' + tools.queryParams(data));
        }

        reports.createOrUpdate(false, data, (err, updated) => {
            if (err) {
                req.flash('danger', err && err.message || err || _('Could not update report'));
                return res.redirect('/reports/edit/' + data.id + '?' + tools.queryParams(data));
            } else if (updated) {
                req.flash('success', _('Report updated'));
            } else {
                req.flash('info', _('Report not updated'));
            }

            return res.redirect('/reports');
        });
    });
});

router.post('/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    reports.delete(req.body.id, (err, deleted) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (deleted) {
            req.flash('success', _('Report deleted'));
        } else {
            req.flash('info', _('Could not delete specified report'));
        }

        return res.redirect('/reports');
    });
});

router.get('/view/:id', (req, res) => {
    reports.get(req.params.id, (err, report) => {
        if (err || !report) {
            req.flash('danger', err && err.message || err || _('Could not find report with specified ID'));
            return res.redirect('/reports');
        }

        reportTemplates.get(report.reportTemplate, (err, reportTemplate) => {
            if (err) {
                req.flash('danger', err && err.message || err || _('Could not find report template'));
                return res.redirect('/reports');
            }

            if (report.state == reports.ReportState.FINISHED) {
                if (reportTemplate.mimeType == 'text/html') {

                    fs.readFile(fileHelpers.getReportContentFile(report), (err, reportContent) => {
                        if (err) {
                            req.flash('danger', err && err.message || err || _('Could not find report with specified ID'));
                            return res.redirect('/reports');
                        }

                        const data = {
                            report: new hbs.handlebars.SafeString(reportContent),
                            title: report.name
                        };

                        res.render('reports/view', data);
                    });

                } else if (reportTemplate.mimeType == 'text/csv') {
                    const headers = {
                        'Content-Disposition': 'attachment;filename=' + fileHelpers.nameToFileName(report.name) + '.csv',
                        'Content-Type': 'text/csv'
                    };

                    res.sendFile(fileHelpers.getReportContentFile(report), {headers: headers});

                } else {
                    req.flash('danger', _('Unknown type of template'));
                    res.redirect('/reports');
                }

            } else {
                req.flash('danger', err && err.message || err || _('Could not find report with specified ID'));
                return res.redirect('/reports');
            }
        });
    });
});

router.get('/output/:id', (req, res) => {
    reports.get(req.params.id, (err, report) => {
        if (err || !report) {
            req.flash('danger', err && err.message || err || _('Could not find report with specified ID'));
            return res.redirect('/reports');
        }

        fs.readFile(fileHelpers.getReportOutputFile(report), (err, output) => {
            let data = {
                title: 'Output for report ' + report.name
            };

            if (err) {
                data.error = 'No output.';
            } else {
                data.output = output;
            }

            res.render('reports/output', data);
        });
    });
});

function getRowLastRun(row) {
    return '<span id="row-last-run-' + row.id + '">' + (row.lastRun ? '<span class="datestring" data-date="' + row.lastRun.toISOString() + '" title="' + row.lastRun.toISOString() + '">' + row.lastRun.toISOString() + '</span>' : '') + '</span>';
}

function getRowActions(row) {
    /* FIXME: add csrf protection to stop and refresh actions */

    let requestRefresh = false;
    let view, startStop;
    let topic = 'data-topic-id="' + row.id + '"';

    if (row.state == reports.ReportState.PROCESSING || row.state == reports.ReportState.SCHEDULED) {
        view = '<span class="row-action glyphicon glyphicon-hourglass" aria-hidden="true" title="Processing"></span>';
        startStop = '<a class="row-action ajax-action" href="" data-topic-url="/reports/stop" ' + topic + ' title="Stop"><span class="glyphicon glyphicon-stop" aria-hidden="true"></span></a>';
        requestRefresh = true;

    } else if (row.state == reports.ReportState.FINISHED) {
        let icon = 'eye-open';
        if (row.mimeType == 'text/csv') icon = 'download-alt';

        view = '<a class="row-action" href="/reports/view/' + row.id + '" title="View report"><span class="glyphicon glyphicon-' + icon + '" aria-hidden="true"></span></a>';
        startStop = '<a class="row-action ajax-action" href="" data-topic-url="/reports/start" ' + topic + ' title="Refresh report"><span class="glyphicon glyphicon-repeat" aria-hidden="true"></span></a>';

    } else if (row.state == reports.ReportState.FAILED) {
        view = '<span class="row-action glyphicon glyphicon-thumbs-down" aria-hidden="true" title="Report generation failed"></span>';
        startStop = '<a class="row-action ajax-action" href="" data-topic-url="/reports/start" ' + topic + ' title="Refresh report"><span class="glyphicon glyphicon-repeat" aria-hidden="true"></span></a>';
    }

    let actions = view;
    actions += '<a class="row-action" href="/reports/output/' + row.id + '" title="View console output"><span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span></a>';
    actions += startStop;
    actions += '<a class="row-action" href="/reports/edit/' + row.id + '"><span class="glyphicon glyphicon-wrench" aria-hidden="true" title="Edit"></span></a>';

    return '<span id="row-actions-' + row.id + '"' + (requestRefresh ? ' class="row-actions ajax-refresh" data-interval="5" data-topic-url="/reports/row" ' + topic : ' class="row-actions"') + '>' +
        actions +
        '</span>';
}

function respondRowActions(id, res) {
    reports.get(id, (err, report) => {
        if (err) {
            return res.json({
                error: err,
            });
        }

        const data = {};
        data['#row-last-run-' + id] = getRowLastRun(report);
        data['#row-actions-' + id] = getRowActions(report);

        res.json(data);
    });
}


function addUserFields(reportTemplateId, reqData, report, callback) {
    reportTemplates.get(reportTemplateId, (err, reportTemplate) => {
        if (err) {
            return callback(err);
        }

        const userFields = [];

        for (const spec of reportTemplate.userFieldsObject) {
            let value = '';
            if ((spec.id + 'Selection') in reqData) {
                value = reqData[spec.id + 'Selection'];
            } else if (report && report.paramsObject && spec.id in report.paramsObject) {
                value = report.paramsObject[spec.id].join(',');
            }

            userFields.push({
                'id': spec.id,
                'name': spec.name,
                'type': spec.type,
                'value': value,
                'isMulti': !(spec.minOccurences == 1 && spec.maxOccurences == 1)
            });
        }

        const data = report ? report : reqData;
        data.userFields = userFields;

        callback(null, data);
    });
}

function addParamsObject(reportTemplateId, data, callback) {
    reportTemplates.get(reportTemplateId, (err, reportTemplate) => {
        if (err) {
            return callback(err);
        }

        const paramsObject = {};

        for (const spec of reportTemplate.userFieldsObject) {
            const sel = data[spec.id + 'Selection'];

            if (!sel) {
                paramsObject[spec.id] = [];
            } else {
                paramsObject[spec.id] = sel.split(',').map(item => Number(item));
            }
        }

        data.paramsObject = paramsObject;

        callback(null, data);
    });
}

module.exports = router;
