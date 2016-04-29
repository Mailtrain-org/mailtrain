'use strict';

let express = require('express');
let router = new express.Router();
let lists = require('../lib/models/lists');
let templates = require('../lib/models/templates');
let campaigns = require('../lib/models/campaigns');
let settings = require('../lib/models/settings');
let tools = require('../lib/tools');
let striptags = require('striptags');
let passport = require('../lib/passport');
let htmlescape = require('escape-html');

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', 'Need to be logged in to access restricted content');
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    res.setSelectedMenu('campaigns');
    next();
});

router.get('/', (req, res) => {
    res.render('campaigns/campaigns', {
        title: 'Campaigns'
    });
});

router.get('/create', passport.csrfProtection, (req, res) => {
    let data = tools.convertKeys(req.query, {
        skip: ['layout']
    });

    if (/^\d+:\d+$/.test(data.list)) {
        data.segment = Number(data.list.split(':').pop());
        data.list = Number(data.list.split(':').shift());
    }

    settings.list(['defaultFrom', 'defaultAddress', 'defaultSubject'], (err, configItems) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        lists.quicklist((err, listItems) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/');
            }

            if (Number(data.list)) {
                listItems.forEach(list => {
                    list.segments.forEach(segment => {
                        if (segment.id === data.segment) {
                            segment.selected = true;
                        }
                    });
                    if (list.id === data.list && !data.segment) {
                        list.selected = true;
                    }
                });
            }

            templates.quicklist((err, templateItems) => {
                if (err) {
                    req.flash('danger', err.message || err);
                    return res.redirect('/');
                }

                if (Number(data.template)) {
                    templateItems.forEach(item => {
                        if (item.id === Number(data.template)) {
                            item.selected = true;
                        }
                    });
                }

                data.csrfToken = req.csrfToken();
                data.listItems = listItems;
                data.templateItems = templateItems;

                data.from = data.from || configItems.defaultFrom;
                data.address = data.address || configItems.defaultAddress;
                data.subject = data.subject || configItems.defaultSubject;

                res.render('campaigns/create', data);
            });
        });
    });
});

router.post('/create', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.create(req.body, (err, id) => {
        if (err || !id) {
            req.flash('danger', err && err.message || err || 'Could not create campaign');
            return res.redirect('/campaigns/create?' + tools.queryParams(req.body));
        }
        req.flash('success', 'Campaign “' + req.body.name + '” created');
        res.redirect('/campaigns/edit/' + id + '?tab=template');
    });
});

router.get('/edit/:id', passport.csrfProtection, (req, res, next) => {
    campaigns.get(req.params.id, false, (err, campaign) => {
        if (err || !campaign) {
            req.flash('danger', err && err.message || err || 'Could not find campaign with specified ID');
            return res.redirect('/campaigns');
        }

        settings.list(['disableWysiwyg'], (err, configItems) => {
            if (err) {
                return next(err);
            }

            lists.quicklist((err, listItems) => {
                if (err) {
                    req.flash('danger', err.message || err);
                    return res.redirect('/');
                }

                if (Number(campaign.list)) {
                    listItems.forEach(list => {
                        list.segments.forEach(segment => {
                            if (segment.id === campaign.segment) {
                                segment.selected = true;
                            }
                        });
                        if (list.id === campaign.list && !campaign.segment) {
                            list.selected = true;
                        }
                    });
                }

                campaign.csrfToken = req.csrfToken();
                campaign.listItems = listItems;
                campaign.useEditor = true;

                campaign.disableWysiwyg = configItems.disableWysiwyg;
                campaign.showGeneral = req.query.tab === 'general' || !req.query.tab;
                campaign.showTemplate = req.query.tab === 'template';

                res.render('campaigns/edit', campaign);
            });
        });
    });
});

router.post('/edit', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.update(req.body.id, req.body, (err, updated) => {
        if (err) {
            req.flash('danger', err.message || err);
        } else if (updated) {
            req.flash('success', 'Campaign settings updated');
        } else {
            req.flash('info', 'Campaign settings not updated');
        }

        if (req.body.id) {
            return res.redirect('/campaigns/view/' + encodeURIComponent(req.body.id));
        } else {
            return res.redirect('/campaigns');
        }
    });
});

