'use strict';

let express = require('express');
let router = new express.Router();
let triggers = require('../lib/models/triggers');
let campaigns = require('../lib/models/campaigns');
let lists = require('../lib/models/lists');
let fields = require('../lib/models/fields');
let striptags = require('striptags');
let passport = require('../lib/passport');
let tools = require('../lib/tools');
let htmlescape = require('escape-html');
let _ = require('../lib/translate')._;
let util = require('util');

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    res.setSelectedMenu('triggers');
    next();
});

router.get('/', (req, res) => {
    triggers.list((err, rows) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        res.render('triggers/triggers', {
            rows: rows.map((row, i) => {
                row.index = i + 1;
                row.description = striptags(row.description);
                return row;
            })
        });
    });
});


router.get('/create-select', passport.csrfProtection, (req, res, next) => {
    let data = tools.convertKeys(req.query, {
        skip: ['layout']
    });

    data.csrfToken = req.csrfToken();

    lists.quicklist((err, listItems) => {
        if (err) {
            return next(err);
        }
        data.listItems = listItems;

        res.render('triggers/create-select', data);
    });
});

router.post('/create-select', passport.parseForm, passport.csrfProtection, (req, res) => {
    if (!req.body.list) {
        req.flash('danger', _('Could not find selected list'));
        return res.redirect('/triggers/create-select');
    }
    res.redirect('/triggers/' + encodeURIComponent(req.body.list) + '/create');
});


router.get('/:listId/create', passport.csrfProtection, (req, res, next) => {
    let data = tools.convertKeys(req.query, {
        skip: ['layout']
    });

    data.csrfToken = req.csrfToken();
    data.days = Math.max(Number(data.days) || 1, 1);

    lists.get(req.params.listId, (err, list) => {
        if (err || !list) {
            req.flash('danger', err && err.message || err || _('Could not find selected list'));
            return res.redirect('/triggers/create-select');
        }
        fields.list(list.id, (err, fieldList) => {
            if (err && !fieldList) {
                fieldList = [];
            }

            data.columns = triggers.defaultColumns.concat(fieldList.filter(field => fields.genericTypes[field.type] === 'date')).map(field => ({
                column: field.column,
                name: field.name,
                selected: data.column === field.column
            }));

            campaigns.list(0, 300, (err, campaignList) => {
                if (err) {
                    return next(err);
                }

                data.sourceCampaigns = (campaignList || []).filter(campaign => campaign.list === list.id).map(campaign => ({
                    id: campaign.id,
                    name: campaign.name,
                    selected: Number(data.sourceCampaign) === campaign.id
                }));

                data.destCampaigns = (campaignList || []).filter(campaign => campaign.list === list.id && campaign.type === 4).map(campaign => ({
                    id: campaign.id,
                    name: campaign.name,
                    selected: Number(data.destCampaign) === campaign.id
                }));

                data.list = list;
                data.isSubscription = data.rule === 'subscription' || !data.rule;
                data.isCampaign = data.rule === 'campaign';

                data.campaignOptions = triggers.defaultCampaignEvents.map(evt => ({
                    option: evt.option,
                    name: evt.name,
                    selected: Number(data.sourceCampaign) === evt.option
                }));

                data.isSend = true;

                res.render('triggers/create', data);
            });
        });
    });
});

router.post('/create', passport.parseForm, passport.csrfProtection, (req, res) => {
    triggers.create(req.body, (err, id) => {
        if (err || !id) {
            req.flash('danger', err && err.message || err || _('Could not create trigger'));
            if (req.body.list) {
                return res.redirect('/triggers/' + encodeURIComponent(req.body.list) + '/create?' + tools.queryParams(req.body));
            } else {
                return res.redirect('/triggers');
            }
        }
        req.flash('success', util.format(_('Trigger “%s” created'), req.body.name));
        res.redirect('/triggers');
    });
});

