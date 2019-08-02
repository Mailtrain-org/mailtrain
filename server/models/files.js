'use strict';

const knex = require('../lib/knex');
const { enforce } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const shares = require('./shares');
const fs = require('fs-extra-promise');
const path = require('path');
const interoperableErrors = require('../../shared/interoperable-errors');
const entitySettings = require('../lib/entity-settings');
const {getPublicUrl} = require('../lib/urls');

const crypto = require('crypto');
const bluebird = require('bluebird');
const cryptoPseudoRandomBytes = bluebird.promisify(crypto.pseudoRandomBytes.bind(crypto));

const entityTypes = entitySettings.getEntityTypes();

const filesDir = path.join(__dirname, '..', 'files');

const ReplacementBehavior = entitySettings.ReplacementBehavior;

function enforceTypePermitted(type, subType) {
    enforce(type in entityTypes && entityTypes[type].files && entityTypes[type].files[subType], `File type ${type}:${subType} does not exist`);
}

function getFilePath(type, subType, entityId, filename) {
    return path.join(filesDir, type, subType, entityId.toString(), filename);
}

function getFileUrl(context, type, subType, entityId, filename) {
    return getPublicUrl(`files/${type}/${subType}/${entityId}/${filename}`)
}

function getFilesTable(type, subType) {
    return entityTypes[type].files[subType].table;
}

function getFilesPermission(type, subType, operation) {
    return entityTypes[type].files[subType].permissions[operation];
}

async function listDTAjax(context, type, subType, entityId, params) {
    enforceTypePermitted(type, subType);
    await shares.enforceEntityPermission(context, type, entityId, getFilesPermission(type, subType, 'view'));
    return await dtHelpers.ajaxList(
        params,
        builder => builder.from(getFilesTable(type, subType)).where({entity: entityId, delete_pending: false}),
        ['id', 'originalname', 'filename', 'size', 'created']
    );
}

async function listTx(tx, context, type, subType, entityId) {
    enforceTypePermitted(type, subType);
    await shares.enforceEntityPermissionTx(tx, context, type, entityId, getFilesPermission(type, subType, 'view'));
    return await tx(getFilesTable(type, subType)).where({entity: entityId, delete_pending: false}).select(['id', 'originalname', 'filename', 'size', 'created']).orderBy('originalname', 'asc');
}

async function list(context, type, subType, entityId) {
    return await knex.transaction(async tx => {
        return await listTx(tx, context, type, subType, entityId);
    });
}

async function getFileById(context, type, subType, id) {
    enforceTypePermitted(type, subType);
    const file = await knex.transaction(async tx => {
        const file = await tx(getFilesTable(type, subType)).where({id: id, delete_pending: false}).first();
        await shares.enforceEntityPermissionTx(tx, context, type, file.entity, getFilesPermission(type, subType, 'view'));
        return file;
    });

    if (!file) {
        throw new interoperableErrors.NotFoundError();
    }

    return {
        mimetype: file.mimetype,
        name: file.originalname,
        path: getFilePath(type, subType, file.entity, file.filename)
    };
}

async function _getFileBy(context, type, subType, entityId, key, value) {
    enforceTypePermitted(type, subType);
    const file = await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, type, entityId, getFilesPermission(type, subType, 'view'));
        const file = await tx(getFilesTable(type, subType)).where({entity: entityId, delete_pending: false, [key]: value}).first();
        return file;
    });

    if (!file) {
        throw new interoperableErrors.NotFoundError();
    }

    return {
        mimetype: file.mimetype,
        name: file.originalname,
        path: getFilePath(type, subType, file.entity, file.filename)
    };
}

async function getFileByOriginalName(context, type, subType, entityId, name) {
    return await _getFileBy(context, type, subType, entityId, 'originalname', name)
}

async function getFileByFilename(context, type, subType, entityId, name) {
    return await _getFileBy(context, type, subType, entityId, 'filename', name)
}

async function getFileByUrl(context, url) {
    const urlPrefix = getPublicUrl('files/');
    if (url.startsWith(urlPrefix)) {
        const path = url.substring(urlPrefix.length);
        const pathElem = path.split('/');

        if (pathElem.length !== 4) {
            throw new interoperableErrors.NotFoundError();
        }

        const type = pathElem[0];
        const subType = pathElem[1];
        const entityId = Number.parseInt(pathElem[2]);

        if (Number.isNaN(entityId)) {
            throw new interoperableErrors.NotFoundError();
        }

        const name = pathElem[3];

        return await getFileByFilename(context, type, subType, entityId, name);
    } else {
        throw new interoperableErrors.NotFoundError();
    }
}

