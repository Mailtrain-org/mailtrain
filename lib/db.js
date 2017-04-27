'use strict';

let config = require('config');
let mysql = require('mysql');
let redis = require('redis');
let Lock = require('redfour');

module.exports = mysql.createPool(config.mysql);
if (config.redis && config.redis.enabled) {

    module.exports.redis = redis.createClient(config.redis);

    let queueLock = new Lock({
        redis: config.redis,
        namespace: 'mailtrain:lock'
    });

    module.exports.getLock = (id, callback) => {
        queueLock.waitAcquireLock(id, 60 * 1000 /* Lock expires after 60sec */ , 10 * 1000 /* Wait for lock for up to 10sec */ , (err, lock) => {
            if (err) {
                return callback(err);
            }
            if (!lock) {
                return callback(null, false);
            }
            return callback(null, {
                lock,
                release(done) {
                    queueLock.releaseLock(lock, done);
                }
            });
        });
    };

    module.exports.clearCache = (key, callback) => {
        module.exports.redis.del(key, err => callback(err));
    };

    module.exports.addToCache = (key, value, callback) => {
        if (!value) {
            return setImmediate(() => callback());
        }
        module.exports.redis.multi().
        lpush('mailtrain:cache:' + key, JSON.stringify(value)).
        expire('mailtrain:cache:' + key, 24 * 3600).
        exec(err => callback(err));
    };

    module.exports.getFromCache = (key, callback) => {
        module.exports.redis.rpop('mailtrain:cache:' + key, (err, value) => {
            if (err) {
                return callback(err);
            }
            try {
                value = JSON.parse(value);
            } catch (E) {
                return callback(E);
            }

            return callback(null, value);
        });
    };

} else {
    // fakelock. does not lock anything
    module.exports.getLock = (id, callback) => {
        setImmediate(() => callback(null, {
            lock: false,
            release(done) {
                setImmediate(done);
            }
        }));
    };

    let caches = new Map();

    module.exports.clearCache = (key, callback) => {
        caches.delete(key);
        setImmediate(() => callback());
    };

    module.exports.addToCache = (key, value, callback) => {
        if (!caches.has(key)) {
            caches.set(key, []);
        }
        caches.get(key).push(value);
        setImmediate(() => callback());
    };

    module.exports.getFromCache = (key, callback) => {
        let value;
        if (caches.has(key)) {
            value = caches.get(key).shift();
            if (!caches.get(key).length) {
                caches.delete(key);
            }
        }
        setImmediate(() => callback(null, value));
    };
}
