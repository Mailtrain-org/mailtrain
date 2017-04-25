'use strict';

const log = require('npmlog');
const config = require('config');
const path = require('path');

const promise = require('bluebird');
const fsExtra = promise.promisifyAll(require('fs-extra'));
const fs = promise.promisifyAll(require('fs'));
const walk = require('walk');

const tryRequire = require('try-require');
const posix = tryRequire('posix');


function ensureMailtrainOwner(file, callback) {
    try {
        const uid = config.user ? posix.getpwnam(config.user).uid : 0;
        const gid = config.group ? posix.getgrnam(config.group).gid : 0;

        fs.chown(file, uid, gid, callback);

    } catch (err) {
        return callback(err);
    }
}

function ensureMailtrainOwnerRecursive(dir, callback) {
    try {
        const uid = config.user ? posix.getpwnam(config.user).uid : 0;
        const gid = config.group ? posix.getgrnam(config.group).gid : 0;

        fs.chown(dir, uid, gid, err => {
            if (err) {
                return callback(err);
            }

            walk.walk(dir)
                .on('node', (root, stat, next) => {
                    fs.chown(path.join(root, stat.name), uid, gid, next);
                })
                .on('end', callback);
        });
    } catch (err) {
        return callback(err);
    }
}

const ensureMailtrainOwnerRecursiveAsync = promise.promisify(ensureMailtrainOwnerRecursive);

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

function setupChrootDir(newRoot, callback) {
    try {
        fsExtra.emptyDirAsync(newRoot)
            .then(() => fsExtra.ensureDirAsync(path.join(newRoot, 'etc')))
            .then(() => fsExtra.copyAsync('/etc/hosts', path.join(newRoot, 'etc', 'hosts')))
            .then(() => ensureMailtrainOwnerRecursiveAsync(newRoot))
            .then(() => {
                log.info('PrivilegeHelpers', 'Chroot directory "%s" set up', newRoot);
                callback();
            })
            .catch(err => {
                log.info('PrivilegeHelpers', 'Failed to setup chroot directory "%s"', newRoot);
                callback(err);
            });

    } catch(err) {
        log.info('PrivilegeHelpers', 'Failed to setup chroot directory "%s"', newRoot);
    }
}

function tearDownChrootDir(root, callback) {
    if (posix) {
        fsExtra.removeAsync(path.join('/', 'etc'))
            .then(() => {
                log.info('PrivilegeHelpers', 'Chroot directory "%s" torn down', root);
                callback();
            })
            .catch(err => {
                log.info('PrivilegeHelpers', 'Failed to tear down chroot directory "%s"', root);
                callback(err);
            });
    }
}

function chrootAndDropRootPrivileges(newRoot) {

    try {
        const uid = config.user ? posix.getpwnam(config.user).uid : 0;
        const gid = config.group ? posix.getgrnam(config.group).gid : 0;

        posix.chroot(newRoot);
        process.chdir('/');

        process.setgid(gid);
        process.setuid(uid);

        log.info('PrivilegeHelpers', 'Changed root to "%s" and privileges to %s.%s', newRoot, uid, gid);
    } catch(err) {
        log.info('PrivilegeHelpers', 'Failed to change root to "%s" and set privileges', newRoot);
    }

}

module.exports = {
    dropRootPrivileges,
    chrootAndDropRootPrivileges,
    setupChrootDir,
    tearDownChrootDir,
    ensureMailtrainOwner,
    ensureMailtrainOwnerRecursive
};