router.get('/edit/:id', passport.csrfProtection, (req, res, next) => {
    triggers.get(req.params.id, (err, trigger) => {
        if (err || !trigger) {
            req.flash('danger', err && err.message || err || _('Could not find campaign with specified ID'));
            return res.redirect('/campaigns');
        }
        trigger.csrfToken = req.csrfToken();
        trigger.days = Math.round(trigger.seconds / (24 * 3600));

        lists.get(trigger.list, (err, list) => {
            if (err || !list) {
                req.flash('danger', err && err.message || err || _('Could not find selected list'));
                return res.redirect('/triggers');
            }
            fields.list(list.id, (err, fieldList) => {
                if (err && !fieldList) {
                    fieldList = [];
                }

                campaigns.list(0, 300, (err, campaignList) => {
                    if (err) {
                        return next(err);
                    }

                    trigger.sourceCampaigns = (campaignList || []).filter(campaign => campaign.list === list.id).map(campaign => ({
                        id: campaign.id,
                        name: campaign.name,
                        selected: Number(trigger.sourceCampaign) === campaign.id
                    }));

                    trigger.destCampaigns = (campaignList || []).filter(campaign => campaign.list === list.id && campaign.type === 4).map(campaign => ({
                        id: campaign.id,
                        name: campaign.name,
                        selected: Number(trigger.destCampaign) === campaign.id
                    }));

                    trigger.list = list;
                    trigger.isSubscription = trigger.rule === 'subscription' || !trigger.rule;
                    trigger.isCampaign = trigger.rule === 'campaign';

                    trigger.columns = triggers.defaultColumns.concat(fieldList.filter(field => fields.genericTypes[field.type] === 'date')).map(field => ({
                        column: field.column,
                        name: field.name,
                        selected: trigger.isSubscription && trigger.column === field.column
                    }));

                    trigger.campaignOptions = triggers.defaultCampaignEvents.map(evt => ({
                        option: evt.option,
                        name: evt.name,
                        selected: trigger.isCampaign && trigger.column === evt.option
                    }));

                    if (trigger.rule !== 'subscription') {
                        trigger.column = null;
                    }

                    trigger.isSend = true;

                    res.render('triggers/edit', trigger);
                });
            });
        });
    });
});

router.post('/edit', passport.parseForm, passport.csrfProtection, (req, res) => {
    triggers.update(req.body.id, req.body, (err, updated) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/triggers/edit/' + encodeURIComponent(req.body.id));
        } else if (updated) {
            req.flash('success', _('Trigger settings updated'));
        } else {
            req.flash('info', _('Trigger settings not updated'));
        }

        return res.redirect('/triggers');
    });
});

router.post('/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    triggers.delete(req.body.id, (err, deleted) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (deleted) {
            req.flash('success', _('Trigger deleted'));
        } else {
            req.flash('info', _('Could not delete specified trigger'));
        }

        return res.redirect('/triggers');
    });
});

router.get('/status/:id', passport.csrfProtection, (req, res) => {
    let id = Number(req.params.id) || 0;

    triggers.get(id, (err, trigger) => {
        if (err || !trigger) {
            req.flash('danger', err && err.message || err || _('Could not find trigger with specified ID'));
            return res.redirect('/triggers');
        }

        trigger.csrfToken = req.csrfToken();
        res.render('triggers/triggered', trigger);
    });
});

router.post('/status/ajax/:id', (req, res) => {
    triggers.get(req.params.id, (err, trigger) => {
        if (err || !trigger) {
            return res.json({
                error: err && err.message || err || _('Trigger not found'),
                data: []
            });
        }

        let columns = ['#', 'email', 'first_name', 'last_name', 'trigger__' + trigger.id + '`.`created'];
        triggers.filterSubscribers(trigger, req.body, columns, (err, data, total, filteredTotal) => {
            if (err) {
                return res.json({
                    error: err.message || err,
                    data: []
                });
            }

            campaigns.get(trigger.destCampaign, false, (err, campaign) => {
                if (err) {
                    return res.json({
                        error: err && err.message || err,
                        data: []
                    });
                }
                lists.get(trigger.list, (err, list) => {
                    if (err) {
                        return res.json({
                            error: err && err.message || err,
                            data: []
                        });
                    }

                    let campaignCid = campaign && campaign.cid;
                    let listCid = list && list.cid;

                    res.json({
                        draw: req.body.draw,
                        recordsTotal: total,
                        recordsFiltered: filteredTotal,
                        data: data.map((row, i) => [
                            '<a href="/archive/' + encodeURIComponent(campaignCid) + '/' + encodeURIComponent(listCid) + '/' + encodeURIComponent(row.cid) + '?track=no">' + ((Number(req.body.start) || 0) + 1 + i) + '</a>',
                            htmlescape(row.email || ''),
                            htmlescape(row.firstName || ''),
                            htmlescape(row.lastName || ''),
                            '<span class="datestring" data-date="' + row.created.toISOString() + '" title="' + row.created.toISOString() + '">' + row.created.toISOString() + '</span>',
                            '<span class="glyphicon glyphicon-wrench" aria-hidden="true"></span><a href="/lists/subscription/' + trigger.list + '/edit/' + row.cid + '">' + _('Edit') + '</a>'
                        ])
                    });
                });
            });


        });
    });
});

module.exports = router;
