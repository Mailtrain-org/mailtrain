'use strict';

const config = require('config');
const lists = require('../models/lists');
const tools = require('../lib/tools');
const blacklist = require('../models/blacklist');
const fields = require('../models/fields');
const { SubscriptionStatus, SubscriptionSource } = require('../../shared/lists');
const subscriptions = require('../models/subscriptions');
const confirmations = require('../models/confirmations');
const log = require('../lib/log');
const router = require('../lib/router-async').create();
const mailHelpers = require('../lib/subscription-mail-helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const contextHelpers = require('../lib/context-helpers');
const shares = require('../models/shares');
const slugify = require('slugify');
const passport = require('../lib/passport');
const templates = require('../models/templates');
const campaigns = require('../models/campaigns');
const {castToInteger} = require('../lib/helpers');
const {getSystemSendConfigurationId} = require('../../shared/send-configurations');

class APIError extends Error {
    constructor(msg, status) {
        super(msg);
        this.status = status;
    }
}


router.postAsync('/subscribe/:listCid', passport.loggedIn, async (req, res) => {
    const list = await lists.getByCid(req.context, req.params.listCid);
    await shares.enforceEntityPermission(req.context, 'list', list.id, 'manageSubscriptions');

    const input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });

    if (!input.EMAIL) {
        throw new APIError('Missing EMAIL', 400);
    }

    const emailErr = await tools.validateEmail(input.EMAIL);
    if (emailErr) {
        const errMsg = tools.validateEmailGetMessage(emailErr, input.email);
        log.error('API', errMsg);
        throw new APIError(errMsg, 400);
    }

    const subscription = await fields.fromAPI(req.context, list.id, input);

    if (input.TIMEZONE) {
        subscription.tz = (input.TIMEZONE || '').toString().trim();
    }

    if (/^(yes|true|1)$/i.test(input.FORCE_SUBSCRIBE)) {
        subscription.status = SubscriptionStatus.SUBSCRIBED;
    }

    if (/^(yes|true|1)$/i.test(input.REQUIRE_CONFIRMATION)) { // if REQUIRE_CONFIRMATION is set, we assume that the user is not subscribed and will be subscribed
        const data = {
            email: input.EMAIL,
            subscriptionData: subscription
        };

        const confirmCid = await confirmations.addConfirmation(list.id, 'subscribe', req.ip, data);
        await mailHelpers.sendConfirmSubscription(req.locale, list, input.EMAIL, confirmCid, subscription);

        res.status(200);
        res.json({
            data: {
                id: confirmCid
            }
        });
    } else {
        subscription.email = input.EMAIL;

        const meta = {
            updateAllowed: true,
            subscribeIfNoExisting: true
        };

        await subscriptions.create(req.context, list.id, subscription, SubscriptionSource.API, meta);

        res.status(200);
        res.json({
            data: {
                id: meta.cid
            }
        });
    }
});


router.postAsync('/unsubscribe/:listCid', passport.loggedIn, async (req, res) => {
    const list = await lists.getByCid(req.context, req.params.listCid);
    const input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });

    if (!input.EMAIL) {
        throw new APIError('Missing EMAIL', 400);
    }

    const subscription = await subscriptions.unsubscribeByEmailAndGet(req.context, list.id, input.EMAIL);

    res.status(200);
    res.json({
        data: {
            id: subscription.id,
            unsubscribed: true
        }
    });
});


router.postAsync('/delete/:listCid', passport.loggedIn, async (req, res) => {
    const list = await lists.getByCid(req.context, req.params.listCid);
    const input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });

    if (!input.EMAIL) {
        throw new APIError('Missing EMAIL', 400);
    }

    const subscription = await subscriptions.removeByEmailAndGet(req.context, list.id, input.EMAIL);

    res.status(200);
    res.json({
        data: {
            id: subscription.id,
            deleted: true
        }
    });
});


router.getAsync('/subscriptions/:listCid', passport.loggedIn, async (req, res) => {
    const list = await lists.getByCid(req.context, req.params.listCid);
    const start = parseInt(req.query.start || 0, 10);
    const limit = parseInt(req.query.limit || 10000, 10);

    const { subscriptions, total } = await subscriptions.list(list.id, false, start, limit);

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

router.getAsync('/lists/:email', passport.loggedIn, async (req, res) => {
    const lists = await subscriptions.getListsWithEmail(req.context, req.params.email);

    res.status(200);
    res.json({
        data: lists
    });
});


router.postAsync('/field/:listCid', passport.loggedIn, async (req, res) => {
    const list = await lists.getByCid(req.context, req.params.listCid);
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

    const id = await fields.create(req.context, list.id, field);

    res.status(200);
    res.json({
        data: {
            id,
            tag: key
        }
    });
});


router.postAsync('/blacklist/add', passport.loggedIn, async (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    if (!(input.EMAIL) || (input.EMAIL === ''))  {
        throw new APIError('EMAIL argument is required', 400);
    }

    await blacklist.add(req.context, input.EMAIL);

    res.json({
        data: []
    });
});


router.postAsync('/blacklist/delete', passport.loggedIn, async (req, res) => {
    let input = {};
    Object.keys(req.body).forEach(key => {
        input[(key || '').toString().trim().toUpperCase()] = (req.body[key] || '').toString().trim();
    });
    if (!(input.EMAIL) || (input.EMAIL === '')) {
        throw new APIError('EMAIL argument is required', 400);
    }

    await blacklist.remove(req.oontext, input.EMAIL);

    res.json({
        data: []
    });
});


router.getAsync('/blacklist/get', passport.loggedIn, async (req, res) => {
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

router.getAsync('/rss/fetch/:campaignCid', passport.loggedIn, async (req, res) => {
    await campaigns.fetchRssCampaign(req.context, req.params.campaignCid);
    return res.json();
});

router.postAsync('/templates/:templateId/send', async (req, res) => {
    const input = {};

    for (const key in req.body) {
        const sanitizedKey = key.toString().trim().toUpperCase();
        input[sanitizedKey] = req.body[key] || '';
    }

    const templateId = castToInteger(req.params.templateId, 'Invalid template ID');

    let sendConfigurationId;
    if (!('SEND_CONFIGURATION_ID' in input)) {
        sendConfigurationId = getSystemSendConfigurationId();
    } else {
        sendConfigurationId = castToInteger(input.SEND_CONFIGURATION_ID, 'Invalid send configuration ID');
    }

    if (!input.EMAIL || input.EMAIL === 0) {
        throw new APIError('Missing email(s)', 400);
    }

    const emails = input.EMAIL.split(',');

    const info = await templates.sendAsTransactionalEmail(req.context, templateId, sendConfigurationId, emails, input.SUBJECT, input.VARIABLES);

    res.json({ data: info });
});

module.exports = router;
