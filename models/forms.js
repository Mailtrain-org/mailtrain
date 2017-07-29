'use strict';

const knex = require('../lib/knex');
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../shared/interoperable-errors');
const shares = require('./shares');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const path = require('path');
const mjml = require('mjml');
const _ = require('../lib/translate')._;

const formAllowedKeys = [
    'name',
    'description',
    'layout',
    'form_input_style'
];

const allowedFormKeys = [
    'web_subscribe',
    'web_confirm_subscription_notice',
    'mail_confirm_subscription_html',
    'mail_confirm_subscription_text',
    'mail_already_subscribed_html',
    'mail_already_subscribed_text',
    'web_subscribed_notice',
    'mail_subscription_confirmed_html',
    'mail_subscription_confirmed_text',
    'web_manage',
    'web_manage_address',
    'web_updated_notice',
    'web_unsubscribe',
    'web_confirm_unsubscription_notice',
    'mail_confirm_unsubscription_html',
    'mail_confirm_unsubscription_text',
    'mail_confirm_address_change_html',
    'mail_confirm_address_change_text',
    'web_unsubscribed_notice',
    'mail_unsubscription_confirmed_html',
    'mail_unsubscription_confirmed_text',
    'web_manual_unsubscribe_notice'
];

const hashKeys = [...formAllowedKeys, ...allowedFormKeys];


function hash(entity) {
    return hasher.hash(filterObject(entity, hashKeys));
}

async function listDTAjax(context, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'customForm', requiredOperations: ['view'] }],
        params,
        builder => builder
            .from('custom_forms')
            .innerJoin('namespaces', 'namespaces.id', 'custom_forms.namespace'),
        ['custom_forms.id', 'custom_forms.name', 'custom_forms.description', 'namespaces.name']
    );
}


async function _getById(tx, id) {
    const entity = await tx('custom_forms').where('id', id).first();

    if (!entity) {
        throw interoperableErrors.NotFoundError();
    }

    const forms = await tx('custom_forms_data').where('form', id).select(['data_key', 'data_value']);

    for (const form of forms) {
        entity[form.data_key] = form.data_value;
    }

    return entity;
}


async function getById(context, id) {
    shares.enforceEntityPermission(context, 'customForm', id, 'view');

    let entity;
    await knex.transaction(async tx => {
        entity = _getById(tx, id);
    });

    return entity;
}


async function serverValidate(context, data) {
    const result = {};

    const form = filterObject(data, allowedFormKeys);

    const errs = checkForMjmlErrors(form);

    for (const key in form) {
        result[key] = {};
        if (errs[key]) {
            result.key.errors = errs[key];
        }
    }

    return result;
}


async function create(context, entity) {
    await shares.enforceEntityPermission(context, 'namespace', 'createCustomForm');

    let id;
    await knex.transaction(async tx => {
        const ids = await tx('custom_forms').insert(filterObject(entity, formAllowedKeys));
        id = ids[0];

        const form = filterObject(entity, allowedFormKeys);
        for (const formKey in form) {
            await tx('custom_forms_data').insert({
                form: id,
                data_key: formKey,
                data_value: form[formKey]
            })
        }
    });

    return id;
}

async function updateWithConsistencyCheck(context, entity) {
    await shares.enforceEntityPermission(context, 'customForm', entity.id, 'edit');

    await knex.transaction(async tx => {
        const existing = _getById(tx, context, id);

        const existingHash = hash(existing);
        if (existingHash != entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        const form = filterObject(entity, allowedFormKeys);
        enforce(!Object.keys(checkForMjmlErrors(form)).length, 'Error(s) in form templates');

        await tx('custom_forms').where('id', entity.id).update(filterObject(entity, formAllowedKeys));

        for (const formKey in form) {
            await tx('custom_forms_data').update({
                form: entity.id,
                data_key: formKey,
                data_value: form[formKey]
            });
        }
    });
}

async function remove(context, id) {
    await knex.transaction(async tx => {
        const entity = await tx('custom_forms').where('id', id).first();

        if (!entity) {
            throw shares.throwPermissionDenied();
        }

        shares.enforceEntityPermission(context, 'list', entity.list, 'manageForms');

        await tx('custom_forms_data').where('form', id).del();
        await tx('custom_forms').where('id', id).del();
    });
}


async function getDefaultFormValues() {
    const basePath = path.join(__dirname, '..');

    async function getContents(fileName) {
        try {
            const template = await fs.readFile(path.join(basePath, fileName), 'utf8');
            return template.replace(/\{\{#translate\}\}(.*?)\{\{\/translate\}\}/g, (m, s) => _(s));
        } catch (err) {
            return false;
        }
    }

    const form = {};

    for (const key of allowedFormKeys) {
        const base = 'views/subscription/' + key.replace(/_/g, '-');
        if (key.startsWith('mail') || key.startsWith('web')) {
            form[key] = await getContents(base + '.mjml.hbs') || await getContents(base + '.hbs') || '';
        }
    }

    form.layout = await getContents('views/subscription/layout.mjml.hbs') || '';
    form.formInputStyle = await getContents('public/subscription/form-input-style.css') || '@import url(/subscription/form-input-style.css);';

    return form;
}


function checkForMjmlErrors(form) {
    let testLayout = '<mjml><mj-body><mj-container>{{{body}}}</mj-container></mj-body></mjml>';

    let hasMjmlError = (template, layout = testLayout) => {
        let source = layout.replace(/\{\{\{body\}\}\}/g, template);
        let compiled;

        try {
            compiled = mjml.mjml2html(source);
        } catch (err) {
            return err;
        }

        return compiled.errors;
    };


    const errors = {};
    for (const key in form) {
        if (key.startsWith('mail_') || key.startsWith('web_')) {
            const template = form[key];
            const errs = hasMjmlError(template);

            if (key === 'mail_confirm_html' && !template.includes('{{confirmUrl}}')) {
                errs.push('Missing {{confirmUrl}}');
            }

            if (errs.length) {
                errors[key] = errs;
            }

        } else if (key === 'layout') {
            const layout = values[index];
            const err = hasMjmlError('', layout);

            if (!layout.includes('{{{body}}}')) {
                errs.push(`{{{body}}} not found`);
            }

            if (errs.length) {
                errors[key] = errs;
            }
        }
    }

    return errors;
}

module.exports = {
    listDTAjax,
    hash,
    getById,
    create,
    updateWithConsistencyCheck,
    remove,
    getDefaultFormValues,
    serverValidate
};