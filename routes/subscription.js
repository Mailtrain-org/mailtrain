'use strict';

const log = require('npmlog');
const config = require('config');
const router = require('../lib/router-async').create();
const confirmations = require('../models/confirmations');
const subscriptions = require('../models/subscriptions');
const lists = require('../models/lists');
const fields = require('../models/fields');
const settings = require('../models/settings');
const _ = require('../lib/translate')._;
const contextHelpers = require('../lib/context-helpers');
const forms = require('../models/forms');

const { SubscriptionStatus } = require('../shared/lists');

const openpgp = require('openpgp');
const util = require('util');
const cors = require('cors');
const cache = require('memory-cache');
const geoip = require('geoip-ultralight');
const passport = require('../lib/passport');

const tools = require('../lib/tools-async');
const helpers = require('../lib/helpers');
const mailHelpers = require('../lib/subscription-mail-helpers');

const interoperableErrors = require('../shared/interoperable-errors');

const mjml = require('mjml');
const hbs = require('hbs');

const mjmlTemplates = new Map();
const objectHash = require('object-hash');

const bluebird = require('bluebird');
const fsReadFile = bluebird.promisify(require('fs').readFile);


const originWhitelist = config.cors && config.cors.origins || [];

const corsOptions = {
    allowedHeaders: ['Content-Type', 'Origin', 'Accept', 'X-Requested-With'],
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 200, // IE11 chokes on 204
    origin: (origin, callback) => {
        if (originWhitelist.includes(origin)) {
            callback(null, true);
        } else {
            const err = new Error(_('Not allowed by CORS'));
            err.status = 403;
            callback(err);
        }
    }
};

const corsOrCsrfProtection = (req, res, next) => {
    if (req.get('X-Requested-With') === 'XMLHttpRequest') {
        cors(corsOptions)(req, res, next);
    } else {
        passport.csrfProtection(req, res, next);
    }
};

async function takeConfirmationAndValidate(req, action, errorFactory) {
    const confirmation = await confirmations.takeConfirmation(req.params.cid);

    if (!confirmation || confirmation.action !== action) {
        throw errorFactory();
    }

    return confirmation;
}

async function injectCustomFormData(customFormId, viewKey, data) {
    function sortAndFilterCustomFieldsBy(key) {
        data.customFields = data.customFields.filter(fld => fld[key] !== null);
        data.customFields.sort((a, b) => a[key] - b[key]);
    }

    if (viewKey === 'web_subscribe') {
        sortAndFilterCustomFieldsBy('order_subscribe');
    } else if (viewKey === 'web_manage') {
        sortAndFilterCustomFieldsBy('order_manage');
    }

    if (!customFormId) {
        data.formInputStyle = '@import url(/subscription/form-input-style.css);';
        return;
    }

    const form = await forms.getById(contextHelpers.getAdminContext(), customFormId);

    data.template.template = form[viewKey] || data.template.template;
    data.template.layout = form.layout || data.template.layout;
    data.formInputStyle = form.formInputStyle || '@import url(/subscription/form-input-style.css);';

    const configItems = await settings.get(['ua_code']);

    data.uaCode = configItems.uaCode;
    data.customSubscriptionScripts = config.customsubscriptionscripts || [];
}

async function getMjmlTemplate(template) {
    let key = (typeof template === 'object') ? objectHash(template) : template;

    if (mjmlTemplates.has(key)) {
        return mjmlTemplates.get(key);
    }

    let source;
    if (typeof template === 'object') {
        source = await tools.mergeTemplateIntoLayout(template.template, template.layout);
    } else {
        source = await fsReadFile(path.join(__dirname, '..', 'views', template), 'utf-8');
    }

    const compiled = mjml.mjml2html(source);

    if (compiled.errors.length) {
        throw new Error(compiled.errors[0].message || compiled.errors[0]);
    }

    const renderer = hbs.handlebars.compile(compiled.html);
    mjmlTemplates.set(key, renderer);

    return renderer;
}

function captureFlashMessages(req, res) {
    return new Promise((resolve, reject) => {
        res.render('subscription/capture-flash-messages', { layout: null }, (err, flash) => {
            reject(err);
            resolve(flash);
        });
    })
}



