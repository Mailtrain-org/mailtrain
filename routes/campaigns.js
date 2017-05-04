'use strict';

let config = require('config');
let express = require('express');
let router = new express.Router();
let lists = require('../lib/models/lists');
let templates = require('../lib/models/templates');
let campaigns = require('../lib/models/campaigns');
let subscriptions = require('../lib/models/subscriptions');
let settings = require('../lib/models/settings');
let tools = require('../lib/tools');
let editorHelpers = require('../lib/editor-helpers.js');
let striptags = require('striptags');
let passport = require('../lib/passport');
let htmlescape = require('escape-html');
let multer = require('multer');
let _ = require('../lib/translate')._;
let util = require('util');
let uploadStorage = multer.memoryStorage();
let uploads = multer({
    storage: uploadStorage
});

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    res.setSelectedMenu('campaigns');
    next();
});

router.get('/', (req, res) => {
    res.render('campaigns/campaigns', {
        title: _('Campaigns')
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
                data.replyTo = data.replyTo || '';
                data.subject = data.subject || configItems.defaultSubject;

                let view;
                switch (req.query.type) {
                    case 'rss':
                        view = 'campaigns/create-rss';
                        break;
                    case 'triggered':
                        view = 'campaigns/create-triggered';
                        break;
                    default:
                        view = 'campaigns/create';
                }
                res.render(view, data);
            });
        });
    });
});

router.post('/create', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.create(req.body, false, (err, id) => {
        if (err || !id) {
            req.flash('danger', err && err.message || err || _('Could not create campaign'));
            return res.redirect('/campaigns/create?' + tools.queryParams(req.body));
        }
        req.flash('success', util.format(_('Campaign “%s” created'), req.body.name));
        res.redirect((req.body.type === 'rss') ?
            '/campaigns/edit/' + id :
            '/campaigns/edit/' + id + '?tab=template'
        );
    });
});

router.get('/edit/:id', passport.csrfProtection, (req, res, next) => {
    campaigns.get(req.params.id, false, (err, campaign) => {
        if (err || !campaign) {
            req.flash('danger', err && err.message || err || _('Could not find campaign with specified ID'));
            return res.redirect('/campaigns');
        }

        campaigns.getAttachments(campaign.id, (err, attachments) => {
            if (err) {
                return next(err);
            }
            campaign.attachments = attachments;

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
                    campaign.editorName = campaign.editorName || 'summernote';
                    campaign.editorConfig = config[campaign.editorName];

                    campaign.disableWysiwyg = configItems.disableWysiwyg;
                    campaign.showGeneral = req.query.tab === 'general' || !req.query.tab;
                    campaign.showTemplate = req.query.tab === 'template';
                    campaign.showAttachments = req.query.tab === 'attachments';

                    let view;
                    switch (campaign.type) {
                        case 4: //triggered
                            view = 'campaigns/edit-triggered';
                            break;
                        case 2: //rss
                            view = 'campaigns/edit-rss';
                            break;
                        case 1:
                        default:
                            view = 'campaigns/edit';
                    }

                    editorHelpers.getMergeTagsForResource(campaign, (err, mergeTags) => {
                        if (err) {
                            req.flash('danger', err.message || err);
                            return res.redirect('/');
                        }

                        campaign.mergeTags = mergeTags;
                        res.render(view, campaign);
                    });
                });
            });
        });
    });
});

router.post('/edit', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.update(req.body.id, req.body, (err, updated) => {
        if (err) {
            req.flash('danger', err.message || err);
        } else if (updated) {
            req.flash('success', _('Campaign settings updated'));
        } else {
            req.flash('info', _('Campaign settings not updated'));
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
            req.flash('success', _('Campaign deleted'));
        } else {
            req.flash('info', _('Could not delete specified campaign'));
        }

        return res.redirect('/campaigns');
    });
});

