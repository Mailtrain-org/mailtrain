'use strict';

let nodemailer = require('nodemailer');

// This is a dummy test to ensure that nodeunit would not fail on 0 assertions
module.exports['Load nodemailer'] = function (test) {
    let transport = nodemailer.createTransport({
        streamTransport: true
    });
    test.ok(transport);
    test.done();
};
