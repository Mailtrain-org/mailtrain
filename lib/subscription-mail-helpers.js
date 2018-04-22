'use strict';

const log = require('npmlog');
const fields = require('../models/fields');
const settings = require('../models/settings');
const urllib = require('url');
const helpers = require('./helpers');
const _ = require('./translate')._;
const util = require('util');
const contextHelpers = require('./context-helpers');
const {getFieldKey} = require('../shared/lists');
const forms = require('../models/forms');
const bluebird = require('bluebird');
const sendMail = bluebird.promisify(require('./mailer').sendMail);


module.exports = {
    sendAlreadySubscribed,
    sendConfirmAddressChange,
    sendConfirmSubscription,
    sendConfirmUnsubscription,
    sendSubscriptionConfirmed,
    sendUnsubscriptionConfirmed
};

async function sendSubscriptionConfirmed(list, email, subscription) {
    const relativeUrls = {
        preferencesUrl: '/subscription/' + list.cid + '/manage/' + subscription.cid,
        unsubscribeUrl: '/subscription/' + list.cid + '/unsubscribe/' + subscription.cid
    };

    await _sendMail(list, email, 'subscription_confirmed', _('%s: Subscription Confirmed'), relativeUrls, subscription);
}

async function sendAlreadySubscribed(list, email, subscription) {
    const relativeUrls = {
        preferencesUrl: '/subscription/' + list.cid + '/manage/' + subscription.cid,
        unsubscribeUrl: '/subscription/' + list.cid + '/unsubscribe/' + subscription.cid
    };
    await _sendMail(list, email, 'already_subscribed', _('%s: Email Address Already Registered'), relativeUrls, subscription);
}

async function sendConfirmAddressChange(list, email, cid, subscription) {
    const relativeUrls = {
        confirmUrl: '/subscription/confirm/change-address/' + cid
    };
    await _sendMail(list, email, 'confirm_address_change', _('%s: Please Confirm Email Change in Subscription'), relativeUrls, subscription);
}

async function sendConfirmSubscription(list, email, cid, subscription) {
    const relativeUrls = {
        confirmUrl: '/subscription/confirm/subscribe/' + cid
    };
    await _sendMail(list, email, 'confirm_subscription', _('%s: Please Confirm Subscription'), relativeUrls, subscription);
}

async function sendConfirmUnsubscription(list, email, cid, subscription) {
    const relativeUrls = {
        confirmUrl: '/subscription/confirm/unsubscribe/' + cid
    };
    await _sendMail(list, email, 'confirm_unsubscription', _('%s: Please Confirm Unsubscription'), relativeUrls, subscription);
}

async function sendUnsubscriptionConfirmed(list, email, subscription) {
    const relativeUrls = {
        subscribeUrl: '/subscription/' + list.cid + '?cid=' + subscription.cid
    };
    await _sendMail(list, email, 'unsubscription_confirmed', _('%s: Unsubscription Confirmed'), relativeUrls, subscription);
}

function getDisplayName(flds, subscription) {
    let firstName, lastName, name;

    for (const fld of flds) {
        if (fld.key === 'FIRST_NAME') {
            firstName = subscription[fld.column];
        }

        if (fld.key === 'LAST_NAME') {
            lastName = subscription[fld.column];
        }

        if (fld.key === 'NAME') {
            name = subscription[fld.column];
        }
    }

    if (name) {
        return name;
    } else if (firstName && lastName) {
        return firstName + ' ' + lastName;
    } else if (lastName) {
        return lastName;
    } else if (firstName) {
        return firstName;
    } else {
        return '';
    }
}

async function _sendMail(list, email, template, subject, relativeUrls, subscription) {
    console.log(subscription);

    const flds = await fields.list(contextHelpers.getAdminContext(), list.id);

    const encryptionKeys = [];
    for (const fld of flds) {
        if (fld.type === 'gpg' && fld.value) {
            encryptionKeys.push(subscription[getFieldKey(fld)].value.trim());
        }
    }

    const configItems = await settings.get(['defaultHomepage', 'defaultFrom', 'defaultAddress', 'serviceUrl']);

    const data = {
        title: list.name,
        homepage: configItems.defaultHomepage || configItems.serviceUrl,
        contactAddress: configItems.defaultAddress,
    };

    for (let relativeUrlKey in relativeUrls) {
        data[relativeUrlKey] = urllib.resolve(configItems.serviceUrl, relativeUrls[relativeUrlKey]);
    }

    const fsTemplate = template.replace(/_/g, '-');
    const text = {
        template: 'subscription/mail-' + fsTemplate + '-text.hbs'
    };

    const html = {
        template: 'subscription/mail-' + fsTemplate + '-html.mjml.hbs',
        layout: 'subscription/layout.mjml.hbs',
        type: 'mjml'
    };

    if (list.default_form !== null) {
        const form = await forms.getById(contextHelpers.getAdminContext(), list.default_form);

        text.template = form['mail_' + template + '_text'] || text.template;
        html.template = form['mail_' + template + '_html'] || html.template;
        html.layout = form.layout || html.layout;
    }

    try {
        await sendMail({
            from: {
                name: configItems.defaultFrom,
                address: configItems.defaultAddress
            },
            to: {
                name: getDisplayName(flds, subscription),
                address: email
            },
            subject: util.format(subject, list.name),
            encryptionKeys
        }, {
            html,
            text,
            data
        });
    } catch (err) {
        log.error('Subscription', err);
    }
}