router.post('/ajax', (req, res) => {
    campaigns.filter(req.body, Number(req.query.parent) || false, (err, data, total, filteredTotal) => {
        if (err) {
            return res.json({
                error: err.message || err,
                data: []
            });
        }

        let getStatusText = data => {
            switch (data.status) {
                case 1:
                    return _('Idling');
                case 2:
                    if (data.scheduled && data.scheduled > new Date()) {
                        return _('Scheduled');
                    }
                    return '<span class="glyphicon glyphicon-refresh spinning"></span> ' + _('Sending') + '…';
                case 3:
                    return _('Finished');
                case 4:
                    return _('Paused');
                case 5:
                    return _('Inactive');
                case 6:
                    return _('Active');
            }
            return _('Other');
        };

        res.json({
            draw: req.body.draw,
            recordsTotal: total,
            recordsFiltered: filteredTotal,
            data: data.map((row, i) => [
                (Number(req.body.start) || 0) + 1 + i,
                '<span class="glyphicon glyphicon-inbox" aria-hidden="true"></span> <a href="/campaigns/view/' + row.id + '">' + htmlescape(row.name || '') + '</a>',
                htmlescape(striptags(row.description) || ''),
                getStatusText(row),
                '<span class="datestring" data-date="' + row.created.toISOString() + '" title="' + row.created.toISOString() + '">' + row.created.toISOString() + '</span>'
            ].concat('<span class="glyphicon glyphicon-wrench" aria-hidden="true"></span><a href="/campaigns/edit/' + row.id + '">' + _('Edit') + '</a>'))
        });
    });
});

router.get('/view/:id', passport.csrfProtection, (req, res) => {
    campaigns.get(req.params.id, true, (err, campaign) => {
        if (err || !campaign) {
            req.flash('danger', err && err.message || err || _('Could not find campaign with specified ID'));
            return res.redirect('/campaigns');
        }

        let getList = (listId, callback) => {
            lists.get(listId, (err, list) => {
                if (err) {
                    return callback(err);
                }
                if (!list) {
                    list = {
                        id: listId
                    };
                }
                subscriptions.listTestUsers(listId, (err, testUsers) => {
                    if (err || !testUsers) {
                        testUsers = [];
                    }
                    return callback(null, list, testUsers);
                });
            });
        };

        getList(campaign.list, (err, list, testUsers) => {
            if (err) {
                req.flash('danger', err && err.message || err);
                return res.redirect('/campaigns');
            }

            campaign.csrfToken = req.csrfToken();

            campaign.list = list;
            campaign.testUsers = testUsers;

            campaign.isIdling = campaign.status === 1;
            campaign.isSending = campaign.status === 2;
            campaign.isFinished = campaign.status === 3;
            campaign.isPaused = campaign.status === 4;
            campaign.isInactive = campaign.status === 5;
            campaign.isActive = campaign.status === 6;

            campaign.isNormal = campaign.type === 1 || campaign.type === 3;
            campaign.isRss = campaign.type === 2;
            campaign.isTriggered = campaign.type === 4;

            campaign.isScheduled = campaign.scheduled && campaign.scheduled > new Date();

            // show only messages that weren't bounced as delivered
            campaign.delivered = campaign.delivered - campaign.bounced;

            campaign.openRate = campaign.delivered ? Math.round((campaign.opened / campaign.delivered) * 10000) / 100 : 0;
            campaign.clicksRate = campaign.delivered ? Math.round((campaign.clicks / campaign.delivered) * 10000) / 100 : 0;
            campaign.bounceRate = campaign.delivered ? Math.round((campaign.bounced / campaign.delivered) * 10000) / 100 : 0;
            campaign.complaintRate = campaign.delivered ? Math.round((campaign.complained / campaign.delivered) * 10000) / 100 : 0;
            campaign.unsubscribeRate = campaign.delivered ? Math.round((campaign.unsubscribed / campaign.delivered) * 10000) / 100 : 0;

            campaigns.getLinks(campaign.id, (err, links) => {
                if (err) {
                    // ignore
                }
                let index = 0;
                campaign.links = (links || []).map(link => {
                    link.index = ++index;
                    link.totalPercentage = campaign.delivered ? Math.round(((link.clicks / campaign.delivered) * 100) * 1000) / 1000 : 0;
                    link.relPercentage = campaign.clicks ? Math.round(((link.clicks / campaign.clicks) * 100) * 1000) / 1000 : 0;
                    link.short = link.url.replace(/^https?:\/\/(www.)?/i, '');
                    if (link.short > 63) {
                        link.short = link.short.substr(0, 60) + '…';
                    }
                    return link;
                });
                campaign.showOverview = !req.query.tab || req.query.tab === 'overview';
                campaign.showLinks = req.query.tab === 'links';
                res.render('campaigns/view', campaign);
            });
        });
    });
});

