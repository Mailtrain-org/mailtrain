'use strict';

let express = require('express');
let router = new express.Router();
let passport = require('../lib/passport');
let lists = require('../lib/models/lists');
let segments = require('../lib/models/segments');
let tools = require('../lib/tools');
let _ = require('../lib/translate')._;

router.all('/*', (req, res, next) => {
    if (!req.user) {
        req.flash('danger', _('Need to be logged in to access restricted content'));
        return res.redirect('/users/login?next=' + encodeURIComponent(req.originalUrl));
    }
    res.setSelectedMenu('lists');
    next();
});

router.get('/:list', (req, res) => {
    lists.get(req.params.list, (err, list) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        if (!list) {
            req.flash('danger', _('Selected list ID not found'));
            return res.redirect('/');
        }

        segments.list(list.id, (err, rows) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/fields/' + encodeURIComponent(req.params.list));
            }

            let index = 0;
            res.render('lists/segments/segments', {
                rows: rows.map(row => {
                    row.index = ++index;
                    row.type = row.type === 1 ? 'ALL' : 'ANY';
                    return row;
                }),
                list
            });
        });
    });
});

router.get('/:list/create', passport.csrfProtection, (req, res) => {
    lists.get(req.params.list, (err, list) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        if (!list) {
            req.flash('danger', _('Selected list ID not found'));
            return res.redirect('/');
        }

        let segment = tools.convertKeys(req.query, {
            skip: ['layout']
        });

        segment.csrfToken = req.csrfToken();
        segment.list = list;

        switch (Number(segment.type) || 0) {
            case 1:
                segment.matchAll = true;
                break;
            case 2:
                segment.matchAny = true;
                break;
        }

        res.render('lists/segments/create', segment);
    });
});

router.post('/:list/create', passport.parseForm, passport.csrfProtection, (req, res) => {
    segments.create(req.params.list, req.body, (err, id) => {
        if (err || !id) {
            req.flash('danger', err && err.message || err || _('Could not create segment'));
            return res.redirect('/segments/' + encodeURIComponent(req.params.list) + '/create?' + tools.queryParams(req.body));
        }
        req.flash('success', _('Segment created'));
        res.redirect('/segments/' + encodeURIComponent(req.params.list) + '/view/' + id);
    });
});

router.get('/:list/view/:id', (req, res) => {
    lists.get(req.params.list, (err, list) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        if (!list) {
            req.flash('danger', _('Selected list ID not found'));
            return res.redirect('/');
        }

        segments.get(req.params.id, (err, segment) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/');
            }

            if (!segment) {
                req.flash('danger', _('Selected segment ID not found'));
                return res.redirect('/');
            }

            segment.list = list;
            segment.rules.forEach((rule, i) => {
                rule.index = i + 1;
            });

            switch (Number(segment.type) || 0) {
                case 1:
                    segment.type = 'ALL';
                    break;
                case 2:
                    segment.type = 'ANY';
                    break;
            }

            segments.subscribers(req.params.id, true, (err, subscribers) => {
                if (err) {
                    // ignore
                }
                segment.subscribers = subscribers || 0;

                res.render('lists/segments/view', segment);
            });
        });
    });
});

router.get('/:list/edit/:segment', passport.csrfProtection, (req, res) => {
    lists.get(req.params.list, (err, list) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        if (!list) {
            req.flash('danger', _('Selected list ID not found'));
            return res.redirect('/');
        }

        segments.get(req.params.segment, (err, segment) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/segments/' + encodeURIComponent(req.params.list));
            }

            if (!segment) {
                req.flash('danger', 'Selected segment not found');
                return res.redirect('/segments/' + encodeURIComponent(req.params.list));
            }

            segment.csrfToken = req.csrfToken();
            segment.list = list;

            switch (Number(segment.type) || 0) {
                case 1:
                    segment.matchAll = true;
                    break;
                case 2:
                    segment.matchAny = true;
                    break;
            }

            res.render('lists/segments/edit', segment);
        });
    });
});

router.post('/:list/edit', passport.parseForm, passport.csrfProtection, (req, res) => {
    segments.update(req.body.id, req.body, (err, updated) => {
        if (err) {
            req.flash('danger', err.message || err);
        } else if (updated) {
            req.flash('success', _('Segment settings updated'));
        } else {
            req.flash('info', _('Segment settings not updated'));
        }

        if (req.body.id) {
            return res.redirect('/segments/' + encodeURIComponent(req.params.list) + '/view/' + encodeURIComponent(req.body.id));
        } else {
            return res.redirect('/segments/' + encodeURIComponent(req.params.list));
        }
    });
});

router.post('/:list/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    segments.delete(req.body.id, (err, deleted) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (deleted) {
            req.flash('success', _('Segment deleted'));
        } else {
            req.flash('info', _('Could not delete specified segment'));
        }

        return res.redirect('/segments/' + encodeURIComponent(req.params.list));
    });
});

router.get('/:list/rules/:segment/create', passport.csrfProtection, (req, res) => {
    lists.get(req.params.list, (err, list) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        if (!list) {
            req.flash('danger', _('Selected list ID not found'));
            return res.redirect('/');
        }

        segments.get(req.params.segment, (err, segment) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/segments/' + encodeURIComponent(req.params.list));
            }

            if (!segment) {
                req.flash('danger', 'Selected segment not found');
                return res.redirect('/segments/' + encodeURIComponent(req.params.list));
            }

            segment.csrfToken = req.csrfToken();

            segment.list = list;

            res.render('lists/segments/rule-create', segment);
        });
    });
});

