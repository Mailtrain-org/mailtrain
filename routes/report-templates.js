'use strict';

const express = require('express');
const passport = require('../lib/passport');
const router = new express.Router();
const _ = require('../lib/translate')._;
const reportTemplates = require('../lib/models/report-templates');
const tools = require('../lib/tools');
const util = require('util');
const htmlescape = require('escape-html');
const striptags = require('striptags');

const allowedMimeTypes = {
    'text/html': 'HTML',
    'text/csv': 'CSV'
};

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    res.setSelectedMenu('reports');
    next();
});

router.get('/', (req, res) => {
    res.render('report-templates/report-templates', {
        title: _('Report Templates')
    });
});

router.post('/ajax', (req, res) => {
    reportTemplates.filter(req.body, (err, data, total, filteredTotal) => {
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
                htmlescape(striptags(row.description) || ''),
                '<span class="datestring" data-date="' + row.created.toISOString() + '" title="' + row.created.toISOString() + '">' + row.created.toISOString() + '</span>',
                '<span class="glyphicon glyphicon-wrench" aria-hidden="true"></span><a href="/report-templates/edit/' + row.id + '"> ' + _('Edit') + '</a>']
            )
        });
    });
});

router.get('/create', passport.csrfProtection, (req, res) => {
    const data = req.query;
    const wizard = req.query['type'] || '';

    if (wizard == 'subscribers-all') {
        if (!('description' in data)) data.description = 'Generates a campaign report listing all subscribers along with their statistics.';

        if (!('mimeType' in data)) data.mimeType = 'text/html';

        if (!('userFields' in data)) data.userFields =
            '[\n' +
            '    {\n' +
            '        "id": "campaign",\n' +
            '        "name": "Campaign",\n' +
            '        "type": "campaign",\n' +
            '        "minOccurences": 1,\n' +
            '        "maxOccurences": 1\n' +
            '    }\n' +
            ']';

        if (!('js' in data)) data.js =
            'campaigns.results(inputs.campaign, ["*"], "", (err, results) => {\n' +
            '    if (err) {\n' +
            '        return callback(err);\n' +
            '    }\n' +
            '\n' +
            '    const data = {\n' +
            '        results: results\n' +
            '    };\n' +
            '\n' +
            '    return callback(null, data);\n' +
            '});';

        if (!('hbs' in data)) data.hbs =
            '<h2>{{title}}</h2>\n' +
            '\n' +
            '<div class="table-responsive">\n' +
            '    <table class="table table-bordered table-hover data-table display nowrap" width="100%" data-row-sort="1,1" data-paging="false">\n' +
            '        <thead>\n' +
            '        <th>\n' +
            '            {{#translate}}Email{{/translate}}\n' +
            '        </th>\n' +
            '        <th>\n' +
            '            {{#translate}}Tracker Count{{/translate}}\n' +
            '        </th>\n' +
            '        </thead>\n' +
            '        {{#if results}}\n' +
            '            <tbody>\n' +
            '            {{#each results}}\n' +
            '                <tr>\n' +
            '                    <th scope="row">\n' +
            '                        {{email}}\n' +
            '                    </th>\n' +
            '                    <td style="width: 20%;">\n' +
            '                        {{tracker_count}}\n' +
            '                    </td>\n' +
            '                </tr>\n' +
            '            {{/each}}\n' +
            '            </tbody>\n' +
            '        {{/if}}\n' +
            '    </table>\n' +
            '</div>';

    } else if (wizard == 'subscribers-grouped') {
        if (!('description' in data)) data.description = 'Generates a campaign report with results are aggregated by some "Country" custom field.';

        if (!('mimeType' in data)) data.mimeType = 'text/html';

        if (!('userFields' in data)) data.userFields =
            '[\n' +
            '    {\n' +
            '        "id": "campaign",\n' +
            '        "name": "Campaign",\n' +
            '        "type": "campaign",\n' +
            '        "minOccurences": 1,\n' +
            '        "maxOccurences": 1\n' +
            '    }\n' +
            ']';

        if (!('js' in data)) data.js =
            'campaigns.results(inputs.campaign, ["custom_country", "count(*) AS count_all", "SUM(IF(tracker.count IS NULL, 0, 1)) AS count_opened"], "GROUP BY custom_country", (err, results) => {\n' +
            '    if (err) {\n' +
            '        return callback(err);\n' +
            '    }\n' +
            '\n' +
            '    for (let row of results) {\n' +
            '        row["percentage"] = Math.round((row.count_opened / row.count_all) * 100);\n' +
            '    }\n' +
            '\n' +
            '    let data = {\n' +
            '        results: results\n' +
            '    };\n' +
            '\n' +
            '    return callback(null, data);\n' +
            '});';

        if (!('hbs' in data)) data.hbs =
            '<h2>{{title}}</h2>\n' +
            '\n' +
            '<div class="table-responsive">\n' +
            '    <table class="table table-bordered table-hover data-table display nowrap" width="100%" data-row-sort="1,1,1,1" data-paging="false">\n' +
            '        <thead>\n' +
            '        <th>\n' +
            '            {{#translate}}Country{{/translate}}\n' +
            '        </th>\n' +
            '        <th>\n' +
            '            {{#translate}}Opened{{/translate}}\n' +
            '        </th>\n' +
            '        <th>\n' +
            '            {{#translate}}All{{/translate}}\n' +
            '        </th>\n' +
            '        <th>\n' +
            '            {{#translate}}Percentage{{/translate}}\n' +
            '        </th>\n' +
            '        </thead>\n' +
            '        {{#if results}}\n' +
            '            <tbody>\n' +
            '            {{#each results}}\n' +
            '                <tr>\n' +
            '                    <th scope="row">\n' +
            '                        {{custom_country}}\n' +
            '                    </th>\n' +
            '                    <td style="width: 20%;">\n' +
            '                        {{count_opened}}\n' +
            '                    </td>\n' +
            '                    <td style="width: 20%;">\n' +
            '                        {{count_all}}\n' +
            '                    </td>\n' +
            '                    <td style="width: 20%;">\n' +
            '                        {{percentage}}%\n' +
            '                    </td>\n' +
            '                </tr>\n' +
            '            {{/each}}\n' +
            '            </tbody>\n' +
            '        {{/if}}\n' +
            '    </table>\n' +
            '</div>';

    } else if (wizard == 'export-list-csv') {
        if (!('description' in data)) data.description = 'Exports a list as a CSV file.';

        if (!('mimeType' in data)) data.mimeType = 'text/csv';

        if (!('userFields' in data)) data.userFields =
            '[\n' +
            '    {\n' +
            '        "id": "list",\n' +
            '        "name": "List",\n' +
            '        "type": "list",\n' +
            '        "minOccurences": 1,\n' +
            '        "maxOccurences": 1\n' +
            '    }\n' +
            ']';

        if (!('js' in data)) data.js =
            'subscriptions.list(inputs.list.id,0,0, (err, results) => {\n' +
            '    if (err) {\n' +
            '        return callback(err);\n' +
            '    }\n' +
            '\n' +
            '    let data = {\n' +
            '        results: results\n' +
            '    };\n' +
            '\n' +
            '    return callback(null, data);\n' +
            '});';

        if (!('hbs' in data)) data.hbs =
            '{{#each results}}\n' +
            '{{firstName}},{{lastName}},{{email}}\n' +
            '{{/each}}';
    }

    data.csrfToken = req.csrfToken();
    data.title = _('Create Report Template');
    data.useEditor = true;

    data.mimeTypes = Object.keys(allowedMimeTypes).map(key => ({
        key: key,
        value: allowedMimeTypes[key],
        selected: data.mimeType == key
    }));

    res.render('report-templates/create', data);
});

