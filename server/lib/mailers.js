'use strict';

const log = require('./log');
const config = require('./config');

const nodemailer = require('nodemailer');
const aws = require('aws-sdk');
const openpgpEncrypt = require('nodemailer-openpgp').openpgpEncrypt;
const sendConfigurations = require('../models/send-configurations');
const { ZoneMTAType, MailerType } = require('../../shared/send-configurations');
const builtinZoneMta = require('./builtin-zone-mta');

const contextHelpers = require('./context-helpers');
const settings = require('../models/settings');

const bluebird = require('bluebird');

const transports = new Map();

class SendConfigurationError extends Error {
    constructor(sendConfigurationId, ...args) {
        super(...args);
        this.sendConfigurationId = sendConfigurationId;
        Error.captureStackTrace(this, SendConfigurationError);
    }
}



async function getOrCreateMailer(sendConfigurationId) {
    let sendConfiguration;

    if (!sendConfigurationId) {
        sendConfiguration = await sendConfigurations.getSystemSendConfiguration();
    } else {
        sendConfiguration = await sendConfigurations.getById(contextHelpers.getAdminContext(), sendConfigurationId, false, true);
    }

    const transport = transports.get(sendConfiguration.id) || await _createTransport(sendConfiguration);
    return transport.mailer;
}

function invalidateMailer(sendConfigurationId) {
    transports.delete(sendConfigurationId);
}



function _addDkimKeys(transport, mail) {
    const sendConfiguration = transport.mailer.sendConfiguration;

    if (sendConfiguration.mailer_type === MailerType.ZONE_MTA) {
        const mailerSettings = sendConfiguration.mailer_settings;

        if (mailerSettings.zoneMtaType === ZoneMTAType.WITH_MAILTRAIN_HEADER_CONF || mailerSettings.zoneMtaType === ZoneMTAType.BUILTIN) {
            if (!mail.headers) {
                mail.headers = {};
            }

            const dkimDomain = mailerSettings.dkimDomain;
            const dkimSelector = (mailerSettings.dkimSelector || '').trim();
            const dkimPrivateKey = (mailerSettings.dkimPrivateKey || '').trim();

            if (dkimSelector && dkimPrivateKey) {
                const from = (mail.from.address || '').trim();
                const domain = from.split('@').pop().toLowerCase().trim();

                mail.headers['x-mailtrain-dkim'] = JSON.stringify({
                    domainName: dkimDomain || domain,
                    keySelector: dkimSelector,
                    privateKey: dkimPrivateKey
                });
            }
        }
    }
}


async function _sendMail(transport, mail, template) {
    _addDkimKeys(transport, mail);

    try {
        return await transport.sendMailAsync(mail);

    } catch (err) {
        if ( (err.responseCode && err.responseCode >= 400 && err.responseCode < 500) ||
            (err.code === 'ECONNECTION' && err.errno === 'ECONNREFUSED')
        ) {
            throw new SendConfigurationError(transport.mailer.sendConfiguration.id, 'Cannot connect to service specified by send configuration ' + transport.mailer.sendConfiguration.id);
        }

        throw err;
    }
}

async function _sendTransactionalMail(transport, mail) {
    if (!mail.headers) {
        mail.headers = {};
    }
    mail.headers['X-Sending-Zone'] = 'transactional';

    return await _sendMail(transport, mail);
}

function _daysBetween(date1, date2) {
    // The number of milliseconds in one day
    const ONE_DAY = 1000 * 60 * 60 * 24;

    // Calculate the difference in milliseconds
    const differenceMs = Math.abs(date1 - date2);

    // Convert back to days and return
    return Math.round(differenceMs / ONE_DAY);    
}

function _senderIsEnabledForDay(enabledDaysInWeek, date) {
    if (!Array.isArray(enabledDaysInWeek)) return null;
    if (enabledDaysInWeek.length !== 7) return null;
    // getDay();
    // Sunday - Saturday : 0 - 6                
    const dayInWeek = date.getUTCDay();
    if (enabledDaysInWeek[dayInWeek] === 1) return true;
    return false;
  }

