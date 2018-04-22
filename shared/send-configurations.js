'use strict';

const MailerType = {
    GENERIC_SMTP: 'generic_smtp',
    ZONE_MTA: 'zone_mta',
    AWS_SES: 'aws_ses',
    MAX: 3
};

function getSystemSendConfigurationId() {
    return 1;
}

module.exports = {
    MailerType,
    getSystemSendConfigurationId
};