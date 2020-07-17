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
const { allTagLanguages } = require('../../shared/templates');
const messageSender = require('../lib/message-sender');

const allowedKeys = new Set(['name', 'description', 'type', 'tag_language', 'data', 'html', 'text', 'namespace']);

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
        [ 'templates.id', 'templates.name', 'templates.description', 'templates.type', 'templates.tag_language', 'templates.created', 'namespaces.name' ]
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

    enforce(allTagLanguages.includes(entity.tag_language), `Invalid tag language '${entity.tag_language}'`);

    // We don't check contents of the "data" because it is processed solely on the client. The client generates the HTML code we use when sending out campaigns.
}

async function create(context, entity) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createTemplate');

        if (entity.fromExistingEntity) {
            const existing = await getByIdTx(tx, context, entity.existingEntity, false);

            entity.type = existing.type;
            entity.tag_language = existing.tag_language;
            entity.data = existing.data;
            entity.html = existing.html;
            entity.text = existing.text;
        }

        await _validateAndPreprocess(tx, entity);

        const filteredEntityWithUnstringifiedData = filterObject(entity, allowedKeys);
        const filteredEntity = {
            ...filteredEntityWithUnstringifiedData,
            data: JSON.stringify(filteredEntityWithUnstringifiedData.data)
        };

        const ids = await tx('templates').insert(filteredEntity);
        const id = ids[0];

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'template', entityId: id });

        if (entity.fromExistingEntity) {
            await files.copyAllTx(tx, context, 'template', 'file', entity.existingEntity, 'template', 'file', id);

            convertFileURLs(filteredEntityWithUnstringifiedData, 'template', entity.existingEntity, 'template', id);

            const filteredEntity = {
                ...filteredEntityWithUnstringifiedData,
                data: JSON.stringify(filteredEntityWithUnstringifiedData.data)
            };

            await tx('templates').update(filteredEntity).where('id', id);
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
        entity.data = JSON.stringify(entity.data);

        await namespaceHelpers.validateMoveTx(tx, context, entity, existing, 'template', 'createTemplate', 'delete');

        const filteredEntity = filterObject(entity, allowedKeys);

        await tx('templates').where('id', entity.id).update(filteredEntity);

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

async function sendAsTransactionalEmail(context, templateId, sendConfigurationId, emails, subject, mergeTags, attachments) {
    const template = await getById(context, templateId, false);

    await shares.enforceEntityPermission(context, 'sendConfiguration', sendConfigurationId, 'sendWithoutOverrides');

    await knex.transaction(async tx => {
		for (const email of emails) {
			await messageSender.queueAPITransactionalMessageTx(tx, sendConfigurationId, email, subject, template.html, template.text, template.tag_language, {...mergeTags,  EMAIL: email }, attachments);
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