// Adds files to an entity. The source data can be either a file (then it's path is contained in file.path) or in-memory data (then it's content is in file.data).
async function createFiles(context, type, subType, entityId, files, replacementBehavior, transformResponseFn) {
    enforceTypePermitted(type, subType);
    if (files.length == 0) {
        // No files uploaded
        return {uploaded: 0};
    }

    if (!replacementBehavior) {
        replacementBehavior = entityTypes[type].files[subType].defaultReplacementBehavior;
    }

    const fileEntities = [];
    const filesToMove = [];
    const ignoredFiles = [];
    const removedFiles = [];
    const filesRet = [];

    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, type, entityId, getFilesPermission(type, subType, 'manage'));

        const existingNamesRows = await tx(getFilesTable(type, subType)).where({entity: entityId, delete_pending: false}).select(['id', 'filename', 'originalname']);

        const existingNameSet = new Set();
        for (const row of existingNamesRows) {
            existingNameSet.add(row.originalname);
        }

        // The processedNameSet holds originalnames of entries which have been already processed in the upload batch. It prevents uploading two files with the same originalname
        const processedNameSet = new Set();


        // Create entities for files
        for (const file of files) {
            const parsedOriginalName = path.parse(file.originalname);
            let originalName = parsedOriginalName.base;

            if (!file.filename) {
                // This is taken from multer/storage/disk.js and adapted for async/await
                file.filename = (await cryptoPseudoRandomBytes(16)).toString('hex');
            }

            if (replacementBehavior === ReplacementBehavior.RENAME) {
                let suffix = 1;
                while (existingNameSet.has(originalName) || processedNameSet.has(originalName)) {
                    originalName = parsedOriginalName.name + '-' + suffix + parsedOriginalName.ext;
                    suffix++;
                }
            }

            if (replacementBehavior === ReplacementBehavior.NONE && (existingNameSet.has(originalName) || processedNameSet.has(originalName))) {
                // The file has an original name same as another file in the same upload batch or it has an original name same as another already existing file
                ignoredFiles.push(file);

            } else {
                filesToMove.push(file);

                fileEntities.push({
                    entity: entityId,
                    filename: file.filename,
                    originalname: originalName,
                    mimetype: file.mimetype,
                    size: file.size
                });

                const filesRetEntry = {
                    name: file.filename,
                    originalName: originalName,
                    size: file.size,
                    type: file.mimetype
                };

                filesRetEntry.url = getFileUrl(context, type, subType, entityId, file.filename);

                if (file.mimetype.startsWith('image/')) {
                    filesRetEntry.thumbnailUrl = getFileUrl(context, type, subType, entityId, file.filename); // TODO - use smaller thumbnails,
                }

                filesRet.push(filesRetEntry);
            }

            processedNameSet.add(originalName);
        }

        if (replacementBehavior === ReplacementBehavior.REPLACE) {
            const idsToRemove = [];
            for (const row of existingNamesRows) {
                if (processedNameSet.has(row.originalname)) {
                    removedFiles.push(row);
                    idsToRemove.push(row.id);
                }
            }

            await tx(getFilesTable(type, subType)).where('entity', entityId).whereIn('id', idsToRemove).del();
        }

        if (fileEntities) {
            await tx(getFilesTable(type, subType)).insert(fileEntities);
        }
    });

    // Move new files from upload directory to files directory
    for (const file of filesToMove) {
        const filePath = getFilePath(type, subType, entityId, file.filename);

        if (file.path) {
            // The names should be unique, so overwrite is disabled
            // The directory is created if it does not exist
            // Empty options argument is passed, otherwise fails
            await fs.moveAsync(file.path, filePath, {});
        } else if (file.data) {
            await fs.outputFile(filePath, file.data);
        }
    }
    // Remove replaced files from files directory
    for (const file of removedFiles) {
        const filePath = getFilePath(type, subType, entityId, file.filename);
        await fs.removeAsync(filePath);
    }
    // Remove ignored files from upload directory
    for (const file of ignoredFiles) {
        if (file.path) {
            await fs.removeAsync(file.path);
        }
    }

    const resp = {
        uploaded: files.length,
        added: fileEntities.length - removedFiles.length,
        replaced: removedFiles.length,
        ignored: ignoredFiles.length,
        files: filesRet
    };

    if (transformResponseFn) {
        return transformResponseFn(resp);
    } else {
        return resp;
    }
}

