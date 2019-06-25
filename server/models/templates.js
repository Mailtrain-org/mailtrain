'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const { enforce, filterObject } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const namespaceHelpers = require('../lib/namespace-helpers');
const shares = require('./shares');
const files = require('./files');
const dependencyHelpers = require('../lib/dependency-helpers');
const {convertFileURLs} = require('../lib/campaign-content');

const mailers = require('../lib/mailers');
const tools = require('../lib/tools');
const sendConfigurations = require('./send-configurations');
const { getMergeTagsForBases } = require('../../shared/templates');
const { getTrustedUrl, getSandboxUrl, getPublicUrl } = require('../lib/urls');
const htmlToText = require('html-to-text');

const allowedKeys = new Set(['name', 'description', 'type', 'data', 'html', 'text', 'namespace']);

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function getByIdTx(tx, context, id, withPermissions = true) {
    await shares.enforceEntityPermissionTx(tx, context, 'template', id, 'view');
    const entity = await tx('templates').where('id', id).first();
    entity.data = JSON.parse(entity.data);

    if (withPermissions) {
        entity.permissions = await shares.getPermissionsTx(tx, context, 'template', id);
    }

    return entity;
}

async function getById(context, id, withPermissions = true) {
    return await knex.transaction(async tx => {
        return await getByIdTx(tx, context, id, withPermissions);
    });
}

async function _listDTAjax(context, namespaceId, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'template', requiredOperations: ['view'] }],
        params,
        builder => {
            builder = builder.from('templates').innerJoin('namespaces', 'namespaces.id', 'templates.namespace');
            if (namespaceId) {
                builder = builder.where('namespaces.id', namespaceId);
            }
            return builder;
        },
        [ 'templates.id', 'templates.name', 'templates.description', 'templates.type', 'templates.created', 'namespaces.name' ]
    );
}

async function listDTAjax(context, params) {
    return await _listDTAjax(context, undefined, params);
}

async function listByNamespaceDTAjax(context, namespaceId, params) {
    return await _listDTAjax(context, namespaceId, params);
}

async function _validateAndPreprocess(tx, entity) {
    await namespaceHelpers.validateEntity(tx, entity);

    // We don't check contents of the "data" because it is processed solely on the client. The client generates the HTML code we use when sending out campaigns.

    entity.data = JSON.stringify(entity.data);
}

async function create(context, entity) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createTemplate');

        if (entity.fromSourceTemplate) {
            const template = await getByIdTx(tx, context, entity.sourceTemplate, false);

            entity.type = template.type;
            entity.data = template.data;
            entity.html = template.html;
            entity.text = template.text;
        }

        await _validateAndPreprocess(tx, entity);

        const ids = await tx('templates').insert(filterObject(entity, allowedKeys));
        const id = ids[0];

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'template', entityId: id });

        if (entity.fromSourceTemplate) {
            await files.copyAllTx(tx, context, 'template', 'file', entity.sourceTemplate, 'template', 'file', id);

            convertFileURLs(entity, 'template', entity.sourceTemplate, 'template', id);
            await tx('templates').update(filterObject(entity, allowedKeys)).where('id', id);
        }

        return id;
    });
}

async function updateWithConsistencyCheck(context, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'template', entity.id, 'edit');

        const existing = await tx('templates').where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        existing.data = JSON.parse(existing.data);

        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await _validateAndPreprocess(tx, entity);

        await namespaceHelpers.validateMove(context, entity, existing, 'template', 'createTemplate', 'delete');

        await tx('templates').where('id', entity.id).update(filterObject(entity, allowedKeys));

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'template', entityId: entity.id });
    });
}

async function remove(context, id) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'template', id, 'delete');

        await dependencyHelpers.ensureNoDependencies(tx, context, id, [
            {
                entityTypeId: 'campaign',
                query: tx => tx('template_dep_campaigns')
                    .where('template_dep_campaigns.template', id)
                    .innerJoin('campaigns', 'template_dep_campaigns.campaign', 'campaigns.id')
                    .select(['campaigns.id', 'campaigns.name'])
            }
        ]);

        await files.removeAllTx(tx, context, 'template', 'file', id);

        await tx('templates').where('id', id).del();
    });
}

const MAX_EMAIL_COUNT = 100;
async function sendAsTransactionalEmail(context, templateId, sendConfigurationId, emails, subject, mergeTags) {
    // TODO - Update this to use CampaignSender.queueMessageTx (with renderedHtml and renderedText)

    if (emails.length > MAX_EMAIL_COUNT) {
        throw new Error(`Cannot send more than ${MAX_EMAIL_COUNT} emails at once`);
    }

    await knex.transaction(async tx => {
        const template = await getByIdTx(tx, context, templateId,false);
        const sendConfiguration = await sendConfigurations.getByIdTx(tx, context, sendConfigurationId, false, false);

        await shares.enforceEntityPermissionTx(tx, context, 'sendConfiguration', sendConfigurationId, 'sendWithoutOverrides');

        const mailer = await mailers.getOrCreateMailer(sendConfigurationId);

        const variablesSkeleton = {
            ...getMergeTagsForBases(getTrustedUrl(), getSandboxUrl(), getPublicUrl()),
            ...mergeTags
        };

        for (const email of emails) {
            const variables = {
                ...variablesSkeleton,
                EMAIL: email
            };

            const html = tools.formatTemplate(
                template.html,
                null,
                variables,
                true
            );

            const text = (template.text || '').trim()
                ? tools.formatTemplate(
                    template.text,
                    null,
                    variables,
                    false
                ) : htmlToText.fromString(html, {wordwrap: 130});

            return mailer.sendTransactionalMail(
                {
                    to: email,
                    subject,
                    from: {
                        name: sendConfiguration.from_name,
                        address: sendConfiguration.from_email
                    },
                    html,
                    text
                 }
            );
        }
    });
}


module.exports.hash = hash;
module.exports.getByIdTx = getByIdTx;
module.exports.getById = getById;
module.exports.listDTAjax = listDTAjax;
module.exports.listByNamespaceDTAjax = listByNamespaceDTAjax;
module.exports.create = create;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
module.exports.sendAsTransactionalEmail = sendAsTransactionalEmail;
