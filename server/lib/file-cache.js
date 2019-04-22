'use strict';

const { filesDir } = require('../models/files');
const path = require('path');
const fs = require('fs-extra-promise');
const stream = require('stream');
const privilegeHelpers = require('./privilege-helpers');
const synchronized = require('./synchronized');
const { tmpName } = require('tmp-promise');

const fileCacheFilesDir = path.join(filesDir, 'cache');

const fileCaches = new Map();

async function _fileCache(typeId, cacheConfig, fileNameGen) {
    if (fileCaches.has(typeId)) {
        return fileCaches.get(typeId);
    }

    const localFilesDir = path.join(fileCacheFilesDir, typeId);
    await fs.emptyDirAsync(localFilesDir);
    await privilegeHelpers.ensureMailtrainDir(localFilesDir);

    const cachedFiles = new Map();
    let nextFilesOrder = 1;

    const pruneCache = async() => {
        const entries = [];
        for (const entry of cachedFiles.values()) {
            if (entry.isReady) {
                entries.push(entry);
            }
        }

        entries.sort((x, y) => y.order - x.order);

        let cumulativeSize = 0;
        const maxSize = cacheConfig.maxSize * 1048576;
        for (const entry of entries) {
            cumulativeSize += entry.size;
            if (cumulativeSize > maxSize) {
                entry.isReady = false;
                await fs.unlinkAsync(path.join(localFilesDir, entry.fileName));
                cachedFiles.delete(entry.fileName);
            }
        }
    };

    const thisFileCache = (req, res, next) => {
        const fileName = fileNameGen ? fileNameGen(req) : req.url.substring(1);
        const localFilePath = path.join(localFilesDir, fileName);

        const fileInfo = cachedFiles.get(fileName);
        if (fileInfo && fileInfo.isReady) {
            res.sendFile(
                localFilePath,
                {
                    headers: fileInfo.headers
                },
                err => {
                    if (err) next(err);
                }
            );

        } else {
            // This means that the file is not present. We thus generate it and cache it.
            let fileStream = null;
            let tmpFilePath = null;

            // If the file does not exist yet, we store. If we receive a simulataneous request, while the file is being generate and stored,
            // we only generate it (but not store it) in the second parallel request.
            const isStoring = !fileInfo;
            if (isStoring) {
                cachedFiles.set(fileName, {
                    fileName,
                    isReady: false
                });
            }

            const ensureFileStream = callback => {
                if (!fileStream) {
                    tmpName().then(tmp => {
                        tmpFilePath = tmp;
                        fileStream = fs.createWriteStream(tmpFilePath);
                        callback();
                    })
                } else {
                    callback();
                }
            };

            let fileSize = 0;

            res.fileCacheResponse = new stream.Writable({
                write(chunk, encoding, callback) {
                    res.write(chunk, encoding);

                    if (isStoring) {
                        fileSize += chunk.length;
                        ensureFileStream(() => {
                            fileStream.write(chunk, encoding);
                            callback();
                        });
                    } else {
                        callback();
                    }
                },

                final(callback) {
                    res.end();

                    if (isStoring) {
                        ensureFileStream(() => {
                            fileStream.end(null, null, () => {
                                fs.moveAsync(tmpFilePath, localFilePath, {})
                                .then(() => {
                                    cachedFiles.set(fileName, {
                                        fileName,
                                        size: fileSize,
                                        order: nextFilesOrder,
                                        headers: res.getHeaders(),
                                        isReady: true
                                    });

                                    nextFilesOrder += 1;

                                    callback();

                                    // noinspection JSIgnoredPromiseFromCall
                                    pruneCache();
                                })
                                .catch(err => next(err));
                            });
                        });
                    } else {
                        callback();
                    }
                },

                destroy(err, callback) {
                    res.destroy(err);

                    if (fileStream) {
                        fileStream.destroy(err);
                        fs.unlink(tmpFilePath, () => {
                            cachedFiles.delete(fileName);
                            callback();
                        });
                    } else {
                        callback();
                    }
                }
            });

            next();
        }
    };

    fileCaches.set(typeId, thisFileCache);
    return thisFileCache;
}

const fileCache = synchronized(_fileCache);

module.exports.fileCache = fileCache;
module.exports.fileCacheFilesDir = fileCacheFilesDir;