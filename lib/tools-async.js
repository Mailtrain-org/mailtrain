'use strict';

const _ = require('./translate')._;
const util = require('util');
const isemail = require('isemail');

const bluebird = require('bluebird');
const mergeTemplateIntoLayout = bluebird.promisify(require('./tools').mergeTemplateIntoLayout);

module.exports = {
    validateEmail,
    validateEmailGetMessage,
    mergeTemplateIntoLayout
};

async function validateEmail(address, checkBlocked) {
    let user = (address || '').toString().split('@').shift().toLowerCase().replace(/[^a-z0-9]/g, '');

    if (checkBlocked && blockedUsers.indexOf(user) >= 0) {
        throw new new Error(util.format(_('Blocked email address "%s"'), address));
    }

    const result = await new Promise(resolve => {
        const result = isemail.validate(address, {
            checkDNS: true,
            errorLevel: 1
        }, resolve);
    });

    return result;
}

function validateEmailGetMessage(result, address) {
    if (result !== 0) {
        let message = util.format(_('Invalid email address "%s".'), address);
        switch (result) {
            case 5:
                message += ' ' + _('MX record not found for domain');
                break;
            case 6:
                message += ' ' + _('Address domain not found');
                break;
            case 12:
                message += ' ' + _('Address domain name is required');
                break;
        }
        return message;
    }
}

