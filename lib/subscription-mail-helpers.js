'use strict';

const log = require('npmlog');
// const Gettext = require('node-gettext');
// const gt = new Gettext();
let fields = require('./models/fields');
let settings = require('./models/settings');
let mailer = require('./mailer');
let urllib = require('url');
let helpers = require('./helpers');
// let _ = require('./translate')._;
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

    let subject = '';
    switch (list.language) {
        case 'en': 
            subject = '%s: Subscription Confirmed';
            break;
        case 'de_DE': 
            subject = '%s: Abonnement bestätigt';
            break;
        case 'es_ES': 
            subject = '%s: Suscripción Confirmada';
            break;
        case 'et': 
            subject = '';
            break;
        case 'fr_FR': 
            subject = '%s: Abonnement confirmé';
            break;
        case 'hu_HU': 
            subject = '%s: Feliratkozás megerősítve';
            break;
        case 'it_IT': 
            subject = '%s: Iscrizione confermata';
            break;
        case 'pl_PL': 
            subject = '%s: Potwierdzono subskrypcję';
            break;
        default: 
            subject = '%s: Subscription Confirmed';
    }

    // const subject = gt.dgettext(list.language, '%s: Subscription Confirmed');
    sendMail(list, email, 'subscription-confirmed', subject, relativeUrls, {}, subscription, callback);
}

function sendAlreadySubscribed(list, email, subscription, callback) {
    const mailOpts = {
        ignoreDisableConfirmations: true
    };
    const relativeUrls = {
        preferencesUrl: '/subscription/' + list.cid + '/manage/' + subscription.cid,
        unsubscribeUrl: '/subscription/' + list.cid + '/unsubscribe/' + subscription.cid
    };

    let subject = '';
    switch (list.language) {
        case 'en': 
            subject = '%s: Email Address Already Registered';
            break;
        case 'de_DE': 
            subject = '%s: Email-Adresse bereits registriert';
            break;
        case 'es_ES': 
            subject = '%s: Correo electrónico registrado';
            break;
        case 'et': 
            subject = '';
            break;
        case 'fr_FR': 
            subject = '%s: Adresse mail déjà enregistrée';
            break;
        case 'hu_HU': 
            subject = '%s: Emailcím már regisztrálva van';
            break;
        case 'it_IT': 
            subject = '%s: Indirizzo email già iscritto';
            break;
        case 'pl_PL': 
            subject = '';
            break;
        default: 
            subject = '%s: Email Address Already Registered';
    }

    // const subject = gt.dgettext(list.language, '%s: Email Address Already Registered');
    sendMail(list, email, 'already-subscribed', subject, relativeUrls, mailOpts, subscription, callback);
}

function sendConfirmAddressChange(list, email, cid, subscription, callback) {
    const mailOpts = {
        ignoreDisableConfirmations: true
    };
    const relativeUrls = {
        confirmUrl: '/subscription/confirm/change-address/' + cid
    };

    let subject = '';
    switch (list.language) {
        case 'en': 
            subject = '%s: Please Confirm Email Change in Subscription';
            break;
        case 'de_DE': 
            subject = '%s: Bitte bestätigen Sie die Änderung der Email-Adresse';
            break;
        case 'es_ES': 
            subject = '%s: Por favor confirma el cambio de correo electrónico de suscripción';
            break;
        case 'et': 
            subject = '';
            break;
        case 'fr_FR': 
            subject = "%s: Merci de confirmer le changement de mail de l'abonnement";
            break;
        case 'hu_HU': 
            subject = '%s: Kérjük erősítse meg email címének megváltoztatását';
            break;
        case 'it_IT': 
            subject = "%s: Per favore conferma il cambio di indirizzo email nell'iscrizione";
            break;
        case 'pl_PL': 
            subject = '';
            break;
        default: 
            subject = '%s: Please Confirm Email Change in Subscription';
    }

    // const subject = gt.dgettext(list.language, '%s: Please Confirm Email Change in Subscription');
    sendMail(list, email, 'confirm-address-change', subject, relativeUrls, mailOpts, subscription, callback);
}

