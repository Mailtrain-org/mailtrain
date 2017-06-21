'use strict';

const util = require('util');
const owaspPasswordStrengthTest = require('owasp-password-strength-test');

function passwordValidator(t) {
    const config = {
        allowPassphrases: true,
        maxLength: 128,
        minLength: 10,
        minPhraseLength: 20,
        minOptionalTestsToPass: 4
    };

    if (t) {
        config.translate = {
            minLength: function (minLength) {
                return t('The password must be at least {{ minLength }} characters long', { minLength });
            },
            maxLength: function (maxLength) {
                return t('The password must be fewer than {{ maxLength }} characters', { maxLength });
            },
            repeat: t('The password may not contain sequences of three or more repeated characters'),
            lowercase: t('The password must contain at least one lowercase letter'),
            uppercase: t('The password must contain at least one uppercase letter'),
            number: t('The password must contain at least one number'),
            special: t('The password must contain at least one special character')
        }
    }

    const passwordValidator = owaspPasswordStrengthTest.create();
    passwordValidator.config(config);

    return passwordValidator;
}

module.exports = passwordValidator;