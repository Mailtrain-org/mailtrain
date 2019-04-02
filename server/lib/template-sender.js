'use strict';

const mailers = require('./mailers');
const tools = require('./tools');
const templates = require('../models/templates');

class TemplateSender {
    constructor(options) {
        this.defaultOptions = {
            maxMails: 100,
            ...options
        };
    }

    async send(params) {
        const options = { ...this.defaultOptions, ...params };
        this._validateMailOptions(options);

        const [mailer, template] = await Promise.all([
            mailers.getOrCreateMailer(
                options.sendConfigurationId
            ),
            templates.getById(
                options.context,
                options.templateId,
                false
            )
        ]);

        const html = tools.formatTemplate(
            template.html,
            null,
            options.variables,
            true
        );
        const subject = tools.formatTemplate(
            options.subject || template.description || template.name,
            options.variables
        );
        return mailer.sendTransactionalMail(
            {
                to: options.email,
                subject
            },
            {
                html: { template: html },
                data: options.data,
                locale: options.locale
            }
        );
    }

    _validateMailOptions(options) {
        let { context, email, locale, templateId } = options;

        if (!templateId) {
            throw new Error('Missing templateId');
        }
        if (!context) {
            throw new Error('Missing context');
        }
        if (!email || email.length === 0) {
            throw new Error('Missing email');
        }
        if (typeof email === 'string') {
            email = email.split(',');
        }
        if (email.length > options.maxMails) {
            throw new Error(
                `Cannot send more than ${options.maxMails} emails at once`
            );
        }
        if (!locale) {
            throw new Error('Missing locale');
        }
    }
}

module.exports = TemplateSender;
