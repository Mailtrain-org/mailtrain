'use strict';

const log = require('npmlog');
const fields = require('../models/fields');
const settings = require('../models/settings');
const {getTrustedUrl, getPublicUrl} = require('./urls');
const { tUI, tMark } = require('./translate');
const util = require('util');
const contextHelpers = require('./context-helpers');
const {getFieldColumn} = require('../../shared/lists');
const forms = require('../models/forms');
const mailers = require('./mailers');

module.exports = {
    sendAlreadySubscribed,
    sendConfirmAddressChange,
    sendConfirmSubscription,
    sendConfirmUnsubscription,
    sendSubscriptionConfirmed,
    sendUnsubscriptionConfirmed
};

async function sendSubscriptionConfirmed(lang, list, email, subscription) {
    const relativeUrls = {
        preferencesUrl: '/subscription/' + list.cid + '/manage/' + subscription.cid,
        unsubscribeUrl: '/subscription/' + list.cid + '/unsubscribe/' + subscription.cid
    };

    await _sendMail(list, email, 'subscription_confirmed', lang, tMark('subscriptionconfirmed'), relativeUrls, subscription);
}

async function sendAlreadySubscribed(lang, list, email, subscription) {
    const relativeUrls = {
        preferencesUrl: '/subscription/' + list.cid + '/manage/' + subscription.cid,
        unsubscribeUrl: '/subscription/' + list.cid + '/unsubscribe/' + subscription.cid
    };
    await _sendMail(list, email, 'already_subscribed', lang, tMark('listEmailAddressAlreadyRegistered'), relativeUrls, subscription);
}

async function sendConfirmAddressChange(lang, list, email, cid, subscription) {
    const relativeUrls = {
        confirmUrl: '/subscription/confirm/change-address/' + cid
    };
    await _sendMail(list, email, 'confirm_address_change', lang, tMark('listPleaseConfirmEmailChangeIn'), relativeUrls, subscription);
}

async function sendConfirmSubscription(lang, list, email, cid, subscription) {
    const relativeUrls = {
        confirmUrl: '/subscription/confirm/subscribe/' + cid
    };
    await _sendMail(list, email, 'confirm_subscription', lang, tMark('pleaseConfirmSubscription'), relativeUrls, subscription);
}

async function sendConfirmUnsubscription(lang, list, email, cid, subscription) {
    const relativeUrls = {
        confirmUrl: '/subscription/confirm/unsubscribe/' + cid
    };
    await _sendMail(list, email, 'confirm_unsubscription', lang, tMark('listPleaseConfirmUnsubscription'), relativeUrls, subscription);
}

async function sendUnsubscriptionConfirmed(lang, list, email, subscription) {
    const relativeUrls = {
        subscribeUrl: '/subscription/' + list.cid + '?cid=' + subscription.cid
    };
    await _sendMail(list, email, 'unsubscription_confirmed', lang, tMark('listUnsubscriptionConfirmed'), relativeUrls, subscription);
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

async function _sendMail(list, email, template, language, subjectKey, relativeUrls, subscription) {
    const flds = await fields.list(contextHelpers.getAdminContext(), list.id);

    const encryptionKeys = [];
    for (const fld of flds) {
        if (fld.type === 'gpg' && fld.value) {
            encryptionKeys.push(subscription[getFieldColumn(fld)].value.trim());
        }
    }

    const configItems = await settings.get(contextHelpers.getAdminContext(), ['defaultHomepage', 'adminEmail']);

    const data = {
        title: list.name,
        homepage: configItems.defaultHomepage || getTrustedUrl(),
        contactAddress: list.from_email || configItems.adminEmail,
    };

    for (let relativeUrlKey in relativeUrls) {
        data[relativeUrlKey] = getPublicUrl(relativeUrls[relativeUrlKey], {language});
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

    if (list.default_form) {
        const form = await forms.getById(contextHelpers.getAdminContext(), list.default_form);

        text.template = form['mail_' + template + '_text'] || text.template;
        html.template = form['mail_' + template + '_html'] || html.template;
        html.layout = form.layout || html.layout;
    }

    try {
        if (list.send_configuration) {
            const mailer = await mailers.getOrCreateMailer(list.send_configuration);
            await mailer.sendTransactionalMail({
                from: {
                    name: configItems.defaultFrom,
                    address: configItems.defaultAddress
                },
                to: {
                    name: getDisplayName(flds, subscription),
                    address: email
                },
                subject: tUI(subjectKey, language, { list: list.name }),
                encryptionKeys
            }, {
                html,
                text,
                data
            });
        } else {
            log.warn('Subscription', `Not sending email for list id:${list.id} because not send configuration is set.`);
        }
    } catch (err) {
        log.error('Subscription', err);
    }
}
