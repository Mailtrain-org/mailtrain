'use strict';

// Set module title
module.exports.title = 'Mailtrain integration (receiver)';

// Initialize the module
module.exports.init = (app, done) => {

    app.addHook('message:headers', (envelope, messageInfo, next) => {
        const headers = envelope.headers;

        if (!envelope.dkim.keys) {
            envelope.dkim.keys = [];
        }

        const dkimHeaderValue = require('libmime').decodeWords(headers.getFirst('x-mailtrain-dkim'));

        if (dkimHeaderValue) {
            const dkimKey = JSON.parse(dkimHeaderValue);

            envelope.dkim.keys.push(dkimKey);

            headers.remove('x-mailtrain-dkim');
        }

        return next();
    });

    app.addHook('smtp:auth', (auth, session, next) => {
        if (auth.username === app.config.username && auth.password === app.config.password) {
            next();
        } else {
            // do not provide any details about the failure
            const err = new Error('Authentication failed');
            err.responseCode = 535;
            return next(err);
        }
    });

    // all set up regarding this plugin
    done();
};
