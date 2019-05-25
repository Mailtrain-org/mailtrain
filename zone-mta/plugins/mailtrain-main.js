'use strict';

// Set module title
module.exports.title = 'Mailtrain integration (main)';

// Initialize the module
module.exports.init = (app, done) => {

    process.send({
        type: 'zone-mta-started'
    });

    process.on('message', msg => {
        if (msg === 'exit') {
            process.exit();        }
    });

    done();
};