router.post('/preview/:id', passport.parseForm, passport.csrfProtection, (req, res) => {
    let campaign = req.body.campaign;
    let list = req.body.list;
    let listId = req.body.listId;
    let subscription = req.body.subscriber;

    if (subscription === '_create') {
        return res.redirect('/lists/subscription/' + encodeURIComponent(listId) + '/add/?is-test=true');
    }

    res.redirect('/archive/' + encodeURIComponent(campaign) + '/' + encodeURIComponent(list) + '/' + encodeURIComponent(subscription) + '?track=no');
});

router.get('/opened/:id', passport.csrfProtection, (req, res) => {
    campaigns.get(req.params.id, true, (err, campaign) => {
        if (err || !campaign) {
            req.flash('danger', err && err.message || err || _('Could not find campaign with specified ID'));
            return res.redirect('/campaigns');
        }

        lists.get(campaign.list, (err, list) => {
            if (err || !campaign) {
                req.flash('danger', err && err.message || err);
                return res.redirect('/campaigns');
            }

            campaign.csrfToken = req.csrfToken();
            campaign.list = list;

            // show only messages that weren't bounced as delivered
            campaign.delivered = campaign.delivered - campaign.bounced;
            campaign.clicksRate = campaign.delivered ? Math.round((campaign.clicks / campaign.delivered) * 100) : 0;

            res.render('campaigns/opened', campaign);
        });
    });
});

router.get('/status/:id/:status', passport.csrfProtection, (req, res) => {
    let id = Number(req.params.id) || 0;
    let status;
    switch (req.params.status) {
        case 'delivered':
            status = 1;
            break;
        case 'unsubscribed':
            status = 2;
            break;
        case 'bounced':
            status = 3;
            break;
        case 'complained':
            status = 4;
            break;
        case 'blacklisted':
            status = 5;
            break;
        default:
            req.flash('danger', _('Unknown status selector'));
            return res.redirect('/campaigns');
    }

    campaigns.get(id, true, (err, campaign) => {
        if (err || !campaign) {
            req.flash('danger', err && err.message || err || _('Could not find campaign with specified ID'));
            return res.redirect('/campaigns');
        }

        let getList = (listId, callback) => {
            lists.get(listId, (err, list) => {
                if (err) {
                    return callback(err);
                }
                if (!list) {
                    list = {
                        id: listId
                    };
                }
                return callback(null, list);
            });
        };

        getList(campaign.list, (err, list) => {
            if (err) {
                req.flash('danger', err && err.message || err);
                return res.redirect('/campaigns');
            }

            campaign.csrfToken = req.csrfToken();
            campaign.list = list;

            // show only messages that weren't bounced as delivered
            campaign.delivered = campaign.delivered - campaign.bounced;
            campaign.clicksRate = campaign.delivered ? Math.round((campaign.clicks / campaign.delivered) * 100) : 0;
            campaign.status = status;

            res.render('campaigns/' + req.params.status, campaign);
        });
    });
});