function sendConfirmSubscription(list, email, cid, subscription, callback) {
    const mailOpts = {
        ignoreDisableConfirmations: true
    };
    const relativeUrls = {
        confirmUrl: '/subscription/confirm/subscribe/' + cid
    };

    let subject = '';
    switch (list.language) {
        case 'en': 
            subject = '%s: Please Confirm Subscription';
            break;
        case 'de_DE': 
            subject = '%s: Bitte bestätigen Sie Ihr Abonnement';
            break;
        case 'es_ES': 
            subject = '%s: Por favor confirma la Suscripción';
            break;
        case 'et': 
            subject = '';
            break;
        case 'fr_FR': 
            subject = "%: Merci de confirmer l'abonnement";
            break;
        case 'hu_HU': 
            subject = '%s: Kérjük erősítse meg a feliratkozást';
            break;
        case 'it_IT': 
            subject = '%s: Per favore conferma la tua iscrizione';
            break;
        case 'pl_PL': 
            subject = '%s: Potwierdź subskrypcję';
            break;
        default: 
            subject = '%s: Please Confirm Subscription';
    }

    // const subject = gt.dgettext(list.language, '%s: Please Confirm Subscription');
    sendMail(list, email, 'confirm-subscription', subject, relativeUrls, mailOpts, subscription, callback);
}

function sendConfirmUnsubscription(list, email, cid, subscription, callback) {
    const mailOpts = {
        ignoreDisableConfirmations: true
    };
    const relativeUrls = {
        confirmUrl: '/subscription/confirm/unsubscribe/' + cid
    };

    let subject = '';
    switch (list.language) {
        case 'en': 
            subject = '%s: Please Confirm Unsubscription';
            break;
        case 'de_DE': 
            subject = '%s: Bitte bestätigen Sie die Kündigung des Abonnements';
            break;
        case 'es_ES': 
            subject = '%s: Por favor confirma la Baja';
            break;
        case 'et': 
            subject = '';
            break;
        case 'fr_FR': 
            subject = '%: Merci de confirmer le désabonnement';
            break;
        case 'hu_HU': 
            subject = '%s: Kérjük erősítse meg a leiratkozást';
            break;
        case 'it_IT': 
            subject = "%s: Per favore conferma l'intenzione di rimuovere l'iscrizione";
            break;
        case 'pl_PL': 
            subject = '';
            break;
        default: 
            subject = '%s: Please Confirm Unsubscription';
    }

    // const subject = gt.dgettext(list.language, '%s: Please Confirm Unsubscription');
    sendMail(list, email, 'confirm-unsubscription', subject, relativeUrls, mailOpts, subscription, callback);
}

function sendUnsubscriptionConfirmed(list, email, subscription, callback) {
    const relativeUrls = {
        subscribeUrl: '/subscription/' + list.cid + '?cid=' + subscription.cid
    };

    let subject = '';
    switch (list.language) {
        case 'en': 
            subject = '%s: Unsubscription Confirmed';
            break;
        case 'de_DE': 
            subject = '%s: Kündigung des Abonnements bestätigt';
            break;
        case 'es_ES': 
            subject = '%s: Baja confirmada :(';
            break;
        case 'et': 
            subject = '';
            break;
        case 'fr_FR': 
            subject = '%s: Désabonnement confirmé';
            break;
        case 'hu_HU': 
            subject = '%s: Leiratkozás megerősítve';
            break;
        case 'it_IT': 
            subject = "%s: Rimozione dell'iscrizione confermata";
            break;
        case 'pl_PL': 
            subject = '';
            break;
        default: 
            subject = '%s: Unsubscription Confirmed';
    }

    // const subject = gt.dgettext(list.language, '%s: Unsubscription Confirmed');
    sendMail(list, email, 'unsubscription-confirmed', subject, relativeUrls, {}, subscription, callback);
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
