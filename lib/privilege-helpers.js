'use strict';

const log = require('npmlog');
const config = require('config');

const fs = require('fs');

const tryRequire = require('try-require');
const posix = tryRequire('posix');

function _getConfigUidGid(prefix, defaultUid, defaultGid) {
    let uid = defaultUid;
    let gid = defaultGid;

    if (posix) {
        try {
            if (config.user) {
                uid = posix.getpwnam(config[prefix + 'user']).uid;
            }
        } catch (err) {
            log.info('PrivilegeHelpers', 'Failed to resolve user id "%s"', config[prefix + 'user']);
        }

        try {
            if (config.user) {
                gid = posix.getpwnam(config[prefix + 'group']).gid;
            }
        } catch (err) {
            log.info('PrivilegeHelpers', 'Failed to resolve group id "%s"', config[prefix + 'group']);
        }
    } else {
        log.info('PrivilegeHelpers', 'Posix module not installed. Cannot resolve uid/gid');
    }

    return { uid, gid };
}

function getConfigUidGid() {
    return _getConfigUidGid('', process.getuid(), process.getgid());
}

function getConfigROUidGid() {
    let rwIds = getConfigUidGid();
    return _getConfigUidGid('ro', rwIds.uid, rwIds.gid);
}

function ensureMailtrainOwner(file, callback) {
    const ids = getConfigUidGid();
    fs.chown(file, ids.uid, ids.gid, callback);
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
    getConfigUidGid,
    getConfigROUidGid
};
