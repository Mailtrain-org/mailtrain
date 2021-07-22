'use strict';

const { filesDir } = require('../models/files');
const path = require('path');
const log = require('./log');
const knex = require('./knex');
const fs = require('fs-extra-promise');
const stream = require('stream');
const privilegeHelpers = require('./privilege-helpers');
const synchronized = require('./synchronized');
const { tmpName } = require('tmp-promise');

const pruneBatchSize = 1000;

const fileCacheFilesDir = path.join(filesDir, 'cache');

const fileCaches = new Map();

async function _fileCache(typeId, cacheConfig, keyGen) {
    if (fileCaches.has(typeId)) {
        return fileCaches.get(typeId);
    }

    const localFilesDir = path.join(fileCacheFilesDir, typeId);
    await privilegeHelpers.ensureMailtrainDir(localFilesDir);

    let mayNeedPruning = true;

    const getLocalFileName = id => path.join(localFilesDir, id.toString());

    const pruneCache = async() => {
        if (mayNeedPruning) {
            try {
                const maxSize = cacheConfig.maxSize * 1048576;

                let lastId = null;
                let cumulativeSize = 0;

                while (true) {
                    let entriesQry = knex('file_cache').where('type', typeId).orderBy('id', 'desc').limit(pruneBatchSize);
                    if (lastId) {
                        entriesQry = entriesQry.where('id', '<', lastId);
                    }

                    const entries = await entriesQry;

                    if (entries.length > 0) {
                        for (const entry of entries) {
                            cumulativeSize += entry.size;
                            if (cumulativeSize > maxSize) {
                                await fs.unlinkAsync(getLocalFileName(entry.id));
                                await knex('file_cache').where('id', entry.id).del();
                            }

                            lastId = entry.id;
                        }
                    } else {
                        break;
                    }
                }
            } catch (err) {
                log.error('FileCache', err);
            }

            mayNeedPruning = false;
        }
    };

    await pruneCache();
    setInterval(pruneCache, cacheConfig.pruneInterval * 1000);


    const handleCache = async (key, res, next) => {
        const fileEntry = await knex('file_cache').where('type', typeId).where('key', key).first();

        if (fileEntry) {
            res.sendFile(
                getLocalFileName(fileEntry.id),
                {
                    headers: {'Content-Type': fileEntry.mimetype}
                },
                err => {
                    if (err && err.code === 'ENOENT') {
                        // If entry is missing and yet we got here, it means that we hit the interval file creation/unlink and DB update.
                        // In this case, we just generate the file and don't cache it.
                        res.fileCacheResponse = res;
                        next();

                    } else if (err) next(err);
                }
            );

        } else {
            // This means that the file is not present or it is just being created. We thus generate it and cache it.
            let fileStream = null;
            let tmpFilePath = null;

            const ensureFileStream = callback => {
                if (!fileStream) {
                    tmpName().then(tmp => {
                        tmpFilePath = tmp;
                        fileStream = fs.createWriteStream(tmpFilePath);
                        setTimeout(callback, 5000);
                    })
                } else {
                    callback();
                }
            };

            let fileSize = 0;

            res.fileCacheResponse = new stream.Writable({
                write(chunk, encoding, callback) {
                    res.write(chunk, encoding);

                    fileSize += chunk.length;
                    ensureFileStream(() => {
                        fileStream.write(chunk, encoding);
                        callback();
                    });
                },

                final(callback) {
                    res.end();

                    ensureFileStream(() => {
                        fileStream.end(null, null, async () => {
                            try {
                                await knex.transaction(async tx => {
                                    const existingFileEntry = await knex('file_cache').where('type', typeId).where('key', key).first();

                                    if (!existingFileEntry) {
                                        const ids = await tx('file_cache').insert({type: typeId, key, mimetype: res.getHeader('Content-Type'), size: fileSize});
                                        await fs.moveAsync(tmpFilePath, getLocalFileName(ids[0]), {});
                                        mayNeedPruning = true;
                                    } else {
                                        await fs.unlinkAsync(tmpFilePath);
                                    }
                                });
                            } catch (err) {
                                await fs.unlinkAsync(tmpFilePath);
                            }

                            callback();
                        });
                    });
                },

                destroy(err, callback) {
                    res.destroy(err);

                    if (fileStream) {
                        fileStream.destroy(err);
                        fs.unlink(tmpFilePath, () => {
                            knex('file_cache').where('type', typeId).where('key', key).del().then(()=> callback());
                        });
                    } else {
                        callback();
                    }
                }
            });

            next();
        }
    };

    const thisFileCache = (req, res, next) => {
        const key = keyGen ? keyGen(req) : req.url.substring(1);

        if (key === null) { // null key means we don't attempt to cache
            res.fileCacheResponse = res;
            next();

        } else {
            handleCache(key, res, next).catch(err => next(err));
        }
    };

    fileCaches.set(typeId, thisFileCache);
    return thisFileCache;
}

const fileCache = synchronized(_fileCache);

module.exports.fileCache = fileCache;
module.exports.fileCacheFilesDir = fileCacheFilesDir;