router.post('/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.delete(req.body.id, (err, deleted) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (deleted) {
            req.flash('success', 'Campaign deleted');
        } else {
            req.flash('info', 'Could not delete specified campaign');
        }

        return res.redirect('/campaigns');
    });
});

router.post('/ajax', (req, res) => {
    campaigns.filter(req.body, (err, data, total, filteredTotal) => {
        if (err) {
            return res.json({
                error: err.message || err,
                data: []
            });
        }

        let getStatusText = data => {
            switch (data.status) {
                case 1:
                    return 'Idling';
                case 2:
                    if (data.scheduled && data.scheduled > new Date()) {
                        return 'Scheduled';
                    }
                    return 'Sending';
                case 3:
                    return 'Finished';
                case 4:
                    return 'Paused';
            }
            return 'Other';
        };

        res.json({
            draw: req.body.draw,
            recordsTotal: total,
            recordsFiltered: filteredTotal,
            data: data.map((row, i) => [
                (Number(req.body.start) || 0) + 1 + i,
                htmlescape(row.name || ''),
                htmlescape(striptags(row.description) || ''),
                getStatusText(row),
                '<span class="datestring" data-date="' + row.created.toISOString() + '" title="' + row.created.toISOString() + '">' + row.created.toISOString() + '</span>'
            ].concat('<span class="glyphicon glyphicon-wrench" aria-hidden="true"></span><a href="/campaigns/edit/' + row.id + '">Edit</a>'))
        });
    });
});

router.get('/view/:id', passport.csrfProtection, (req, res) => {
    campaigns.get(req.params.id, true, (err, campaign) => {
        if (err || !campaign) {
            req.flash('danger', err && err.message || err || 'Could not find campaign with specified ID');
            return res.redirect('/campaigns');
        }

        lists.get(campaign.list, (err, list) => {
            if (err || !campaign) {
                req.flash('danger', err && err.message || err);
                return res.redirect('/campaigns');
            }

            campaign.csrfToken = req.csrfToken();
            campaign.list = list;

            campaign.isIdling = campaign.status === 1;
            campaign.isSending = campaign.status === 2;
            campaign.isFinished = campaign.status === 3;
            campaign.isPaused = campaign.status === 4;

            campaign.isScheduled = campaign.scheduled && campaign.scheduled > new Date();

            campaign.openRate = campaign.delivered ? Math.round((campaign.opened / campaign.delivered) * 100) : 0;
            campaign.clicksRate = campaign.delivered ? Math.round((campaign.clicks / campaign.delivered) * 100) : 0;

            res.render('campaigns/view', campaign);
        });
    });
});

router.post('/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.delete(req.body.id, (err, deleted) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (deleted) {
            req.flash('success', 'Campaign deleted');
        } else {
            req.flash('info', 'Could not delete specified campaign');
        }

        return res.redirect('/campaigns');
    });
});

router.post('/send', passport.parseForm, passport.csrfProtection, (req, res) => {
    let delayHours = Math.max(Number(req.body['delay-hours']) || 0, 0);
    let delayMinutes = Math.max(Number(req.body['delay-minutes']) || 0, 0);
    let scheduled = new Date(Date.now() + delayHours * 3600 * 1000 + delayMinutes * 60 * 1000);

    campaigns.send(req.body.id, scheduled, (err, scheduled) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (scheduled) {
            req.flash('success', 'Scheduled sending');
        } else {
            req.flash('info', 'Could not schedule sending');
        }

        return res.redirect('/campaigns/view/' + encodeURIComponent(req.body.id));
    });
});

router.post('/resume', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.send(req.body.id, false, (err, scheduled) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (scheduled) {
            req.flash('success', 'Sending resumed');
        } else {
            req.flash('info', 'Could not resume sending');
        }

        return res.redirect('/campaigns/view/' + encodeURIComponent(req.body.id));
    });
});

router.post('/reset', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.reset(req.body.id, (err, reset) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (reset) {
            req.flash('success', 'Sending reset');
        } else {
            req.flash('info', 'Could not reset sending');
        }

        return res.redirect('/campaigns/view/' + encodeURIComponent(req.body.id));
    });
});

router.post('/pause', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.pause(req.body.id, (err, reset) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (reset) {
            req.flash('success', 'Sending paused');
        } else {
            req.flash('info', 'Could not pause sending');
        }

        return res.redirect('/campaigns/view/' + encodeURIComponent(req.body.id));
    });
});

module.exports = router;
