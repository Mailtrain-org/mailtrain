'use strict';

function mergeTagValid(mergeTag) {
    return /^[A-Z][A-Z0-9_]*$/.test(mergeTag);
}

module.exports = {
    mergeTagValid
};