router.getAsync('/confirm/subscribe/:cid', async (req, res) => {
    const confirmation = await takeConfirmationAndValidate(req, 'subscribe', () => new interoperableErrors.InvalidConfirmationForSubscriptionError('Request invalid or already completed. If your subscription request is still pending, please subscribe again.'));
    const subscription = confirmation.data;

    const meta = {
        cid: req.params.cid,
        ip: confirmation.ip,
        country: geoip.lookupCountry(confirmation.ip) || null
    };

    subscription.status = SubscriptionStatus.SUBSCRIBED;

    await subscriptions.create(contextHelpers.getAdminContext(), confirmation.list, subscription, meta);

    const list = await lists.getById(contextHelpers.getAdminContext(), confirmation.list);
    await mailHelpers.sendSubscriptionConfirmed(list, subscription.email, subscription);

    res.redirect('/subscription/' + encodeURIComponent(list.cid) + '/subscribed-notice');
});


router.getAsync('/confirm/change-address/:cid', async (req, res) => {
    const confirmation = await takeConfirmationAndValidate(req, 'change-address', () => new interoperableErrors.InvalidConfirmationForAddressChangeError('Request invalid or already completed. If your address change request is still pending, please change the address again.'));
    const list = await lists.getById(contextHelpers.getAdminContext(), confirmation.list);
    const data = confirmation.data;

    const subscription = await subscriptions.updateAddressAndGet(contextHelpers.getAdminContext(), list.id, data.subscriptionId, data.emailNew);

    await mailHelpers.sendSubscriptionConfirmed(list, data.emailNew, subscription);

    req.flash('info', _('Email address changed'));
    res.redirect('/subscription/' + encodeURIComponent(list.cid) + '/manage/' + subscription.cid);
});


router.getAsync('/confirm/unsubscribe/:cid', async (req, res) => {
    const confirmation = await takeConfirmationAndValidate(req, 'unsubscribe', () => new interoperableErrors.InvalidConfirmationForUnsubscriptionError('Request invalid or already completed. If your unsubscription request is still pending, please unsubscribe again.'));
    const list = await lists.getById(contextHelpers.getAdminContext(), confirmation.list);
    const data = confirmation.data;

    const subscription = await subscriptions.unsubscribeByCidAndGet(contextHelpers.getAdminContext(), list.id, data.subscriptionCid, data.campaignCid);

    await mailHelpers.sendUnsubscriptionConfirmed(list, subscription.email, subscription);

    res.redirect('/subscription/' + encodeURIComponent(list.cid) + '/unsubscribed-notice');
});


router.getAsync('/:cid', passport.csrfProtection, async (req, res) => {
    const list = await lists.getByCid(req.params.cid);

    if (!list.publicSubscribe) {
        throw new interoperableErrors.SubscriptionNotAllowedError('The list does not allow public subscriptions.');
    }

    const ucid = req.query.cid;

    const data = {};
    data.layout = 'subscription/layout';
    data.title = list.name;
    data.cid = list.cid;
    data.csrfToken = req.csrfToken();

    let subscription;
    if (ucid) {
        subscription = await subscriptions.getById(contextHelpers.getAdminContext(), list.id, ucid, false);
    }

    data.customFields = fields.getRow(contextHelpers.getAdminContext(), list.id, subscription);
    data.useEditor = true;

    const configItems = await settings.get(['pgpPrivateKey', 'defaultAddress', 'defaultPostaddress']);
    data.hasPubkey = !!configItems.pgpPrivateKey;
    data.defaultAddress = configItems.defaultAddress;
    data.defaultPostaddress = configItems.defaultPostaddress;

    data.template = {
        template: 'subscription/web-subscribe.mjml.hbs',
        layout: 'subscription/layout.mjml.hbs'
    };

    await injectCustomFormData(req.query.fid || list.default_form, 'subscription/web-subscribe', data);

    const htmlRenderer = await getMjmlTemplate(data.template);

    data.isWeb = true;
    data.needsJsWarning = true;
    data.flashMessages = await captureFlashMessages(res);

    res.send(htmlRenderer(data));
});


