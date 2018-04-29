'use strict';

const lists = require('../models/lists');
const tools = require('../lib/tools');
const blacklist = require('../models/blacklist');
const fields = require('../models/fields');
const { SubscriptionStatus } = require('../shared/lists');
const subscriptions = require('../models/subscriptions');
const confirmations = require('../models/confirmations');
const log = require('npmlog');
const router = require('../lib/router-async').create();
const mailHelpers = require('../lib/subscription-mail-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const contextHelpers = require('../lib/context-helpers');
const shares = require('../models/shares');
const slugify = require('slugify');

class APIError extends Error {
    constructor(msg, status) {
        super(msg);
        this.status = status;
    }
}


router.postAsync('/subscribe/:listId', async (req, res) => {
    const listId = req.params.listId;
    
    const input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });

    if (!input.EMAIL) {
        throw new APIError('Missing EMAIL', 400);
    }

    const emailErr = await tools.validateEmail(input.EMAIL, false);
    if (emailErr) {
        const errMsg = tools.validateEmailGetMessage(emailErr, email);
        log.error('API', errMsg);
        throw new APIError(errMsg, 400);
    }

    if (input.TIMEZONE) {
        subscription.tz = (input.TIMEZONE || '').toString().trim();
    }

    const subscription = await fields.fromPost(req.context, listId);

    if (/^(yes|true|1)$/i.test(input.FORCE_SUBSCRIBE)) {
        subscription.status = SubscriptionStatus.SUBSCRIBED;
    }

    if (/^(yes|true|1)$/i.test(input.REQUIRE_CONFIRMATION)) { // if REQUIRE_CONFIRMATION is set, we assume that the user is not subscribed and will be subscribed
        const list = await lists.getByCid(contextHelpers.getAdminContext(), listId);
        await shares.enforceEntityPermission(req.context, 'list', listId, 'manageSubscriptions');

        const data = {
            email,
            subscriptionData: subscription
        };

        const confirmCid = await confirmations.addConfirmation(listId, 'subscribe', req.ip, data);
        await mailHelpers.sendConfirmSubscription(list, input.EMAIL, confirmCid, subscription);

        res.status(200);
        res.json({
            data: {
                id: confirmCid
            }
        });
    } else {
        subscription.email = input.EMAIL;

        const meta = {
            updateAllowed: true
        };

        await subscriptions.create(req.context, listId, subscription, meta);

        res.status(200);
        res.json({
            data: {
                id: meta.cid
            }
        });
    }
});


router.postAsync('/unsubscribe/:listId', async (req, res) => {
    const input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });

    if (!input.EMAIL) {
        throw new APIError('Missing EMAIL', 400);
    }

    const subscription = await subscriptions.unsubscribeByEmailAndGet(req.context, req.params.listId, input.EMAIL);

    res.status(200);
    res.json({
        data: {
            id: subscription.id,
            unsubscribed: true
        }
    });
});


router.postAsync('/delete/:listId', async (req, res) => {
    const input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });

    if (!input.EMAIL) {
        throw new APIError('Missing EMAIL', 400);
    }

    const subscription = await subscriptions.removeByEmailAndGet(req.context, req.params.listId, input.EMAIL);

    res.status(200);
    res.json({
        data: {
            id: subscription.id,
            deleted: true
        }
    });
});


router.getAsync('/subscriptions/:listId', async (req, res) => {
    const start = parseInt(req.query.start || 0, 10);
    const limit = parseInt(req.query.limit || 10000, 10);

    const { subscriptions, total } = await subscriptions.list(req.params.listId, false, start, limit);

    res.status(200);
    res.json({
        data: {
            total: total,
            start: start,
            limit: limit,
            subscriptions
        }
    });
});

router.getAsync('/lists/:email', async (req, res) => {
    const lists = await subscriptions.getListsWithEmail(req.context, req.params.email);

    res.status(200);
    res.json({
        data: lists
    });
});


router.postAsync('/field/:listId', async (req, res) => {
    const input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });

    const key = (input.NAME || '').toString().trim() || slugify('merge ' + name, '_').toUpperCase();
    const visible = ['false', 'no', '0', ''].indexOf((input.VISIBLE || '').toString().toLowerCase().trim()) < 0;

    const groupTemplate = (input.GROUP_TEMPLATE || '').toString().toLowerCase().trim();

    let type = (input.TYPE || '').toString().toLowerCase().trim();
    const settings = {};

    if (type === 'checkbox') {
        type = 'checkbox-grouped';
        settings.groupTemplate = groupTemplate;
    } else if (type === 'dropdown') {
        type = 'dropdown-grouped';
        settings.groupTemplate = groupTemplate;
    } else if (type === 'radio') {
        type = 'radio-grouped';
        settings.groupTemplate = groupTemplate;
    } else if (type === 'json') {
        settings.groupTemplate = groupTemplate;
    } else if (type === 'date-us') {
        type = 'date';
        settings.dateFormat = 'us';
    } else if (type === 'date-eur') {
        type = 'date';
        settings.dateFormat = 'eur';
    } else if (type === 'birthday-us') {
        type = 'birthday';
        settings.birthdayFormat = 'us';
    } else if (type === 'birthday-eur') {
        type = 'birthday';
        settings.birthdayFormat = 'eur';
    }

    const field = {
        name: (input.NAME || '').toString().trim(),
        key,
        default_value: (input.DEFAULT || '').toString().trim() || null,
        type,
        settings,
        group: Number(input.GROUP) || null,
        orderListBefore: visible ? 'end' : 'none',
        orderSubscribeBefore: visible ? 'end' : 'none',
        orderManageBefore: visible ? 'end' : 'none'
    };

    const id = await fields.create(req.context, req.params.listId, field);

    res.status(200);
    res.json({
        data: {
            id,
            tag: key
        }
    });
});


router.postAsync('/blacklist/add', async (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    if (!(input.EMAIL) || (input.EMAIL === ''))  {
        throw new Error('EMAIL argument is required');
    }

    await blacklist.add(req.context, input.EMAIL);

    res.json({
        data: []
    });
});


router.postAsync('/blacklist/delete', async (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    if (!(input.EMAIL) || (input.EMAIL === '')) {
        throw new Error('EMAIL argument is required');
    }

    await blacklist.remove(req.oontext, input.EMAIL);

    res.json({
        data: []
    });
});


router.getAsync('/blacklist/get', async (req, res) => {
    let start = parseInt(req.query.start || 0, 10);
    let limit = parseInt(req.query.limit || 10000, 10);
    let search = req.query.search || '';

    const { emails, total } = await blacklist.search(req.context, start, limit, search);

    return res.json({
        data: {
            total,
            start: start,
            limit: limit,
            emails
        }
    });
});


module.exports = router;