async function lockTx(tx, type, subType, id) {
    enforceTypePermitted(type, subType);
    const filesTableName = getFilesTable(type, subType);
    await tx(filesTableName).where('id', id).increment('lock_count');
}

async function unlockTx(tx, type, subType, id) {
    enforceTypePermitted(type, subType);

    const filesTableName = getFilesTable(type, subType);
    const file = await tx(filesTableName).where('id', id).first();

    enforce(file, `File ${id} not found`);
    enforce(file.lock_count > 0, `Corrupted lock count at file ${id}`);

    if (file.lock_count === 1 && file.delete_pending) {
        await tx(filesTableName).where('id', id).del();

        const filePath = getFilePath(type, subType, file.entity, file.filename);
        await fs.removeAsync(filePath);

    } else {
        await tx(filesTableName).where('id', id).update({lock_count: file.lock_count - 1});
    }
}

async function removeFile(context, type, subType, id) {
    enforceTypePermitted(type, subType);

    await knex.transaction(async tx => {
        const filesTableName = getFilesTable(type, subType);
        const file = await tx(filesTableName).where('id', id).first();
        await shares.enforceEntityPermissionTx(tx, context, type, file.entity, getFilesPermission(type, subType, 'manage'));

        if (!file.lock_count) {
            await tx(filesTableName).where('id', file.id).del();

            const filePath = getFilePath(type, subType, file.entity, file.filename);
            await fs.removeAsync(filePath);
        } else {
            await tx(filesTableName).where('id', file.id).update({delete_pending: true});
        }
    });
}

async function copyAllTx(tx, context, fromType, fromSubType, fromEntityId, toType, toSubType, toEntityId) {
    enforceTypePermitted(fromType, fromSubType);
    await shares.enforceEntityPermissionTx(tx, context, fromType, fromEntityId, getFilesPermission(fromType, fromSubType, 'view'));

    enforceTypePermitted(toType, toSubType);
    await shares.enforceEntityPermissionTx(tx, context, toType, toEntityId, getFilesPermission(toType, toSubType, 'manage'));

    const rows = await tx(getFilesTable(fromType, fromSubType)).where({entity: fromEntityId, delete_pending: false});
    for (const row of rows) {
        const fromFilePath = getFilePath(fromType, fromSubType, fromEntityId, row.filename);
        const toFilePath = getFilePath(toType, toSubType, toEntityId, row.filename);
        await fs.copyAsync(fromFilePath, toFilePath, {});

        delete row.id;
        row.entity = toEntityId;
    }

    if (rows.length > 0) {
        await tx(getFilesTable(toType, toSubType)).insert(rows);
    }
}

async function removeAllTx(tx, context, type, subType, entityId) {
    enforceTypePermitted(type, subType);
    await shares.enforceEntityPermissionTx(tx, context, type, entityId, getFilesPermission(type, subType, 'manage'));

    const rows = await tx(getFilesTable(type, subType)).where({entity: entityId});
    for (const row of rows) {
        const filePath = getFilePath(type, subType, entityId, row.filename);
        await fs.removeAsync(filePath);
    }

    await tx(getFilesTable(type, subType)).where('entity', entityId).del();
}


module.exports.filesDir = filesDir;
module.exports.listDTAjax = listDTAjax;
module.exports.listTx = listTx;
module.exports.list = list;
module.exports.getFileById = getFileById;
module.exports.getFileByFilename = getFileByFilename;
module.exports.getFileByUrl = getFileByUrl;
module.exports.getFileByOriginalName = getFileByOriginalName;
module.exports.createFiles = createFiles;
module.exports.removeFile = removeFile;
module.exports.getFileUrl = getFileUrl;
module.exports.getFilePath = getFilePath;
module.exports.copyAllTx = copyAllTx;
module.exports.removeAllTx = removeAllTx;
module.exports.lockTx = lockTx;
module.exports.unlockTx = unlockTx;
module.exports.ReplacementBehavior = ReplacementBehavior;
