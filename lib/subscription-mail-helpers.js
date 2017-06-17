'use strict';

const log = require('npmlog');
let fields = require('./models/fields');
let settings = require('./models/settings');
let mailer = require('./mailer');
let urllib = require('url');
let helpers = require('./helpers');
let _ = require('./translate')._;
let util = require('util');


module.exports = {
    sendAlreadySubscribed,
    sendConfirmAddressChange,
    sendConfirmSubscription,
    sendConfirmUnsubscription,
    sendSubscriptionConfirmed,
    sendUnsubscriptionConfirmed
};

function sendSubscriptionConfirmed(list, email, subscription, callback) {
    const relativeUrls = {
        preferencesUrl: '/subscription/' + list.cid + '/manage/' + subscription.cid,
        unsubscribeUrl: '/subscription/' + list.cid + '/unsubscribe/' + subscription.cid
    };

    sendMail(list, email, 'subscription-confirmed', _('%s: Subscription Confirmed'), relativeUrls, {}, subscription, callback);
}

function sendAlreadySubscribed(list, email, subscription, callback) {
    const mailOpts = {
        ignoreDisableConfirmations: true
    };
    const relativeUrls = {
        preferencesUrl: '/subscription/' + list.cid + '/manage/' + subscription.cid,
        unsubscribeUrl: '/subscription/' + list.cid + '/unsubscribe/' + subscription.cid
    };
    sendMail(list, email, 'already-subscribed', _('%s: Email Address Already Registered'), relativeUrls, mailOpts, subscription, callback);
}

function sendConfirmAddressChange(list, email, cid, subscription, callback) {
    const mailOpts = {
        ignoreDisableConfirmations: true
    };
    const relativeUrls = {
        confirmUrl: '/subscription/confirm/change-address/' + cid
    };
    sendMail(list, email, 'confirm-address-change', _('%s: Please Confirm Email Change in Subscription'), relativeUrls, mailOpts, subscription, callback);
}

function sendConfirmSubscription(list, email, cid, subscription, callback) {
    const mailOpts = {
        ignoreDisableConfirmations: true
    };
    const relativeUrls = {
        confirmUrl: '/subscription/confirm/subscribe/' + cid
    };
    sendMail(list, email, 'confirm-subscription', _('%s: Please Confirm Subscription'), relativeUrls, mailOpts, subscription, callback);
}

function sendConfirmUnsubscription(list, email, cid, subscription, callback) {
    const mailOpts = {
        ignoreDisableConfirmations: true
    };
    const relativeUrls = {
        confirmUrl: '/subscription/confirm/unsubscribe/' + cid
    };
    sendMail(list, email, 'confirm-unsubscription', _('%s: Please Confirm Unsubscription'), relativeUrls, mailOpts, subscription, callback);
}

function sendUnsubscriptionConfirmed(list, email, subscription, callback) {
    const relativeUrls = {
        subscribeUrl: '/subscription/' + list.cid + '?cid=' + subscription.cid
    };
    sendMail(list, email, 'unsubscription-confirmed', _('%s: Unsubscription Confirmed'), relativeUrls, {}, subscription, callback);
}


function sendMail(list, email, template, subject, relativeUrls, mailOpts, subscription, callback) {
    fields.list(list.id, (err, fieldList) => {
        if (err) {
            return callback(err);
        }

        let encryptionKeys = [];
        fields.getRow(fieldList, subscription).forEach(field => {
            if (field.type === 'gpg' && field.value) {
                encryptionKeys.push(field.value.trim());
            }
        });

        settings.list(['defaultHomepage', 'defaultFrom', 'defaultAddress', 'defaultPostaddress', 'serviceUrl', 'disableConfirmations'], (err, configItems) => {
            if (err) {
                return callback(err);
            }

            if (!mailOpts.ignoreDisableConfirmations && configItems.disableConfirmations) {
                return callback();
            }

            const data = {
                title: list.name,
                homepage: configItems.defaultHomepage || configItems.serviceUrl,
                contactAddress: configItems.defaultAddress,
                defaultPostaddress: configItems.defaultPostaddress
            };

            for (let relativeUrlKey in relativeUrls) {
                data[relativeUrlKey] = urllib.resolve(configItems.serviceUrl, relativeUrls[relativeUrlKey]);
            }

            let text = {
                template: 'subscription/mail-' + template + '-text.hbs'
            };

            let html = {
                template: 'subscription/mail-' + template + '-html.mjml.hbs',
                layout: 'subscription/layout.mjml.hbs',
                type: 'mjml'
            };

            helpers.injectCustomFormTemplates(list.defaultForm, { text, html }, (err, tmpl) => {
                if (!err && tmpl) {
                    text = tmpl.text || text;
                    html = tmpl.html || html;
                }

                mailer.sendMail({
                    from: {
                        name: configItems.defaultFrom,
                        address: configItems.defaultAddress
                    },
                    to: {
                        name: [].concat(subscription.firstName || []).concat(subscription.lastName || []).join(' '),
                        address: email
                    },
                    subject: util.format(subject, list.name),
                    encryptionKeys
                }, {
                    html,
                    text,
                    data
                }, err => {
                    if (err) {
                        log.error('Subscription', err);
                    }
                });

                callback();

            });
        });
    });
}