router.options('/:cid/widget', cors(corsOptions));

router.getAsync('/:cid/widget', cors(corsOptions), async (req, res) => {
    req.needsAPIJSONResponse = true;

    const cached = cache.get(req.path);
    if (cached) {
        return res.status(200).json(cached);
    }

    const list = await lists.getByCid(req.params.cid);

    const configItems = settings.get(['serviceUrl', 'pgpPrivateKey']);

    const data = {
        title: list.name,
        cid: list.cid,
        serviceUrl: configItems.serviceUrl,
        hasPubkey: !!configItems.pgpPrivateKey,
        customFields: fields.getRow(contextHelpers.getAdminContext(), list.id),
        template: {},
        layout: null,
    };

    await injectCustomFormData(req.query.fid || list.default_form, 'subscription/web-subscribe', data);

    const renderAsync = bluebird.promisify(res.render);
    const html = await renderAsync('subscription/widget-subscribe', data);

    const response = {
        data: {
            title: data.title,
            cid: data.cid,
            html
        }
    };

    cache.put(req.path, response, 30000); // ms
    res.status(200).json(response);
});


router.options('/:cid/subscribe', cors(corsOptions));

router.postAsync('/:cid/subscribe', passport.parseForm, corsOrCsrfProtection, async (req, res) => {
    const email = (req.body.email || '').toString().trim();

    if (req.xhr) {
        req.needsAPIJSONResponse = true;
    }

    if (!email) {
        if (req.xhr) {
            throw new Error('Email address not set');
        }

        req.flash('danger', _('Email address not set'));
        return res.redirect('/subscription/' + encodeURIComponent(req.params.cid) + '?' + tools.queryParams(req.body));
    }

    const emailErr = await tools.validateEmail(email);
    if (emailErr) {
        if (req.xhr) {
            throw new Error(emailErr.message);
        }

        req.flash('danger', emailErr.message);
        return res.redirect('/subscription/' + encodeURIComponent(req.params.cid) + '?' + tools.queryParams(req.body));
    }

    // Check if the subscriber seems legit. This is a really simple check, the only requirement is that
    // the subscriber has JavaScript turned on and thats it. If Mailtrain gets more targeted then this
    // simple check should be replaced with an actual captcha
    let subTime = Number(req.body.sub) || 0;
    // allow clock skew 24h in the past and 24h to the future
    let subTimeTest = !!(subTime > Date.now() - 24 * 3600 * 1000 && subTime < Date.now() + 24 * 3600 * 1000);
    let addressTest = !req.body.address;
    let testsPass = subTimeTest && addressTest;

    const list = await lists.getByCid(req.params.cid);

    if (!list.publicSubscribe) {
        throw new interoperableErrors.SubscriptionNotAllowedError('The list does not allow public subscriptions.');
    }

    let subscriptionData = {};
    Object.keys(req.body).forEach(key => {
        if (key !== 'email' && key.charAt(0) !== '_') {
            subscriptionData[key] = (req.body[key] || '').toString().trim();
        }
    });

    const subscription = subscriptions.getByEmail(list.id, email, false)

    if (subscription && subscription.status === SubscriptionStatus.SUBSCRIBED) {
        await mailHelpers.sendAlreadySubscribed(list, email, subscription);
        res.redirect('/subscription/' + encodeURIComponent(req.params.cid) + '/confirm-subscription-notice');

    } else {
        const data = {
            email,
            subscriptionData
        };

        const confirmCid = await confirmations.addConfirmation(list.id, 'subscribe', req.ip, data);

        if (!testsPass) {
            log.info('Subscription', 'Confirmation message for %s marked to be skipped (%s)', email, JSON.stringify(data));
        } else {
            await mailHelpers.sendConfirmSubscription(list, email, confirmCid, subscriptionData);
        }

        if (req.xhr) {
            return res.status(200).json({
                msg: _('Please Confirm Subscription')
            });
        }
        res.redirect('/subscription/' + encodeURIComponent(req.params.cid) + '/confirm-subscription-notice');
    }
});

