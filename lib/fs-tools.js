'use strict';

module.exports = {
    nameToFileName,
};

function nameToFileName(name) {
    return name.
    trim().
    toLowerCase().
    replace(/[ .+/]/g, '-').
    replace(/[^a-z0-9\-_]/gi, '').
    replace(/--*/g, '-');
}
