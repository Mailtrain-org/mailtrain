'use strict';

const knex = require('../lib/knex');
const { enforce } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const shares = require('./shares');
const fs = require('fs-extra-promise');
const path = require('path');
const interoperableErrors = require('../shared/interoperable-errors');
const permissions = require('../lib/permissions');
const {getTrustedUrl} = require('../lib/urls');

const crypto = require('crypto');
const bluebird = require('bluebird');
const cryptoPseudoRandomBytes = bluebird.promisify(crypto.pseudoRandomBytes);

const entityTypes = permissions.getEntityTypes();

const filesDir = path.join(__dirname, '..', 'files');

const ReplacementBehavior = {
    NONE: 0,
    REPLACE: 1,
    RENAME: 2
};

function enforceTypePermitted(type, subType) {
    enforce(type in entityTypes && entityTypes[type].files && entityTypes[type].files[subType]);
}

function getFilePath(type, subType, entityId, filename) {
    return path.join(path.join(filesDir, type, subType, entityId.toString()), filename);
}

function getFileUrl(context, type, subType, entityId, filename) {
    return getTrustedUrl(`files/${type}/${subType}/${entityId}/${filename}`, context)
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
        builder => builder.from(getFilesTable(type, subType)).where({entity: entityId}),
        ['id', 'originalname', 'filename', 'size', 'created']
    );
}

async function list(context, type, subType, entityId) {
    enforceTypePermitted(type, subType);
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, type, entityId, getFilesPermission(type, subType, 'view'));
        return await tx(getFilesTable(type, subType)).where({entity: entityId}).select(['id', 'originalname', 'filename', 'size', 'created']).orderBy('originalname', 'asc');
    });
}

async function getFileById(context, type, subType, id) {
    enforceTypePermitted(type, subType);
    const file = await knex.transaction(async tx => {
        const file = await tx(getFilesTable(type, subType)).where('id', id).first();
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
        const file = await tx(getFilesTable(type, subType)).where({entity: entityId, [key]: value}).first();
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

async function getFileByUrl(context, type, subType, entityId, url) {
    const urlPrefix = getTrustedUrl(`files/${type}/${subType}/${entityId}/`, context);
    if (url.startsWith(urlPrefix)) {
        const name = url.substring(urlPrefix.length);
        return await getFileByFilename(context, type, subType, entityId, name);
    } else {
        throw new interoperableErrors.NotFoundError();
    }
}

// Adds files to an entity. The source data can be either a file (then it's path is contained in file.path) or in-memory data (then it's content is in file.data).
async function createFiles(context, type, subType, entityId, files, replacementBehavior) {
    enforceTypePermitted(type, subType);
    if (files.length == 0) {
        // No files uploaded
        return {uploaded: 0};
    }

    const fileEntities = [];
    const filesToMove = [];
    const ignoredFiles = [];
    const removedFiles = [];
    const filesRet = [];

    await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, type, entityId, getFilesPermission(type, subType, 'manage'));

        const existingNamesRows = await tx(getFilesTable(type, subType)).where('entity', entityId).select(['id', 'filename', 'originalname']);

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
                    encoding: file.encoding,
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
            for (const row of existingNamesRows) {
                const idsToRemove = [];
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

    return {
        uploaded: files.length,
        added: fileEntities.length - removedFiles.length,
        replaced: removedFiles.length,
        ignored: ignoredFiles.length,
        files: filesRet
    };
}

async function removeFile(context, type, subType, id) {
    enforceTypePermitted(type, subType);

    const file = await knex.transaction(async tx => {
        const file = await tx(getFilesTable(type, subType)).where('id', id).select('entity', 'filename').first();
        await shares.enforceEntityPermissionTx(tx, context, type, file.entity, getFilesPermission(type, subType, 'manage'));
        await tx(getFilesTable(type, subType)).where('id', id).del();
        return {filename: file.filename, entity: file.entity};
    });

    const filePath = getFilePath(type, subType, file.entity, file.filename);
    await fs.removeAsync(filePath);
}

async function copyAllTx(tx, context, fromType, fromSubType, fromEntityId, toType, toSubType, toEntityId) {
    enforceTypePermitted(fromType, fromSubType);
    await shares.enforceEntityPermissionTx(tx, context, fromType, fromEntityId, getFilesPermission(fromType, fromSubType, 'view'));

    enforceTypePermitted(toType, toSubType);
    await shares.enforceEntityPermissionTx(tx, context, toType, toEntityId, getFilesPermission(toType, toSubType, 'manage'));

    const rows = await tx(getFilesTable(fromType, fromSubType)).where({entity: fromEntityId});
    for (const row of rows) {
        const fromFilePath = getFilePath(fromType, fromSubType, fromEntityId, row.filename);
        const toFilePath = getFilePath(toType, toSubType, toEntityId, row.filename);
        await fs.copyAsync(fromFilePath, toFilePath, {});

        delete row.id;
        row.entity = toEntityId;
    }

    await tx(getFilesTable(toType, toSubType)).insert(rows);
}


module.exports = {
    filesDir,
    listDTAjax,
    list,
    getFileById,
    getFileByFilename,
    getFileByUrl,
    getFileByOriginalName,
    createFiles,
    removeFile,
    getFileUrl,
    getFilePath,
    copyAllTx,
    ReplacementBehavior
};