router.getAsync('/:lcid/manage/:ucid', passport.csrfProtection, async (req, res) => {
    const list = await lists.getByCid(req.params.lcid);
    const subscription = await subscriptions.getByCid(contextHelpers.getAdminContext(), list.id, req.params.ucid, false);

    if (!subscription || subscription.status !== SubscriptionStatus.SUBSCRIBED) {
        throw new interoperableErrors.NotFoundError('Subscription not found in this list');
    }

    subscription.lcid = req.params.lcid;
    subscription.title = list.name;
    subscription.csrfToken = req.csrfToken();
    subscription.layout = 'subscription/layout';

    subscription.customFields = await fields.getRow(contextHelpers.getAdminContext(), list.id, subscription);

    subscription.useEditor = true;

    const configItems = await settings.get(['pgpPrivateKey', 'defaultAddress', 'defaultPostaddress']);
    subscription.hasPubkey = !!configItems.pgpPrivateKey;
    subscription.defaultAddress = configItems.defaultAddress;
    subscription.defaultPostaddress = configItems.defaultPostaddress;

    subscription.template = {
        template: 'subscription/web-manage.mjml.hbs',
        layout: 'subscription/layout.mjml.hbs'
    };

    await injectCustomFormData(req.query.fid || list.default_form, 'subscription/web-manage', subscription);

    const htmlRenderer = await getMjmlTemplate(data.template);

    data.isWeb = true;
    data.needsJsWarning = true;
    data.isManagePreferences = true;
    data.flashMessages = await captureFlashMessages(res);

    res.send(htmlRenderer(data));
});

router.postAsync('/:lcid/manage', passport.parseForm, passport.csrfProtection, async (req, res) => {
    const list = await lists.getByCid(req.params.lcid);
    const status = await subscriptions.getStatusByCid(contextHelpers.getAdminContext(), list.id, req.body.cid);

    if (status !== SubscriptionStatus.SUBSCRIBED) {
        throw new interoperableErrors.NotFoundError('Subscription not found in this list');
    }

    await subscriptions.updateManagedUngrouped(contextHelpers.getAdminContext(), list.id, req.body)

    res.redirect('/subscription/' + encodeURIComponent(req.params.lcid) + '/updated-notice');
});

router.getAsync('/:lcid/manage-address/:ucid', passport.csrfProtection, async (req, res) => {
    const list = await lists.getByCid(req.params.lcid);
    const subscription = await subscriptions.getByCid(contextHelpers.getAdminContext(), list.id, req.params.ucid, false);

    if (!subscription || subscription.status !== SubscriptionStatus.SUBSCRIBED) {
        throw new interoperableErrors.NotFoundError('Subscription not found in this list');
    }

    const configItems = await settings.get(['defaultAddress', 'defaultPostaddress']);

    subscription.lcid = req.params.lcid;
    subscription.title = list.name;
    subscription.csrfToken = req.csrfToken();
    subscription.defaultAddress = configItems.defaultAddress;
    subscription.defaultPostaddress = configItems.defaultPostaddress;

    subscription.template = {
        template: 'subscription/web-manage-address.mjml.hbs',
        layout: 'subscription/layout.mjml.hbs'
    };

    await injectCustomFormData(req.query.fid || list.default_form, 'subscription/web-manage-address', subscription);

    const htmlRenderer = await getMjmlTemplate(data.template);

    data.isWeb = true;
    data.needsJsWarning = true;
    data.isManagePreferences = true;
    data.flashMessages = await captureFlashMessages(res);

    res.send(htmlRenderer(data));
});


