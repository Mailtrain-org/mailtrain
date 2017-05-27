'use strict';

const util = require('util');

const _ = require('../lib/translate')._;

module.exports.registerHelpers = handlebars => {
    // {{#translate}}abc{{/translate}}
    handlebars.registerHelper('translate', function (context, options) { // eslint-disable-line prefer-arrow-callback
        if (typeof options === 'undefined' && context) {
            options = context;
            context = false;
        }

        let result = _(options.fn(this)); // eslint-disable-line no-invalid-this

        if (Array.isArray(context)) {
            result = util.format(result, ...context);
        }
        return new handlebars.SafeString(result);
    });


    /* Credits to http://chrismontrois.net/2016/01/30/handlebars-switch/

     {{#switch letter}}
     {{#case "a"}}
     A is for alpaca
     {{/case}}
     {{#case "b"}}
     B is for bluebird
     {{/case}}
     {{/switch}}
     */
    /* eslint no-invalid-this: "off" */
    handlebars.registerHelper('switch', function(value, options) {
        this._switch_value_ = value;
        const html = options.fn(this); // Process the body of the switch block
        delete this._switch_value_;
        return html;
    });

    handlebars.registerHelper('case', function(value, options) {
        if (value === this._switch_value_) {
            return options.fn(this);
        }
    });

};
