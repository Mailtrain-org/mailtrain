'use strict';

const knex = require('../lib/knex');
const { enforce } = require('../lib/helpers');
const dtHelpers = require('../lib/dt-helpers');
const shares = require('./shares');
const fs = require('fs-extra-promise');
const path = require('path');

const filesDir = path.join(__dirname, '..', 'files');

const permittedTypes = new Set(['template']);

function getFilePath(type, entityId, filename) {
    return path.join(path.join(filesDir, type, id.toString()), filename);
}

function getFilesTable(type) {
    return 'files_' + type;
}

async function listFilesDTAjax(context, type, entityId, params) {
    enforce(permittedTypes.has(type));
    await shares.enforceEntityPermission(context, type, entityId, 'edit');
    return await dtHelpers.ajaxList(
        params,
        builder => builder.from(getFilesTable(type)).where({entity: entityId}),
        ['id', 'originalname', 'size', 'created']
    );
}

async function getFileById(context, type, id) {
    enforce(permittedTypes.has(type));
    const file = await knex.transaction(async tx => {
        const file = await knex(getFilesTable(type)).where('id', id).first();
        await shares.enforceEntityPermissionTx(tx, context, type, file.entity, 'edit');
        return file;
    });

    return {
        mimetype: file.mimetype,
        name: file.originalname,
        path: getFilePath(type, file.entity, file.filename)
    };
}

async function getFileByName(context, type, entityId, name) {
    enforce(permittedTypes.has(type));
    const file = await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, type, entityId, 'view');
        const file = await knex(getFilesTable(type)).where({entity: entityId, originalname: name}).first();
        return file;
    });

    return {
        mimetype: file.mimetype,
        name: file.originalname,
        path: getFilePath(type, file.entity, file.filename)
    };
}

async function createFiles(context, type, entityId, files) {
    enforce(permittedTypes.has(type));
    if (files.length == 0) {
        // No files uploaded
        return {uploaded: 0};
    }

    const originalNameSet = new Set();
    const fileEntities = new Array();
    const filesToMove = new Array();
    const ignoredFiles = new Array();

    // Create entities for files
    for (const file of files) {
        if (originalNameSet.has(file.originalname)) {
            // The file has an original name same as another file
            ignoredFiles.push(file);
        } else {
            originalNameSet.add(file.originalname);

            const fileEntity = {
                entity: entityId,
                filename: file.filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                encoding: file.encoding,
                size: file.size
            };

            fileEntities.push(fileEntity);
            filesToMove.push(file);
        }
    }

    const originalNameArray = Array.from(originalNameSet);

    const removedFiles = await knex.transaction(async tx => {
        await shares.enforceEntityPermissionTx(tx, context, type, entityId, 'edit');
        const removedFiles = await knex(getFilesTable(type)).where('entity', entityId).whereIn('originalname', originalNameArray).select(['filename', 'originalname']);
        await knex(getFilesTable(type)).where('entity', entityId).whereIn('originalname', originalNameArray).del();
        if(fileEntities){
            await knex(getFilesTable(type)).insert(fileEntities);
        }
        return removedFiles;
    });

    const removedNameSet = new Set();

    // Move new files from upload directory to files directory
    for(const file of filesToMove){
        const filePath = getFilePath(entityId, file.filename);
        // The names should be unique, so overwrite is disabled
        // The directory is created if it does not exist
        // Empty options argument is passed, otherwise fails
        await fs.move(file.path, filePath, {});
    }
    // Remove replaced files from files directory
    for(const file of removedFiles){
        removedNameSet.add(file.originalname);
        const filePath = getFilePath(type, entityId, file.filename);
        await fs.remove(filePath);
    }
    // Remove ignored files from upload directory
    for(const file of ignoredFiles){
        await fs.remove(file.path);
    }

    return {
        uploaded: files.length,
        added: fileEntities.length - removedNameSet.size,
        replaced: removedFiles.length,
        ignored: ignoredFiles.length
    };
}

async function removeFile(context, type, id) {
    const file = await knex.transaction(async tx => {
        const file = await knex(getFilesTable(type)).where('id', id).select('entity', 'filename').first();
        await shares.enforceEntityPermissionTx(tx, context, type, file.entity, 'edit');
        await tx(getFilesTable(type)).where('id', id).del();
        return {filename: file.filename, entity: file.entity};
    });

    const filePath = getFilePath(type, file.entity, file.filename);
    await fs.remove(filePath);
}

module.exports = {
    listFilesDTAjax,
    getFileById,
    getFileByName,
    createFiles,
    removeFile
};