'use strict';

const knex = require('../lib/knex');
const { enforce } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const shares = require('./shares');
const fs = require('fs-extra-promise');
const path = require('path');
const interoperableErrors = require('../shared/interoperable-errors');

const filesDir = path.join(__dirname, '..', 'files');

const permittedTypes = new Set(['template']);

function getFilePath(type, entityId, filename) {
    return path.join(path.join(filesDir, type, entityId.toString()), filename);
}

function getFilesTable(type) {
    return 'files_' + type;
}

async function listDTAjax(context, type, entityId, params) {
    enforce(permittedTypes.has(type));
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
    enforce(permittedTypes.has(type));
    const file = await knex.transaction(async tx => {
        const file = await tx(getFilesTable(type)).where('id', id).first();
        await shares.enforceEntityPermissionTx(tx, context, type, file.entity, 'manageFiles');
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

async function getFileByFilename(context, type, entityId, name) {
    enforce(permittedTypes.has(type));
    const file = await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, type, entityId, 'view');
        const file = await tx(getFilesTable(type)).where({entity: entityId, filename: name}).first();
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

async function createFiles(context, type, entityId, files, dontReplace = false) {
    enforce(permittedTypes.has(type));
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

                filesRet.push({
                    name: file.filename,
                    originalName: originalName,
                    size: file.size,
                    type: file.mimetype,
                    url: `/files/${type}/${entityId}/${file.filename}`
                });

                if (existingNameMap.has(originalName)) {
                    removedFiles.push(existingNameMap.get(originalName));
                }
            }

            originalNameSet.add(originalName);
        }

        const originalNameArray = Array.from(originalNameSet);
        await knex(getFilesTable(type)).where('entity', entityId).whereIn('originalname', originalNameArray).del();

        if (fileEntities) {
            await knex(getFilesTable(type)).insert(fileEntities);
        }
    });

    // Move new files from upload directory to files directory
    for (const file of filesToMove) {
        const filePath = getFilePath(type, entityId, file.filename);
        // The names should be unique, so overwrite is disabled
        // The directory is created if it does not exist
        // Empty options argument is passed, otherwise fails
        await fs.move(file.path, filePath, {});
    }
    // Remove replaced files from files directory
    for (const file of removedFiles) {
        const filePath = getFilePath(type, entityId, file.filename);
        await fs.remove(filePath);
    }
    // Remove ignored files from upload directory
    for (const file of ignoredFiles) {
        await fs.remove(file.path);
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
    await fs.remove(filePath);
}

module.exports = {
    listDTAjax,
    list,
    getFileById,
    getFileByFilename,
    createFiles,
    removeFile,
    filesDir
};