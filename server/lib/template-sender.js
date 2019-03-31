'use strict';

const mailers = require('./mailers');
const templates = require('../models/templates');

class TemplateSender {
    constructor({ templateId, maxMails = 100 } = {}) {
        if (!templateId) {
            throw new Error('Cannot create template sender without templateId');
        }

        this.templateId = templateId;
        this.maxMails = maxMails;
    }

    async send(options) {
        this._validateMailOptions(options);

        const [mailer, template] = await Promise.all([
            mailers.getOrCreateMailer(options.sendConfigurationId),
            templates.getById(
                options.context,
                this.templateId,
                false
            )
        ]);

        const html = this._substituteVariables(
            template.html,
            options.variables
        );
        return mailer.sendTransactionalMail(
            {
                to: options.email,
                subject: options.subject
            },
            {
                html: { template: html },
                locale: options.locale
            }
        );
    }

    _validateMailOptions(options) {
        let { context, email, locale } = options;

        if (!context) {
            throw new Error('Missing context');
        }
        if (!email || email.length === 0) {
            throw new Error('Missing email');
        }
        if (typeof email === 'string') {
            email = email.split(',');
        }
        if (email.length > this.maxMails) {
            throw new Error(
                `Cannot send more than ${this.maxMails} emails at once`
            );
        }
        if (!locale) {
            throw new Error('Missing locale');
        }
    }

    _substituteVariables(html, variables) {
        if (!variables) return html;
        return Object.keys(variables).reduce((res, key) => {
            return res.replace(
                new RegExp(`\\[${key}\\]`, 'gmi'),
                variables[key]
            );
        }, html);
    }
}

module.exports = TemplateSender;