router.get('/clicked/:id/:linkId', passport.csrfProtection, (req, res) => {
    campaigns.get(req.params.id, true, (err, campaign) => {
        if (err || !campaign) {
            req.flash('danger', err && err.message || err || _('Could not find campaign with specified ID'));
            return res.redirect('/campaigns');
        }

        let getList = (listId, callback) => {
            lists.get(listId, (err, list) => {
                if (err) {
                    return callback(err);
                }
                if (!list) {
                    list = {
                        id: listId
                    };
                }
                return callback(null, list);
            });
        };

        getList(campaign.list, (err, list) => {
            if (err) {
                req.flash('danger', err && err.message || err);
                return res.redirect('/campaigns');
            }

            campaign.csrfToken = req.csrfToken();
            campaign.list = list;

            // show only messages that weren't bounced as delivered
            campaign.delivered = campaign.delivered - campaign.bounced;
            campaign.clicksRate = campaign.delivered ? Math.round((campaign.clicks / campaign.delivered) * 100) : 0;

            if (req.params.linkId === 'all') {
                campaign.aggregated = true;
                campaign.link = {
                    id: 0
                };
                res.render('campaigns/clicked', campaign);
            } else {
                campaigns.getLinks(campaign.id, req.params.linkId, (err, links) => {
                    if (err) {
                        // ignore
                    }
                    let index = 0;
                    campaign.link = (links || []).map(link => {
                        link.index = ++index;
                        link.totalPercentage = campaign.delivered ? Math.round(((link.clicks / campaign.delivered) * 100) * 1000) / 1000 : 0;
                        link.relPercentage = campaign.clicks ? Math.round(((link.clicks / campaign.clicks) * 100) * 1000) / 1000 : 0;
                        link.short = link.url.replace(/^https?:\/\/(www.)?/i, '');
                        if (link.short > 63) {
                            link.short = link.short.substr(0, 60) + '…';
                        }
                        return link;
                    }).shift();
                    res.render('campaigns/clicked', campaign);
                });
            }
        });
    });
});

router.post('/clicked/ajax/:id/:linkId', (req, res) => {
    let linkId = Number(req.params.linkId) || 0;

    campaigns.get(req.params.id, true, (err, campaign) => {
        if (err || !campaign) {
            return res.json({
                error: err && err.message || err || _('Campaign not found'),
                data: []
            });
        }
        lists.get(campaign.list, (err, list) => {
            if (err) {
                return res.json({
                    error: err && err.message || err,
                    data: []
                });
            }

            let campaignCid = campaign.cid;
            let listCid = list.cid;

            let columns = ['#', 'email', 'first_name', 'last_name', 'campaign_tracker__' + campaign.id + '`.`created', 'count'];
            campaigns.filterClickedSubscribers(campaign, linkId, req.body, columns, (err, data, total, filteredTotal) => {
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
                        '<a href="/archive/' + encodeURIComponent(campaignCid) + '/' + encodeURIComponent(listCid) + '/' + encodeURIComponent(row.cid) + '?track=no">' + ((Number(req.body.start) || 0) + 1 + i) + '</a>',
                        htmlescape(row.email || ''),
                        htmlescape(row.firstName || ''),
                        htmlescape(row.lastName || ''),
                        row.created && row.created.toISOString ? '<span class="datestring" data-date="' + row.created.toISOString() + '" title="' + row.created.toISOString() + '">' + row.created.toISOString() + '</span>' : 'N/A',
                        row.count,
                        '<span class="glyphicon glyphicon-wrench" aria-hidden="true"></span><a href="/lists/subscription/' + campaign.list + '/edit/' + row.cid + '">' + _('Edit') + '</a>'
                    ])
                });
            });
        });
    });
});

router.post('/clicked/ajax/:id/:linkId/stats', (req, res) => {
    let linkId = Number(req.params.linkId) || 0;
    campaigns.get(req.params.id, true, (err, campaign) => {
        if (err || !campaign) {
            return res.json({
                error: err && err.message || err || _('Campaign not found'),
                data: []
            });
        }
        lists.get(campaign.list, (err, list) => {
            if (err) {
                return res.json({
                    error: err && err.message || err,
                    data: []
                });
            }

            let column = req.body.column;
            let limit = req.body.limit;

            campaigns.statsClickedSubscribersByColumn(campaign, linkId, req.body, column, limit, (err, data, total) => {
                if (err) {
                    return res.json({
                        error: err.message || err,
                        data: []
                    });
                }

                res.json({
                    draw: req.body.draw,
                    total: total,
                    data: data
                });
            });
        });
    });
});


