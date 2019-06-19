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
                return t('thePasswordMustBeAtLeastMinLength', { minLength });
            },
            maxLength: function (maxLength) {
                return t('thePasswordMustBeFewerThanMaxLength', { maxLength });
            },
            repeat: t('thePasswordMayNotContainSequencesOfThree'),
            lowercase: t('thePasswordMustContainAtLeastOne'),
            uppercase: t('thePasswordMustContainAtLeastOne-1'),
            number: t('thePasswordMustContainAtLeastOneNumber'),
            special: t('thePasswordMustContainAtLeastOneSpecial')
        }
    }

    const passwordValidator = owaspPasswordStrengthTest.create();
    passwordValidator.config(config);

    return passwordValidator;
}

module.exports = passwordValidator;