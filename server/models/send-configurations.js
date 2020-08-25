'use strict';

const knex = require('../lib/knex');
const hasher = require('node-object-hash')();
const dtHelpers = require('../lib/dt-helpers');
const shortid = require('../lib/shortid');
const { enforce, filterObject } = require('../lib/helpers');
const interoperableErrors = require('../../shared/interoperable-errors');
const shares = require('./shares');
const namespaceHelpers = require('../lib/namespace-helpers');
const {MailerType, getSystemSendConfigurationId} = require('../../shared/send-configurations');
const contextHelpers = require('../lib/context-helpers');
const mailers = require('../lib/mailers');
const senders = require('../lib/senders');
const dependencyHelpers = require('../lib/dependency-helpers');

const allowedKeys = new Set(['name', 'description', 'from_email', 'from_email_overridable', 'from_name', 'from_name_overridable', 'reply_to', 'reply_to_overridable', 'x_mailer', 'verp_hostname', 'verp_disable_sender_header', 'mailer_type', 'mailer_settings', 'namespace']);

const allowedMailerTypes = new Set(Object.values(MailerType));

function hash(entity) {
    return hasher.hash(filterObject(entity, allowedKeys));
}

async function _listDTAjax(context, namespaceId, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'sendConfiguration', requiredOperations: ['viewPublic'] }],
        params,
        builder => {
            builder = builder
                .from('send_configurations')
                .innerJoin('namespaces', 'namespaces.id', 'send_configurations.namespace');
            if (namespaceId) {
                builder = builder.where('send_configurations.namespace', namespaceId);
            }
            return builder;
        },
        ['send_configurations.id', 'send_configurations.name', 'send_configurations.cid', 'send_configurations.description', 'send_configurations.mailer_type', 'send_configurations.created', 'namespaces.name']
    );
}

async function listDTAjax(context, params) {
    return await _listDTAjax(context, undefined, params);
}

async function listByNamespaceDTAjax(context, namespaceId, params) {
    return await _listDTAjax(context, namespaceId, params);
}

async function listWithSendPermissionDTAjax(context, params) {
    return await dtHelpers.ajaxListWithPermissions(
        context,
        [{ entityTypeId: 'sendConfiguration', requiredOperations: ['sendWithoutOverrides', 'sendWithAllowedOverrides', 'sendWithAnyOverrides'] }],
        params,
        builder => builder
            .from('send_configurations')
            .innerJoin('namespaces', 'namespaces.id', 'send_configurations.namespace'),
        ['send_configurations.id', 'send_configurations.name', 'send_configurations.cid', 'send_configurations.description', 'send_configurations.mailer_type', 'send_configurations.created', 'namespaces.name']
    );
}

async function _getByTx(tx, context, key, id, withPermissions, withPrivateData) {
    let entity;

    if (withPrivateData) {
        entity = await tx('send_configurations').where(key, id).first();

        if (!entity) {
            shares.throwPermissionDenied();
        }

        await shares.enforceEntityPermissionTx(tx, context, 'sendConfiguration', entity.id, 'viewPrivate');

        entity.mailer_settings = JSON.parse(entity.mailer_settings);
    } else {
        entity = await tx('send_configurations').where(key, id).select(
            ['id', 'name', 'cid', 'description', 'from_email', 'from_email_overridable', 'from_name', 'from_name_overridable', 'reply_to', 'reply_to_overridable']
        ).first();

        if (!entity) {
            shares.throwPermissionDenied();
        }

        await shares.enforceEntityPermissionTx(tx, context, 'sendConfiguration', entity.id, 'viewPublic');
    }

    // note that permissions are optional as as this methods may be used with synthetic admin context
    if (withPermissions) {
        entity.permissions = await shares.getPermissionsTx(tx, context, 'sendConfiguration', id);
    }

    return entity;

}

async function getByIdTx(tx, context, id, withPermissions = true, withPrivateData = true) {
    return await _getByTx(tx, context, 'id', id, withPermissions, withPrivateData);
}

async function getById(context, id, withPermissions = true, withPrivateData = true) {
    return await knex.transaction(async tx => {
        return await getByIdTx(tx, context, id, withPermissions, withPrivateData);
    });
}

async function getByCid(context, cid, withPermissions = true, withPrivateData = true) {
    return await knex.transaction(async tx => {
        return await _getByTx(tx, context, 'cid', cid, withPermissions, withPrivateData);
    });
}

async function _validateAndPreprocess(tx, entity, isCreate) {
    await namespaceHelpers.validateEntity(tx, entity);

    enforce(allowedMailerTypes.has(entity.mailer_type), 'Unknown mailer type');
    entity.mailer_settings = JSON.stringify(entity.mailer_settings);
}



async function create(context, entity) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'namespace', entity.namespace, 'createSendConfiguration');

        await _validateAndPreprocess(tx, entity);

        const filteredEntity = filterObject(entity, allowedKeys);
        filteredEntity.cid = shortid.generate();

        const ids = await tx('send_configurations').insert(filteredEntity);
        const id = ids[0];

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'sendConfiguration', entityId: id });

        return id;
    });
}

async function updateWithConsistencyCheck(context, entity) {
    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'sendConfiguration', entity.id, 'edit');

        const existing = await tx('send_configurations').where('id', entity.id).first();
        if (!existing) {
            throw new interoperableErrors.NotFoundError();
        }

        existing.mailer_settings = JSON.parse(existing.mailer_settings);

        const existingHash = hash(existing);
        if (existingHash !== entity.originalHash) {
            throw new interoperableErrors.ChangedError();
        }

        await _validateAndPreprocess(tx, entity);

        await namespaceHelpers.validateMoveTx(tx, context, entity, existing, 'sendConfiguration', 'createSendConfiguration', 'delete');

        await tx('send_configurations').where('id', entity.id).update(filterObject(entity, allowedKeys));

        await shares.rebuildPermissionsTx(tx, { entityTypeId: 'sendConfiguration', entityId: entity.id });
    });

    mailers.invalidateMailer(entity.id);
    senders.reloadConfig(entity.id);
}

async function remove(context, id) {
    if (id === getSystemSendConfigurationId()) {
        shares.throwPermissionDenied();
    }

    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, 'sendConfiguration', id, 'delete');

        await dependencyHelpers.ensureNoDependencies(tx, context, id, [
            { entityTypeId: 'campaign', column: 'send_configuration' },
            { entityTypeId: 'list', column: 'send_configuration' }
        ]);

        await tx('send_configurations').where('id', id).del();
    });
}

async function getSystemSendConfiguration() {
    return await getById(contextHelpers.getAdminContext(), getSystemSendConfigurationId(), false);
}

module.exports.hash = hash;
module.exports.listDTAjax = listDTAjax;
module.exports.listByNamespaceDTAjax = listByNamespaceDTAjax;
module.exports.listWithSendPermissionDTAjax = listWithSendPermissionDTAjax;
module.exports.getByIdTx = getByIdTx;
module.exports.getById = getById;
module.exports.getByCid = getByCid;
module.exports.create = create;
module.exports.updateWithConsistencyCheck = updateWithConsistencyCheck;
module.exports.remove = remove;
module.exports.getSystemSendConfiguration = getSystemSendConfiguration;
