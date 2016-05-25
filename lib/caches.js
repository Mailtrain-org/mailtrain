'use strict';

let cache = module.exports.cache = new Map();

module.exports.push = (name, value) => {
    if (!cache.has(name)) {
        cache.set(name, []);
    } else if (!Array.isArray(cache.get(name))) {
        cache.set(name, [].concat(cache.get(name) || []));
    }
    cache.get(name).push(value);
};

module.exports.shift = name => {
    if (!cache.has(name)) {
        return false;
    }
    if (!Array.isArray(cache.get(name))) {
        let value = cache.get(name);
        cache.delete(name);
        return value;
    }
    let value = cache.get(name).shift();
    if (!cache.get(name).length) {
        cache.delete(name);
    }
    return value;
};