router.post('/status/ajax/:id/:status', (req, res) => {
    let status = Number(req.params.status) || 0;

    campaigns.get(req.params.id, true, (err, campaign) => {
        if (err || !campaign) {
            return res.json({
                error: err && err.message || err || _('Campaign not found'),
                data: []
            });
        }

        lists.get(campaign.list, (err, list) => {
            if (err) {
                return res.json({
                    error: err && err.message || err,
                    data: []
                });
            }

            let campaignCid = campaign.cid;
            let listCid = list.cid;

            let columns = ['#', 'email', 'first_name', 'last_name', 'campaign__' + campaign.id + '`.`updated'];
            campaigns.filterStatusSubscribers(campaign, status, req.body, columns, (err, data, total, filteredTotal) => {
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
                        '<a href="/archive/' + encodeURIComponent(campaignCid) + '/' + encodeURIComponent(listCid) + '/' + encodeURIComponent(row.cid) + '?track=no">' + ((Number(req.body.start) || 0) + 1 + i) + '</a>',
                        htmlescape(row.email || ''),
                        htmlescape(row.firstName || ''),
                        htmlescape(row.lastName || ''),
                        htmlescape(row.response || ''),
                        row.updated && row.created.toISOString ? '<span class="datestring" data-date="' + row.updated.toISOString() + '" title="' + row.updated.toISOString() + '">' + row.updated.toISOString() + '</span>' : 'N/A',
                        '<span class="glyphicon glyphicon-wrench" aria-hidden="true"></span><a href="/lists/subscription/' + campaign.list + '/edit/' + row.cid + '">' + _('Edit') + '</a>'
                    ])
                });
            });
        });
    });
});

router.post('/clicked/ajax/:id/:linkId', (req, res) => {
    let linkId = Number(req.params.linkId) || 0;

    campaigns.get(req.params.id, true, (err, campaign) => {
        if (err || !campaign) {
            return res.json({
                error: err && err.message || err || _('Campaign not found'),
                data: []
            });
        }
        lists.get(campaign.list, (err, list) => {
            if (err) {
                return res.json({
                    error: err && err.message || err,
                    data: []
                });
            }

            let campaignCid = campaign.cid;
            let listCid = list.cid;

            let columns = ['#', 'email', 'first_name', 'last_name', 'campaign_tracker__' + campaign.id + '`.`created', 'count'];
            campaigns.filterClickedSubscribers(campaign, linkId, req.body, columns, (err, data, total, filteredTotal) => {
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
                        '<a href="/archive/' + encodeURIComponent(campaignCid) + '/' + encodeURIComponent(listCid) + '/' + encodeURIComponent(row.cid) + '?track=no">' + ((Number(req.body.start) || 0) + 1 + i) + '</a>',
                        htmlescape(row.email || ''),
                        htmlescape(row.firstName || ''),
                        htmlescape(row.lastName || ''),
                        row.created && row.created.toISOString ? '<span class="datestring" data-date="' + row.created.toISOString() + '" title="' + row.created.toISOString() + '">' + row.created.toISOString() + '</span>' : 'N/A',
                        row.count,
                        '<span class="glyphicon glyphicon-wrench" aria-hidden="true"></span><a href="/lists/subscription/' + campaign.list + '/edit/' + row.cid + '">' + _('Edit') + '</a>'
                    ])
                });
            });
        });
    });
});

router.post('/quicklist/ajax', (req, res) => {
    campaigns.filterQuicklist(req.body, (err, data, total, filteredTotal) => {
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
            data: data.map((row, i) => ({
                "0": (Number(req.body.start) || 0) + 1 + i,
                "1": '<span class="glyphicon glyphicon-inbox" aria-hidden="true"></span> <a href="/campaigns/view/' + row.id + '">' + htmlescape(row.name || '') + '</a>',
                "2": htmlescape(striptags(row.description) || ''),
                "3": '<span class="datestring" data-date="' + row.created.toISOString() + '" title="' + row.created.toISOString() + '">' + row.created.toISOString() + '</span>',
                "DT_RowId": row.id
            }))
        });
    });
});


router.post('/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.delete(req.body.id, (err, deleted) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (deleted) {
            req.flash('success', _('Campaign deleted'));
        } else {
            req.flash('info', _('Could not delete specified campaign'));
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
            req.flash('success', _('Scheduled sending'));
        } else {
            req.flash('info', _('Could not schedule sending'));
        }

        return res.redirect('/campaigns/view/' + encodeURIComponent(req.body.id));
    });
});

