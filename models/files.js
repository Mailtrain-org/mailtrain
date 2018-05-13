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

const entityTypes = permissions.getEntityTypes();

const filesDir = path.join(__dirname, '..', 'files');

function enforceTypePermitted(type) {
    enforce(type in entityTypes && entityTypes[type].filesTable);
}

function getFilePath(type, entityId, filename) {
    return path.join(path.join(filesDir, type, entityId.toString()), filename);
}

function getFileUrl(context, type, entityId, filename) {
    return getTrustedUrl(`files/${type}/${entityId}/${filename}`, context)
}

function getFilesTable(type) {
    return entityTypes[type].filesTable;
}

async function listDTAjax(context, type, entityId, params) {
    enforceTypePermitted(type);
    await shares.enforceEntityPermission(context, type, entityId, 'manageFiles');
    return await dtHelpers.ajaxList(
        params,
        builder => builder.from(getFilesTable(type)).where({entity: entityId}),
        ['id', 'originalname', 'filename', 'size', 'created']
    );
}

async function list(context, type, entityId) {
    return await knex.transaction(async tx => {
        await shares.enforceEntityPermission(context, type, entityId, 'view');
        return await tx(getFilesTable(type)).where({entity: entityId}).select(['id', 'originalname', 'filename', 'size', 'created']).orderBy('originalname', 'asc');
    });
}

async function getFileById(context, type, id) {
    enforceTypePermitted(type);
    const file = await knex.transaction(async tx => {
        const file = await tx(getFilesTable(type)).where('id', id).first();
        await shares.enforceEntityPermissionTx(tx, context, type, file.entity, 'view');
        return file;
    });

    if (!file) {
        throw new interoperableErrors.NotFoundError();
    }

    return {
        mimetype: file.mimetype,
        name: file.originalname,
        path: getFilePath(type, file.entity, file.filename)
    };
}

async function _getFileBy(context, type, entityId, key, value) {
    enforceTypePermitted(type);
    const file = await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, type, entityId, 'view');
        const file = await tx(getFilesTable(type)).where({entity: entityId, [key]: value}).first();
        return file;
    });

    if (!file) {
        throw new interoperableErrors.NotFoundError();
    }

    return {
        mimetype: file.mimetype,
        name: file.originalname,
        path: getFilePath(type, file.entity, file.filename)
    };
}

async function getFileByOriginalName(context, type, entityId, name) {
    return await _getFileBy(context, type, entityId, 'originalname', name)
}

async function getFileByFilename(context, type, entityId, name) {
    return await _getFileBy(context, type, entityId, 'filename', name)
}

async function getFileByUrl(context, type, entityId, url) {
    const urlPrefix = getTrustedUrl(`files/${type}/${entityId}/`, context);
    if (url.startsWith(urlPrefix)) {
        const name = url.substring(urlPrefix.length);
        return await getFileByFilename(context, type, entityId, name);
    } else {
        throw new interoperableErrors.NotFoundError();
    }
}

async function createFiles(context, type, entityId, files, getUrl = null, dontReplace = false) {
    enforceTypePermitted(type);
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
        await shares.enforceEntityPermissionTx(tx, context, type, entityId, 'manageFiles');

        const existingNamesRows = await tx(getFilesTable(type)).where('entity', entityId).select(['filename', 'originalname']);
        const existingNameMap = new Map();
        for (const row of existingNamesRows) {
            existingNameMap.set(row.originalname, row);
        }

        const originalNameSet = new Set();

        // Create entities for files
        for (const file of files) {
            const parsedOriginalName = path.parse(file.originalname);
            let originalName = parsedOriginalName.base;

            if (dontReplace) {
                let suffix = 1;
                while (existingNameMap.has(originalName) || originalNameSet.has(originalName)) {
                    originalName = parsedOriginalName.name + '-' + suffix + parsedOriginalName.ext;
                    suffix++;
                }
            }

            if (originalNameSet.has(originalName)) {
                // The file has an original name same as another file
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
                    type: file.mimetype,
                };

                filesRetEntry.url = getFileUrl(context, type, entityId, file.filename);
                filesRetEntry.thumbnailUrl = getFileUrl(context, type, entityId, file.filename); // TODO - use smaller thumbnails

                filesRet.push(filesRetEntry);

                if (existingNameMap.has(originalName)) {
                    removedFiles.push(existingNameMap.get(originalName));
                }
            }

            originalNameSet.add(originalName);
        }

        const originalNameArray = Array.from(originalNameSet);
        await tx(getFilesTable(type)).where('entity', entityId).whereIn('originalname', originalNameArray).del();

        if (fileEntities) {
            await tx(getFilesTable(type)).insert(fileEntities);
        }
    });

    // Move new files from upload directory to files directory
    for (const file of filesToMove) {
        const filePath = getFilePath(type, entityId, file.filename);
        // The names should be unique, so overwrite is disabled
        // The directory is created if it does not exist
        // Empty options argument is passed, otherwise fails
        await fs.moveAsync(file.path, filePath, {});
    }
    // Remove replaced files from files directory
    for (const file of removedFiles) {
        const filePath = getFilePath(type, entityId, file.filename);
        await fs.removeAsync(filePath);
    }
    // Remove ignored files from upload directory
    for (const file of ignoredFiles) {
        await fs.removeAsync(file.path);
    }

    return {
        uploaded: files.length,
        added: fileEntities.length - removedFiles.length,
        replaced: removedFiles.length,
        ignored: ignoredFiles.length,
        files: filesRet
    };
}

async function removeFile(context, type, id) {
    const file = await knex.transaction(async tx => {
        const file = await tx(getFilesTable(type)).where('id', id).select('entity', 'filename').first();
        await shares.enforceEntityPermissionTx(tx, context, type, file.entity, 'manageFiles');
        await tx(getFilesTable(type)).where('id', id).del();
        return {filename: file.filename, entity: file.entity};
    });

    const filePath = getFilePath(type, file.entity, file.filename);
    await fs.removeAsync(filePath);
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
    getFilePath
};