// e.g. for enabling working days only
// enabledDaysInWeek = [0, 1, 1, 1, 1, 1, 0] from Sunday to Saturday
// returns value in milliseconds
function _senderTimeToNextEnabledDay(enabledDaysInWeek) {

    if (!Array.isArray(enabledDaysInWeek)) return 0;
    if (enabledDaysInWeek.length !== 7) return 0;
  
    const dateNow = new Date(Date.now());
    const dayInWeek = dateNow.getUTCDay(); // Sunday - Saturday : 0 - 6 
    let _enabledDaysInWeek = enabledDaysInWeek.concat(enabledDaysInWeek);
    let timeToNextEnabledDay = 0;
  
    for (let i = dayInWeek; i < 2 * 7; i++) {
      if (_enabledDaysInWeek[i] === 1) {
        const daysToNextEnabledDay = i - dayInWeek;
        // Set exact utc time when next enabled day starts
        let d = new Date(Date.UTC(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getDate(), 0, 0, 0));
  
        d.setDate(dateNow.getDate() + daysToNextEnabledDay); // add days 
        _senderIsEnabledForDay(enabledDaysInWeek, d)
        timeToNextEnabledDay = d.getTime() - dateNow.getTime();
        if (timeToNextEnabledDay < 0) timeToNextEnabledDay = 0;
        return timeToNextEnabledDay;
      }
  
    }
    return 0;
  }
  
  function _getWarmUpMultiplicator(throttlingWarmUpDays, throttlingWarmUpFrom) {
    if (throttlingWarmUpDays && throttlingWarmUpFrom) {
  
      const timeNow = Date.now();
      if (throttlingWarmUpFrom > timeNow) throttlingWarmUpFrom = timeNow;
  
      const warmingUpDays = _daysBetween(timeNow, throttlingWarmUpFrom);
      if (warmingUpDays < throttlingWarmUpDays) {
        let warmUpMultiplicator = warmingUpDays / throttlingWarmUpDays;
        log.verbose('Mail', 'Warn up day %s/%s, warmUpMultiplicator %s)', warmingUpDays, throttlingWarmUpDays, warmUpMultiplicator);
        return warmUpMultiplicator;
      }
    }
    return 1;
  }
  

