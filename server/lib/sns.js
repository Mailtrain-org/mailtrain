'use strict';

const crypto = require('crypto');
const https = require('https');
const {URL} = require('url');

function get(url, readBody) {
    return new Promise((resolve, reject) => {
        // Only HTTPS requests to the validated destination. Do not follow redirects.
        const request = https.get(url, {rejectUnauthorized: true}, response => {
            if (response.statusCode !== 200) {
                response.destroy();
                reject(new Error('SNS returned HTTP ' + response.statusCode));
                return;
            }

            if (!readBody) {
                response.destroy();
                resolve();
                return;
            }

            const chunks = [];
            let size = 0;
            response.on('data', chunk => {
                size += chunk.length;
                if (size > 32 * 1024) {
                    request.destroy(new Error('SNS certificate is too large'));
                } else {
                    chunks.push(chunk);
                }
            });
            response.on('aborted', () => reject(new Error('SNS certificate download was interrupted')));
            response.on('error', reject);
            response.on('end', () => resolve(Buffer.concat(chunks).toString('ascii')));
        });
        const timeout = setTimeout(() => request.destroy(new Error('SNS request timed out')), 5000);
        request.on('error', reject);
        request.on('close', () => clearTimeout(timeout));
    });
}

function getSnsUrl(value, host) {
    if (typeof value !== 'string') {
        throw new Error('Missing SNS URL');
    }
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== host || url.port || url.username || url.password || url.hash) {
        throw new Error('Untrusted SNS URL');
    }
    return url;
}

async function verifyMessage(message, topicArns) {
    if (!message || typeof message.TopicArn !== 'string') {
        throw new Error('Missing SNS topic');
    }

    const topic = /^arn:(aws|aws-cn|aws-us-gov):sns:([a-z]{2}(?:-[a-z]+)+-[0-9]+):[0-9]{12}:[a-zA-Z0-9_-]+(?:\.fifo)?$/.exec(message.TopicArn);
    if (!topic || (topicArns.length && !topicArns.includes(message.TopicArn))) {
        throw new Error('Untrusted SNS topic');
    }
    const host = 'sns.' + topic[2] + '.amazonaws.com' + (topic[1] === 'aws-cn' ? '.cn' : '');

    let fields;
    let subscribeUrl;
    switch (message.Type) {
        case 'Notification':
            fields = ['Message', 'MessageId'];
            if (Object.prototype.hasOwnProperty.call(message, 'Subject')) {
                fields.push('Subject');
            }
            fields.push('Timestamp', 'TopicArn', 'Type');
            break;
        case 'SubscriptionConfirmation':
        case 'UnsubscribeConfirmation':
            fields = ['Message', 'MessageId', 'SubscribeURL', 'Timestamp', 'Token', 'TopicArn', 'Type'];
            subscribeUrl = getSnsUrl(message.SubscribeURL, host);
            break;
        default:
            throw new Error('Unknown SNS message type');
    }

    const version = message.SignatureVersion;
    if (version !== '1' && version !== '2') {
        throw new Error('Unsupported SNS signature version');
    }
    if (typeof message.Signature !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(message.Signature)) {
        throw new Error('Invalid SNS signature encoding');
    }

    // SNS signs the named fields in byte order, with a newline after each key and value.
    const text = fields.map(field => {
        if (typeof message[field] !== 'string' ||
            (field !== 'Message' && field !== 'Subject' && /[\r\n]/.test(message[field]))) {
            throw new Error('Invalid SNS field: ' + field);
        }
        return field + '\n' + message[field] + '\n';
    }).join('');

    const certUrl = getSnsUrl(message.SigningCertURL, host);
    if (!/^\/SimpleNotificationService-[0-9a-f]{32}\.pem$/.test(certUrl.pathname) || certUrl.search) {
        throw new Error('Invalid SNS signing certificate URL');
    }
    const cert = await get(certUrl, true);
    if (!/^-----BEGIN CERTIFICATE-----\r?\n[\s\S]+\r?\n-----END CERTIFICATE-----\s*$/.test(cert)) {
        throw new Error('Invalid SNS signing certificate');
    }

    const verifier = crypto.createVerify(version === '1' ? 'RSA-SHA1' : 'RSA-SHA256');
    verifier.update(text, 'utf8');
    if (!verifier.verify(cert, message.Signature, 'base64')) {
        throw new Error('SNS signature did not match');
    }
    return subscribeUrl;
}

async function confirmSubscription(url) {
    await get(url, false);
}

module.exports = {verifyMessage, confirmSubscription};