router.post('/create', passport.parseForm, passport.csrfProtection, (req, res) => {
    reportTemplates.createOrUpdate(true, req.body, (err, id) => {
        if (err || !id) {
            req.flash('danger', err && err.message || err || _('Could not create report template'));
            return res.redirect('/report-templates/create?' + tools.queryParams(req.body));
        }
        req.flash('success', util.format(_('Report template “%s” created'), req.body.name));
        res.redirect('/report-templates');
    });
});

router.get('/edit/:id', passport.csrfProtection, (req, res) => {
    reportTemplates.get(req.params.id, (err, template) => {
        if (err || !template) {
            req.flash('danger', err && err.message || err || _('Could not find report template with specified ID'));
            return res.redirect('/report-templates');
        }

        template.csrfToken = req.csrfToken();
        template.title = _('Edit Report Template');
        template.useEditor = true;

        template.mimeTypes = Object.keys(allowedMimeTypes).map(key => ({
            key: key,
            value: allowedMimeTypes[key],
            selected: template.mimeType == key
        }));

        res.render('report-templates/edit', template);
    });
});

router.post('/edit', passport.parseForm, passport.csrfProtection, (req, res) => {
    reportTemplates.createOrUpdate(false, req.body, (err, updated) => {
        if (err) {
            req.flash('danger', err.message || err);
        } else if (updated) {
            req.flash('success', _('Report template updated'));
        } else {
            req.flash('info', _('Report template not updated'));
        }

        if (req.body['submit'] == 'update-and-stay') {
            return res.redirect('/report-templates/edit/' + req.body.id);
        } else {
            return res.redirect('/report-templates');
        }
    });
});

router.post('/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    reportTemplates.delete(req.body.id, (err, deleted) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (deleted) {
            req.flash('success', _('Report template deleted'));
        } else {
            req.flash('info', _('Could not delete specified report template'));
        }

        return res.redirect('/report-templates');
    });
});

module.exports = router;