router.post('/:list/rules/:segment/next', passport.parseForm, passport.csrfProtection, (req, res) => {
    lists.get(req.params.list, (err, list) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        if (!list) {
            req.flash('danger', _('Selected list ID not found'));
            return res.redirect('/');
        }

        segments.get(req.params.segment, (err, segment) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/segments/' + encodeURIComponent(req.params.list));
            }

            if (!segment) {
                req.flash('danger', _('Selected segment not found'));
                return res.redirect('/segments/' + encodeURIComponent(req.params.list));
            }

            let column = segment.columns.filter(column => column.column === req.body.column).pop();
            if (!column) {
                req.flash('danger', _('Invalid rule type'));
                return res.redirect('/segments/' + encodeURIComponent(req.params.list) + '/rules/' + segment.id + '/create?' + tools.queryParams(req.body));
            }

            return res.redirect('/segments/' + encodeURIComponent(req.params.list) + '/rules/' + segment.id + '/configure?' + tools.queryParams(req.body));
        });
    });
});

router.get('/:list/rules/:segment/configure', passport.csrfProtection, (req, res) => {
    lists.get(req.params.list, (err, list) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        if (!list) {
            req.flash('danger', _('Selected list ID not found'));
            return res.redirect('/');
        }

        segments.get(req.params.segment, (err, segment) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/segments/' + encodeURIComponent(req.params.list));
            }

            if (!segment) {
                req.flash('danger', _('Selected segment not found'));
                return res.redirect('/segments/' + encodeURIComponent(req.params.list));
            }

            let column = segment.columns.filter(column => column.column === req.query.column).pop();
            if (!column) {
                req.flash('danger', _('Invalid rule type'));
                return res.redirect('/segments/' + encodeURIComponent(req.params.list) + '/rules/' + segment.id + '/create?' + tools.queryParams(req.body));
            }

            let data = tools.convertKeys(req.query, {
                skip: ['layout']
            });

            segment.csrfToken = req.csrfToken();

            segment.value = data;
            segment.list = list;
            segment.column = column;
            segment['columnType' + column.type.replace(/^[a-z]/, c => c.toUpperCase())] = true;

            segment.useEditor = true;

            res.render('lists/segments/rule-configure', segment);
        });
    });
});

router.post('/:list/rules/:segment/create', passport.parseForm, passport.csrfProtection, (req, res) => {
    lists.get(req.params.list, (err, list) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        if (!list) {
            req.flash('danger', _('Selected list ID not found'));
            return res.redirect('/');
        }

        segments.createRule(req.params.segment, req.body, (err, id) => {
            if (err || !id) {
                req.flash('danger', err && err.message || err || _('Could not create rule'));
                return res.redirect('/segments/' + encodeURIComponent(req.params.list) + '/rules/' + encodeURIComponent(req.params.segment) + '/configure?' + tools.queryParams(req.body));
            }
            req.flash('success', _('Rule created'));
            res.redirect('/segments/' + encodeURIComponent(req.params.list) + '/view/' + encodeURIComponent(req.params.segment));
        });
    });
});

router.get('/:list/rules/:segment/edit/:rule', passport.csrfProtection, (req, res) => {
    lists.get(req.params.list, (err, list) => {
        if (err) {
            req.flash('danger', err.message || err);
            return res.redirect('/');
        }

        if (!list) {
            req.flash('danger', _('Selected list ID not found'));
            return res.redirect('/');
        }

        segments.get(req.params.segment, (err, segment) => {
            if (err) {
                req.flash('danger', err.message || err);
                return res.redirect('/segments/' + encodeURIComponent(req.params.list));
            }

            if (!segment) {
                req.flash('danger', _('Selected segment not found'));
                return res.redirect('/segments/' + encodeURIComponent(req.params.list));
            }

            segments.getRule(req.params.rule, (err, rule) => {
                if (err) {
                    req.flash('danger', err.message || err);
                    return res.redirect('/segments/' + encodeURIComponent(req.params.list));
                }

                if (!segment) {
                    req.flash('danger', _('Selected segment not found'));
                    return res.redirect('/segments/' + encodeURIComponent(req.params.list));
                }

                let column = segment.columns.filter(column => column.column === rule.column).pop();
                if (!column) {
                    req.flash('danger', _('Invalid rule type'));
                    return res.redirect('/segments/' + encodeURIComponent(req.params.list) + '/view/' + segment.id);
                }

                rule.csrfToken = req.csrfToken();
                rule.list = list;
                rule.segment = segment;
                rule.column = column;
                rule['columnType' + column.type.replace(/^[a-z]/, c => c.toUpperCase())] = true;

                rule.useEditor = true;

                res.render('lists/segments/rule-edit', rule);
            });
        });
    });
});

router.post('/:list/rules/:segment/edit', passport.parseForm, passport.csrfProtection, (req, res) => {
    segments.updateRule(req.body.id, req.body, (err, updated) => {
        if (err) {
            req.flash('danger', err.message || err);
        } else if (updated) {
            req.flash('success', _('Rule settings updated'));
        } else {
            req.flash('info', _('Rule settings not updated'));
        }

        if (req.params.segment) {
            return res.redirect('/segments/' + encodeURIComponent(req.params.list) + '/view/' + encodeURIComponent(req.params.segment));
        } else {
            return res.redirect('/segments/' + encodeURIComponent(req.params.list));
        }
    });
});

router.post('/:list/rules/:segment/delete', passport.parseForm, passport.csrfProtection, (req, res) => {
    segments.deleteRule(req.body.id, (err, deleted) => {
        if (err) {
            req.flash('danger', err && err.message || err);
        } else if (deleted) {
            req.flash('success', _('Rule deleted'));
        } else {
            req.flash('info', _('Could not delete specified rule'));
        }

        return res.redirect('/segments/' + encodeURIComponent(req.params.list) + '/view/' + encodeURIComponent(req.params.segment));
    });
});

module.exports = router;
