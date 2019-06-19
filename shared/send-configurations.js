'use strict';

const MailerType = {
    GENERIC_SMTP: 'generic_smtp',
    ZONE_MTA: 'zone_mta',
    AWS_SES: 'aws_ses'
};

const ZoneMTAType = {
    REGULAR: 0,
    WITH_HTTP_CONF: 1,
    WITH_MAILTRAIN_HEADER_CONF: 2,
    BUILTIN: 3
}

function getSystemSendConfigurationId() {
    return 1;
}

function getSystemSendConfigurationCid() {
    return 'system';
}

module.exports = {
    MailerType,
    ZoneMTAType,
    getSystemSendConfigurationId,
    getSystemSendConfigurationCid
};