router.postAsync('/:lcid/manage-address', passport.parseForm, passport.csrfProtection, async (req, res) => {
    const list = await lists.getByCid(req.params.lcid);

    const emailNew = (req.body['email-new'] || '').toString().trim();

    const subscription = await subscriptions.getByCid(contextHelpers.getAdminContext(), list.id, req.body.cid, false);

    if (status !== SubscriptionStatus.SUBSCRIBED) {
        throw new interoperableErrors.NotFoundError('Subscription not found in this list');
    }

    if (subscription.email === emailNew) {
        req.flash('info', _('Nothing seems to be changed'));

    } else {
        const emailErr = await tools.validateEmail(emailNew);
        if (emailErr) {
            req.flash('danger', emailErr.message);

        } else {
            const newSubscription = await subscriptions.getByEmail(contextHelpers.getAdminContext(), list.id, emailNew, false);

            if (newSubscription && newSubscription.status === SubscriptionStatus.SUBSCRIBED) {
                await mailHelpers.sendAlreadySubscribed(list, emailNew, subscription);
            } else {
                const confirmCid = await confirmations.addConfirmation(list.id, 'change-address', req.ip, data);
                await mailHelpers.sendConfirmAddressChange(list, emailNew, confirmCid, subscription, sendWebResponse);
            }

            req.flash('info', _('An email with further instructions has been sent to the provided address'));
        }
    }

    res.redirect('/subscription/' + encodeURIComponent(req.params.lcid) + '/manage/' + encodeURIComponent(req.body.cid));
});


router.getAsync('/:lcid/unsubscribe/:ucid', passport.csrfProtection, async (req, res) => {
    const list = await lists.getByCid(req.params.lcid);

    const configItems = await settings.get(['defaultAddress', 'defaultPostaddress']);

    const autoUnsubscribe = req.query.auto === 'yes';

    if (autoUnsubscribe) {
        handleUnsubscribe(list, req.params.ucid, autoUnsubscribe, req.query.c, req.ip, res, next);

    } else if (req.query.formTest ||
        list.unsubscriptionMode === lists.UnsubscriptionMode.ONE_STEP_WITH_FORM ||
        list.unsubscriptionMode === lists.UnsubscriptionMode.TWO_STEP_WITH_FORM) {

        const subscription = await subscriptions.getByCid(contextHelpers.getAdminContext(), list.id, req.params.ucid, false);

        if (!subscription || subscription.status !== SubscriptionStatus.SUBSCRIBED) {
            throw new interoperableErrors.NotFoundError('Subscription not found in this list');
        }

        subscription.lcid = req.params.lcid;
        subscription.ucid = req.params.ucid;
        subscription.title = list.name;
        subscription.csrfToken = req.csrfToken();
        subscription.campaign = req.query.c;
        subscription.defaultAddress = configItems.defaultAddress;
        subscription.defaultPostaddress = configItems.defaultPostaddress;

        subscription.template = {
            template: 'subscription/web-unsubscribe.mjml.hbs',
            layout: 'subscription/layout.mjml.hbs'
        };

        await injectCustomFormData(req.query.fid || list.default_form, 'subscription/web-unsubscribe', subscription);

        const htmlRenderer = await getMjmlTemplate(data.template);

        data.isWeb = true;
        data.needsJsWarning = true;
        data.isManagePreferences = true;
        data.flashMessages = await captureFlashMessages(res);

        res.send(htmlRenderer(data));

    } else { // UnsubscriptionMode.ONE_STEP || UnsubscriptionMode.TWO_STEP || UnsubscriptionMode.MANUAL
        await handleUnsubscribe(list, req.params.ucid, autoUnsubscribe, req.query.c, req.ip, res);
    }
});


router.postAsync('/:lcid/unsubscribe', passport.parseForm, passport.csrfProtection, async (req, res) => {
    const list = await lists.getByCid(req.params.lcid);

    const campaignCid = (req.body.campaign || '').toString().trim() || false;

    await handleUnsubscribe(list, req.body.ucid, false, campaignCid, req.ip, res);
});