async function _createTransport(sendConfiguration) {
    const mailerSettings = sendConfiguration.mailer_settings;
    const mailerType = sendConfiguration.mailer_type;
    const configItems = await settings.get(contextHelpers.getAdminContext(), ['pgpPrivateKey', 'pgpPassphrase']);

    const existingTransport = transports.get(sendConfiguration.id);

    let existingListeners = [];
    if (existingTransport) {
        existingListeners = existingTransport.listeners('idle');
        existingTransport.removeAllListeners('idle');
        existingTransport.removeAllListeners('stream');
        existingTransport.throttleWait = null;
    }

    const logFunc = (...args) => {
        const level = args.shift();
        args.shift();
        args.unshift('Mail');
        log[level](...args);
    };


    let transportOptions;

    if (mailerType === MailerType.GENERIC_SMTP || mailerType === MailerType.ZONE_MTA) {
        transportOptions = {
            pool: true,
            debug: mailerSettings.logTransactions,
            logger: mailerSettings.logTransactions ? {
                debug: logFunc.bind(null, 'verbose'),
                info: logFunc.bind(null, 'info'),
                error: logFunc.bind(null, 'error')
            } : false,
            maxConnections: mailerSettings.maxConnections,
            maxMessages: mailerSettings.maxMessages,
            tls: {
                rejectUnauthorized: !mailerSettings.allowSelfSigned
            }
        };

        if (mailerType === MailerType.ZONE_MTA && mailerSettings.zoneMtaType === ZoneMTAType.BUILTIN) {
            transportOptions.host = config.builtinZoneMTA.host;
            transportOptions.port = config.builtinZoneMTA.port;
            transportOptions.secure = false;
            transportOptions.ignoreTLS = true;
            transportOptions.auth = {
                user: builtinZoneMta.getUsername(),
                pass: builtinZoneMta.getPassword()
            };
        } else {
            transportOptions.host = mailerSettings.hostname;
            transportOptions.port = mailerSettings.port || false;
            transportOptions.secure = mailerSettings.encryption === 'TLS';
            transportOptions.ignoreTLS = mailerSettings.encryption === 'NONE';
            transportOptions.auth = mailerSettings.useAuth ? {
                user: mailerSettings.user,
                pass: mailerSettings.password
            } : false;
        }

    } else if (mailerType === MailerType.AWS_SES) {
        const sendingRate = mailerSettings.throttling / 3600;  // convert to messages/second

        transportOptions = {
            SES: new aws.SES({
                apiVersion: '2010-12-01',
                accessKeyId: mailerSettings.key,
                secretAccessKey: mailerSettings.secret,
                region: mailerSettings.region
            }),
            debug: mailerSettings.logTransactions,
            logger: mailerSettings.logTransactions ? {
                debug: logFunc.bind(null, 'verbose'),
                info: logFunc.bind(null, 'info'),
                error: logFunc.bind(null, 'error')
            } : false,
            maxConnections: mailerSettings.maxConnections,
            sendingRate
        };

    } else {
        throw new Error('Invalid mail transport');
    }

    const transport = nodemailer.createTransport(transportOptions, config.nodemailer);
    transport.sendMailAsync = bluebird.promisify(transport.sendMail.bind(transport));

    transport.use('stream', openpgpEncrypt({
        signingKey: configItems.pgpPrivateKey,
        passphrase: configItems.pgpPassphrase
    }));

    if (existingListeners.length) {
        log.info('Mail', 'Reattaching %s idle listeners', existingListeners.length);
        existingListeners.forEach(listener => transport.on('idle', listener));
    }

    let throttleWait;

    if (mailerType === MailerType.GENERIC_SMTP || mailerType === MailerType.ZONE_MTA) {
        let throttling = mailerSettings.throttling;
        let throttlingWarmUpDays = mailerSettings.throttlingWarmUpDays; // Set warm up period in days
        let throttlingWarmUpFrom = mailerSettings.throttlingWarmUpFrom; // Set warm up starting date - Unix time

        const enableSenderOnDaySun = mailerSettings.enableSenderOnDaySun === true ? 1 : 0;
        const enableSenderOnDayMon = mailerSettings.enableSenderOnDayMon === true ? 1 : 0;
        const enableSenderOnDayTue = mailerSettings.enableSenderOnDayTue === true ? 1 : 0;
        const enableSenderOnDayWed = mailerSettings.enableSenderOnDayWed === true ? 1 : 0;
        const enableSenderOnDayThu = mailerSettings.enableSenderOnDayThu === true ? 1 : 0;
        const enableSenderOnDayFri = mailerSettings.enableSenderOnDayFri === true ? 1 : 0;
        const enableSenderOnDaySat = mailerSettings.enableSenderOnDaySat === true ? 1 : 0;  

        // From Sunday to Saturday e.g. enable sending in working days only [0,1,1,1,1,1,0]        
        let enabledDaysInWeek  = [
            enableSenderOnDaySun, 
            enableSenderOnDayMon,
            enableSenderOnDayTue,
            enableSenderOnDayWed,
            enableSenderOnDayThu,
            enableSenderOnDayFri,
            enableSenderOnDaySat
        ];         

        const warmUpMultiplicator = _getWarmUpMultiplicator(throttlingWarmUpDays, throttlingWarmUpFrom)
        let throttlingOrig = mailerSettings.throttling;
        let throttlingWarmUp = 0;

        if (throttling) {
            throttling = 1 / (throttling * warmUpMultiplicator / (3600 * 1000));
            // For loging purposes only
            throttlingWarmUp = throttling;
            throttlingOrig = 1 / (throttlingOrig / (3600 * 1000)); 
        }
        
        let timeToNextEnabledDay = _senderTimeToNextEnabledDay(enabledDaysInWeek);    
        throttling = Math.max(throttling,timeToNextEnabledDay);
        log.verbose('Mail', 'Throttling changed from %s to %s (throttlingWarmUp in %s ms, timeToNextEnabledDay in %s ms)', throttlingOrig, throttling, throttlingWarmUp, timeToNextEnabledDay);

        let lastCheck = Date.now();

        throttleWait = function (next) {
            if (!throttling) {
                return next();
            }
            let nextCheck = Date.now();
            let checkDiff = (nextCheck - lastCheck);
            if (checkDiff < throttling) {
                log.verbose('Mail', 'Throttling next message in %s sec.', (throttling - checkDiff) / 1000);
                setTimeout(() => {
                    lastCheck = Date.now();
                    next();
                }, throttling - checkDiff);
            } else {
                lastCheck = nextCheck;
                next();
            }
        };
    } else {
        throttleWait = next => next();
    }

    transport.mailer = {
        sendConfiguration,
        throttleWait: bluebird.promisify(throttleWait),
        sendTransactionalMail: async (mail) => await _sendTransactionalMail(transport, mail),
        sendMassMail: async (mail, template) => await _sendMail(transport, mail)
    };

    transports.set(sendConfiguration.id, transport);
    return transport;
}

class MailerError extends Error {
    constructor(msg, responseCode) {
        super(msg);
        this.responseCode = responseCode;
    }
}

module.exports.getOrCreateMailer = getOrCreateMailer;
module.exports.invalidateMailer = invalidateMailer;
module.exports.MailerError = MailerError;
module.exports.SendConfigurationError = SendConfigurationError;
