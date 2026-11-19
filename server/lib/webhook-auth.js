'use strict';

const crypto = require('crypto');
const config = require('./config');

function secretsMatch(actual, expected) {
    if (typeof actual !== 'string' || typeof expected !== 'string' || !expected) {
        return false;
    }
    const left = Buffer.from(actual, 'utf8');
    const right = Buffer.from(expected, 'utf8');
    return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function captureSignedBody(req, res, body) {
    if ((config.webhooks.sendgridPublicKey && /^\/webhooks\/sendgrid\/?$/i.test(req.path)) ||
        (config.webhooks.postalPublicKey && /^\/webhooks\/postal\/?$/i.test(req.path))) {
        req.webhookBody = body;
    }
}

function verifySignature(algorithm, key, signature, body, prefix) {
    if (!body || typeof signature !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(signature)) {
        return false;
    }

    try {
        const verifier = crypto.createVerify(algorithm);
        if (prefix) {
            verifier.update(prefix, 'utf8');
        }
        verifier.update(body);
        return verifier.verify(key, signature, 'base64');
    } catch (err) {
        return false;
    }
}

function verifySendgrid(req, key) {
    const timestamp = req.get('X-Twilio-Email-Event-Webhook-Timestamp');
    if (!/^\d+$/.test(timestamp || '')) {
        return false;
    }

    // SendGrid provides a base64-encoded SubjectPublicKeyInfo public key.
    const publicKey = '-----BEGIN PUBLIC KEY-----\n' + key + '\n-----END PUBLIC KEY-----';
    return verifySignature('sha256', publicKey, req.get('X-Twilio-Email-Event-Webhook-Signature'), req.webhookBody, timestamp);
}

function verifyMailgun(body, key) {
    if (!body || !/^\d+$/.test(body.timestamp || '') || typeof body.token !== 'string' || !body.token) {
        return false;
    }

    // Bound the age of signed tokens. Mailgun's signature covers the timestamp and token.
    if (Math.abs(Date.now() / 1000 - Number(body.timestamp)) > 5 * 60) {
        return false;
    }

    const expected = crypto.createHmac('sha256', key).update(body.timestamp + body.token).digest('hex');
    return secretsMatch(body.signature, expected);
}

function verifyPostal(req, key) {
    const signature = req.get('X-Postal-Signature-256');
    return signature === undefined
        ? verifySignature('RSA-SHA1', key, req.get('X-Postal-Signature'), req.webhookBody)
        : verifySignature('RSA-SHA256', key, signature, req.webhookBody);
}

function zoneMtaAuthorization(token) {
    return 'Basic ' + Buffer.from('mailtrain:' + token).toString('base64');
}

module.exports = {
    captureSignedBody,
    secretsMatch,
    verifySendgrid,
    verifyMailgun,
    verifyPostal,
    zoneMtaAuthorization
};