async function handleUnsubscribe(list, subscriptionCid, autoUnsubscribe, campaignCid, ip, res) {
    if ((list.unsubscriptionMode === lists.UnsubscriptionMode.ONE_STEP || list.unsubscriptionMode === lists.UnsubscriptionMode.ONE_STEP_WITH_FORM) ||
        (autoUnsubscribe && (list.unsubscriptionMode === lists.UnsubscriptionMode.TWO_STEP || list.unsubscriptionMode === lists.UnsubscriptionMode.TWO_STEP_WITH_FORM)) ) {

        try {
            const subscription = await subscriptions.unsubscribeByCidAndGet(contextHelpers.getAdminContext(), list.id, subscriptionCid, campaignCid);

            await mailHelpers.sendUnsubscriptionConfirmed(list, subscription.email, subscription);

            res.redirect('/subscription/' + encodeURIComponent(list.cid) + '/unsubscribed-notice');

        } catch (err) {
            if (err instanceof interoperableErrors.NotFoundError) {
                throw new interoperableErrors.NotFoundError('Subscription not found in this list'); // This is here to provide some meaningful error message.
            }
        }

    } else {
        const subscription = await subscriptions.getByCid(contextHelpers.getAdminContext(), list.id, subscriptionCid, false);

        if (!subscription || subscription.status !== SubscriptionStatus.SUBSCRIBED) {
            throw new interoperableErrors.NotFoundError('Subscription not found in this list');
        }

        if (list.unsubscriptionMode === lists.UnsubscriptionMode.TWO_STEP || list.unsubscriptionMode === lists.UnsubscriptionMode.TWO_STEP_WITH_FORM) {

            const data = {
                subscriptionCid,
                campaignCid
            };

            const confirmCid = await confirmations.addConfirmation(list.id, 'unsubscribe', ip, data);
            await mailHelpers.sendConfirmUnsubscription(list, subscription.email, confirmCid, subscription);

            res.redirect('/subscription/' + encodeURIComponent(list.cid) + '/confirm-unsubscription-notice');

        } else { // UnsubscriptionMode.MANUAL
            res.redirect('/subscription/' + encodeURIComponent(list.cid) + '/manual-unsubscribe-notice');
        }
    }
}


router.getAsync('/:cid/confirm-subscription-notice', async (req, res) => {
    await webNotice('confirm-subscription', req, res);
});

router.getAsync('/:cid/confirm-unsubscription-notice', async (req, res) => {
    await webNotice('confirm-unsubscription', req, res);
});

router.getAsync('/:cid/subscribed-notice', async (req, res) => {
    await webNotice('subscribed', req, res);
});

router.getAsync('/:cid/updated-notice', async (req, res) => {
    await webNotice('updated', req, res);
});

router.getAsync('/:cid/unsubscribed-notice', async (req, res) => {
    await webNotice('unsubscribed', req, res);
});

router.getAsync('/:cid/manual-unsubscribe-notice', async (req, res) => {
    await webNotice('manual-unsubscribe', req, res);
});

router.postAsync('/publickey', passport.parseForm, async (req, res) => {
    const configItems = await settings.get(['pgpPassphrase', 'pgpPrivateKey']);

    if (!configItems.pgpPrivateKey) {
        const err = new Error(_('Public key is not set'));
        err.status = 404;
        throw err;
    }

    let privKey;
    try {
        privKey = openpgp.key.readArmored(configItems.pgpPrivateKey).keys[0];
        if (configItems.pgpPassphrase && !privKey.decrypt(configItems.pgpPassphrase)) {
            privKey = false;
        }
    } catch (E) {
        // just ignore if failed
    }

    if (!privKey) {
        const err = new Error(_('Public key is not set'));
        err.status = 404;
        throw err;
    }

    const pubkey = privKey.toPublic().armor();

    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename=public.asc'
    });

    res.end(pubkey);
});


async function webNotice(type, req, res) {
    const list = await lists.getByCid(req.params.cid);

    const configItems = await settings.get(['defaultHomepage', 'serviceUrl', 'defaultAddress', 'defaultPostaddress', 'adminEmail']);


    const data = {
        title: list.name,
        homepage: configItems.defaultHomepage || configItems.serviceUrl,
        defaultAddress: configItems.defaultAddress,
        defaultPostaddress: configItems.defaultPostaddress,
        contactAddress: configItems.defaultAddress,
        template: {
            template: 'subscription/web-' + type + '-notice.mjml.hbs',
            layout: 'subscription/layout.mjml.hbs'
        }
    };

    await injectCustomFormData(req.query.fid || list.default_form, 'subscription/web-' + type + '-notice', data);

    const htmlRenderer = await getMjmlTemplate(data.template);

    data.isWeb = true;
    data.isConfirmNotice = true; // FIXME: Not sure what this does. Check it in a browser with disabled JS
    data.isManagePreferences = true;
    data.flashMessages = await captureFlashMessages(res);

    res.send(htmlRenderer(data));
}

module.exports = router;
