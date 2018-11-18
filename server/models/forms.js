'use strict';

const knex = require('../lib/knex');
const { enforce, filterObject } = require('../lib/helpers');
const hasher = require('node-object-hash')();
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const shares = require('./shares');
const namespaceHelpers = require('../lib/namespace-helpers');
const bluebird = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
const mjml = require('mjml');
const lists = require('./lists');
const dependencyHelpers = require('../lib/dependency-helpers');

const formAllowedKeys = new Set([
    'name',
    'description',
    'layout',
    'form_input_style',
    'namespace'
]);

const allowedFormKeys = new Set([
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
]);

const hashKeys = new Set([...formAllowedKeys, ...allowedFormKeys]);

const allowedKeysServerValidate = new Set(['layout', ...allowedFormKeys]);

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
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'customForm', id, 'view');
        const entity = await _getById(tx, id);
        entity.permissions = await shares.getPermissionsTx(tx, context, 'customForm', id);
        return entity;
    });
}


async function serverValidate(context, data) {
    const result = {};

    const form = filterObject(data, allowedKeysServerValidate);
    const errs = checkForMjmlErrors(form);

    for (const key in form) {
        result[key] = {};
        if (errs[key]) {
            result[key].errors = errs[key];
        }
    }

    return result;
}


async function create(context, entity) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createCustomForm');

        await namespaceHelpers.validateEntity(tx, entity);

        const form = filterObject(entity, allowedFormKeys);
        enforce(!Object.keys(checkForMjmlErrors(form)).length, 'Error(s) in form templates');

        const ids = await tx('custom_forms').insert(filterObject(entity, formAllowedKeys));
        const id = ids[0];

        for (const formKey in form) {
            await tx('custom_forms_data').insert({
                form: id,
                data_key: formKey,
                data_value: form[formKey]
            })
        }

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'customForm', entityId: id });
        return id;
    });
}

async function updateWithConsistencyCheck(context, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'customForm', entity.id, 'edit');

        const existing = await _getById(tx, entity.id);

        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await namespaceHelpers.validateEntity(tx, entity);
        await namespaceHelpers.validateMove(context, entity, existing, 'customForm', 'createCustomForm', 'delete');

        const form = filterObject(entity, allowedFormKeys);
        enforce(!Object.keys(checkForMjmlErrors(form)).length, 'Error(s) in form templates');

        await tx('custom_forms').where('id', entity.id).update(filterObject(entity, formAllowedKeys));

        for (const formKey in form) {
            await tx('custom_forms_data').update({
                data_value: form[formKey]
            }).where({
                form: entity.id,
                data_key: formKey
            });
        }

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'customForm', entityId: entity.id });
    });
}

async function remove(context, id) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'customForm', id, 'delete');

        await dependencyHelpers.ensureNoDependencies(tx, context, id, [
            { entityTypeId: 'list', column: 'default_form' }
        ]);

        await tx('custom_forms_data').where('form', id).del();
        await tx('custom_forms').where('id', id).del();
    });
}


// FIXME - add the ability of having multiple language variant of the same custom form
async function getDefaultCustomFormValues() {
    const basePath = path.join(__dirname, '..');

    async function getContents(fileName) {
        try {
            const template = await fs.readFile(path.join(basePath, fileName), 'utf8');
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
    form.form_input_style = await getContents('static/subscription/form-input-style.css') || '@import url(/subscription/form-input-style.css);';

    return form;
}


function checkForMjmlErrors(form) {
    let testLayout = '<mjml><mj-body><mj-container>{{{body}}}</mj-container></mj-body></mjml>';

    let hasMjmlError = (template, layout = testLayout) => {
        let source = layout.replace(/\{\{\{body\}\}\}/g, template);
        let compiled;

        try {
            compiled = mjml(source);
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

            const msgs = errs.map(x => x.formattedMessage);
            if (key === 'mail_confirm_html' && !template.includes('{{confirmUrl}}')) {
                msgs.push('Missing {{confirmUrl}}');
            }

            if (msgs.length) {
                errors[key] = msgs;
            }

        } else if (key === 'layout') {
            const layout = form[key];
            const errs = hasMjmlError('', layout);

            let msgs;
            if (Array.isArray(errs)) {
                msgs = errs.map(x => x.formattedMessage)
            } else {
                msgs = [ errs.message ];
            }

            if (!layout.includes('{{{body}}}')) {
                msgs.push(`{{{body}}} not found`);
            }

            if (msgs.length) {
                errors[key] = msgs;
            }
        }
    }

    return errors;
}

module.exports.listDTAjax = listDTAjax;
module.exports.hash = hash;
module.exports.getById = getById;
module.exports.create = create;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
module.exports.getDefaultCustomFormValues = getDefaultCustomFormValues;
module.exports.serverValidate = serverValidate;
