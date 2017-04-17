'use strict';

const express = require('express');
const passport = require('../lib/passport');
const router = new express.Router();
const _ = require('../lib/translate')._;
const reportTemplates = require('../lib/models/report-templates');
const reports = require('../lib/models/reports');
const campaigns = require('../lib/models/campaigns');
const lists = require('../lib/models/lists');
const tools = require('../lib/tools');
const util = require('util');
const htmlescape = require('escape-html');
const striptags = require('striptags');
const fs = require('fs');
const fsTools = require('../lib/fs-tools');

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
    function getViewLink(row) {
        if (row.state == 0) {
            // TODO: Render waiting
            // TODO: Add error output
            return '<span class="glyphicon glyphicon-hourglass" aria-hidden="true"></span> ';
        } else if (row.state == 1) {
            let icon = 'eye-open';
            if (row.mimeType == 'text/csv') icon = 'download-alt';

            // TODO: Add error output
            return '<a href="/reports/view/' + row.id + '"><span class="glyphicon glyphicon-' + icon + '" aria-hidden="true"></span></a> ';
        } else if (row.state == 2) {
            // TODO: Add error output
            return '<span class="glyphicon glyphicon-thumbs-down" aria-hidden="true"></span> ';
        }

        return '';
    }

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
                '<span class="datestring" data-date="' + row.created.toISOString() + '" title="' + row.created.toISOString() + '">' + row.created.toISOString() + '</span>',
                getViewLink(row) +
                '<a href="/reports/edit/' + row.id + '"><span class="glyphicon glyphicon-wrench" aria-hidden="true"></span></a>']
            )
        });
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
    delete reqData.filename; // This is to make sure no one inserts a fake filename when editing the report.

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
            req.flash('success', util.format(_('Report “%s” created'), data.name));
            res.redirect('/reports');
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
    delete reqData.filename; // This is to make sure no one inserts a fake filename when editing the report.

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

router.get('/view/:id', passport.csrfProtection, (req, res) => {
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

            if (report.state == 1) {
                if (reportTemplate.mimeType == 'text/html') {

                    fs.readFile(path.join(__dirname, '../protected/reports', report.filename + '.report'), (err, reportContent) => {
                        if (err) {
                            req.flash('danger', err && err.message || err || _('Could not find report with specified ID'));
                            return res.redirect('/reports');
                        }

                        const data = {
                            csrfToken: req.csrfToken(),
                            report: new hbs.handlebars.SafeString(reportContent),
                            title: report.name
                        };

                        res.render('reports/view', data);
                    });

                } else if (reportTemplate.mimeType == 'text/csv') {
                    const headers = {
                        'Content-Disposition': 'attachment;filename=' + fsTools.nameToFileName(report.name) + '.csv',
                        'Content-Type': 'text/csv'
                    };

                    res.sendFile(path.join(__dirname, '../protected/reports', report.filename + '.report'), {headers: headers});

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