router.post('/resume', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.send(req.body.id, false, (err, scheduled) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (scheduled) {
            req.flash('success', _('Sending resumed'));
        } else {
            req.flash('info', _('Could not resume sending'));
        }

        return res.redirect('/campaigns/view/' + encodeURIComponent(req.body.id));
    });
});

router.post('/reset', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.reset(req.body.id, (err, reset) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (reset) {
            req.flash('success', _('Sending reset'));
        } else {
            req.flash('info', _('Could not reset sending'));
        }

        return res.redirect('/campaigns/view/' + encodeURIComponent(req.body.id));
    });
});

router.post('/pause', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.pause(req.body.id, (err, reset) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (reset) {
            req.flash('success', _('Sending paused'));
        } else {
            req.flash('info', _('Could not pause sending'));
        }

        return res.redirect('/campaigns/view/' + encodeURIComponent(req.body.id));
    });
});

router.post('/activate', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.activate(req.body.id, (err, reset) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (reset) {
            req.flash('success', _('Sending activated'));
        } else {
            req.flash('info', _('Could not activate sending'));
        }

        return res.redirect('/campaigns/view/' + encodeURIComponent(req.body.id));
    });
});

router.post('/inactivate', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.inactivate(req.body.id, (err, reset) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (reset) {
            req.flash('success', _('Sending paused'));
        } else {
            req.flash('info', _('Could not pause sending'));
        }

        return res.redirect('/campaigns/view/' + encodeURIComponent(req.body.id));
    });
});

router.post('/attachment', uploads.single('attachment'), passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.get(req.body.id, false, (err, campaign) => {
        if (err || !campaign) {
            req.flash('danger', err && err.message || err || _('Could not find campaign with specified ID'));
            return res.redirect('/campaigns');
        }
        campaigns.addAttachment(campaign.id, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            content: req.file.buffer
        }, (err, attachmentId) => {
            if (err) {
                req.flash('danger', err && err.message || err);
            } else if (attachmentId) {
                req.flash('success', _('Attachment uploaded'));
            } else {
                req.flash('info', _('Could not store attachment'));
            }
            return res.redirect('/campaigns/edit/' + campaign.id + '?tab=attachments');
        });
    });
});

router.post('/attachment/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.get(req.body.id, false, (err, campaign) => {
        if (err || !campaign) {
            req.flash('danger', err && err.message || err || _('Could not find campaign with specified ID'));
            return res.redirect('/campaigns');
        }
        campaigns.deleteAttachment(campaign.id, Number(req.body.attachment), (err, deleted) => {
            if (err) {
                req.flash('danger', err && err.message || err);
            } else if (deleted) {
                req.flash('success', _('Attachment deleted'));
            } else {
                req.flash('info', _('Could not delete attachment'));
            }
            return res.redirect('/campaigns/edit/' + campaign.id + '?tab=attachments');
        });
    });
});

router.post('/attachment/download', passport.parseForm, passport.csrfProtection, (req, res) => {
    campaigns.get(req.body.id, false, (err, campaign) => {
        if (err || !campaign) {
            req.flash('danger', err && err.message || err || _('Could not find campaign with specified ID'));
            return res.redirect('/campaigns');
        }
        campaigns.getAttachment(campaign.id, Number(req.body.attachment), (err, attachment) => {
            if (err) {
                req.flash('danger', err && err.message || err);
                return res.redirect('/campaigns/edit/' + campaign.id + '?tab=attachments');
            } else if (!attachment) {
                req.flash('warning', _('Attachment not found'));
                return res.redirect('/campaigns/edit/' + campaign.id + '?tab=attachments');
            }

            res.set('Content-Disposition', 'attachment; filename="' + encodeURIComponent(attachment.filename).replace(/['()]/g, escape) + '"');
            res.set('Content-Type', attachment.contentType);
            res.send(attachment.content);
        });
    });
});

router.get('/attachment/:campaign', passport.csrfProtection, (req, res) => {
    campaigns.get(req.params.campaign, false, (err, campaign) => {
        if (err || !campaign) {
            req.flash('danger', err && err.message || err || _('Could not find campaign with specified ID'));
            return res.redirect('/campaigns');
        }
        campaign.csrfToken = req.csrfToken();
        res.render('campaigns/upload-attachment', campaign);
    });
});


module.exports = router;
