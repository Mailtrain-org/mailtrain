'use strict';

const log = require('./log');
const config = require('./config');

const fs = require('fs-extra-promise');

const tryRequire = require('try-require');
const posix = tryRequire('posix');

// process.getuid and process.getgid are not supported on Windows 
process.getuid = process.getuid || (() => 100);
process.getgid = process.getuid || (() => 100);

function _getConfigUidGid(userKey, groupKey, defaultUid, defaultGid) {
    let uid = defaultUid;
    let gid = defaultGid;

    if (posix) {
        try {
            if (config[userKey]) {
                uid = posix.getpwnam(config[userKey]).uid;
            }
        } catch (err) {
            log.info('PrivilegeHelpers', 'Failed to resolve user id "%s"', config[userKey]);
        }

        try {
            if (config[groupKey]) {
                gid = posix.getpwnam(config[groupKey]).gid;
            }
        } catch (err) {
            log.info('PrivilegeHelpers', 'Failed to resolve group id "%s"', config[groupKey]);
        }
    } else {
        log.info('PrivilegeHelpers', 'Posix module not installed. Cannot resolve uid/gid');
    }

    return { uid, gid };
}

function getConfigUidGid() {
    return _getConfigUidGid('user', 'group', process.getuid(), process.getgid());
}

function getConfigROUidGid() {
    const rwIds = getConfigUidGid();
    return _getConfigUidGid('roUser', 'roGroup', rwIds.uid, rwIds.gid);
}

function ensureMailtrainOwner(file, callback) {
    const ids = getConfigUidGid();

    if (callback) {
        fs.chown(file, ids.uid, ids.gid, callback);
    } else {
        return fs.chownAsync(file, ids.uid, ids.gid);
    }
}

async function ensureMailtrainDir(dir) {
    await fs.ensureDirAsync(dir);
    await ensureMailtrainOwner(dir);
}

function dropRootPrivileges() {
    if (config.group) {
        try {
            process.setgid(config.group);
            log.info('PrivilegeHelpers', 'Changed group to "%s" (%s)', config.group, process.getgid());
        } catch (E) {
            log.info('PrivilegeHelpers', 'Failed to change group to "%s" (%s)', config.group, E.message);
        }
    }

    if (config.user) {
        try {
            process.setuid(config.user);
            log.info('PrivilegeHelpers', 'Changed user to "%s" (%s)', config.user, process.getuid());
        } catch (E) {
            log.info('PrivilegeHelpers', 'Failed to change user to "%s" (%s)', config.user, E.message);
        }
    }
}

module.exports = {
    dropRootPrivileges,
    ensureMailtrainOwner,
    ensureMailtrainDir,
    getConfigUidGid,
    getConfigROUidGid
};
