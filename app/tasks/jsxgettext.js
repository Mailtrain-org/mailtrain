/*
Original from https://raw.githubusercontent.com/Mindflash/grunt-jsxgettext/master/lib/index.js
License: ISC
*/

/* eslint-disable */

'use strict';
let _ = require('lodash');
let path = require('path');
let util = require('util');
let jsxgettext = require('jsxgettext-andris');
let fs = require('fs');
let async = require('async');

/*
 options: {
 files: ['file-path','file-path'],
 + jsxgettext options
 }
 */
let task = function (grunt, options, cb) {
    var generators = {
        '.ejs': jsxgettext.generateFromEJS,
        '.hbs': jsxgettext.generateFromHandlebars,
        '.jade': jsxgettext.generateFromJade,
        '.swig': jsxgettext.generateFromSwig
    };

    // dynamically update generators mapping
    if (options.generators) {
        if (!Array.isArray(options.generators)) {
            options.generators = [options.generators];
        }

        options.generators.forEach(elem => {
            // elem.generator can be either a string or a generator method (i.e. own generator or import from jsxgettext)
            if (typeof elem.generator === 'string' || elem.generator instanceof String) {
                // elem.generator can be an extension, which is used to remap predefined generators to different extensions
                // or elem.generator is the name of an generator method implemented in jsxgettext
                if (elem.generator.match(/^\..*/)) {
                    generators[elem.ext] = generators[elem.generator];
                } else {
                    generators[elem.ext] = jsxgettext[elem.generator];
                }
            } else {
                generators[elem.ext] = elem.generator;
            }
        });
    }

    var files = {};
    var dest = options.dest;

    if (!fs.existsSync(path.dirname(dest)))
        return cb(util.format("Destination directory %s does not exist.", dest));

    options.files.filter(file => grunt.file.exists(file)).forEach(file => {
        var ext = path.extname(file);
        var content = grunt.file.read(file, {
            encoding: 'utf-8'
        });

        // pre-process non js files for use by jsxgettext.generate
        if (ext !== '.js') {
            var args = {};
            args[file] = content;
            files = _.assign(files, generators[ext](args, options).shift());
            return;
        }

        files[file] = content;
    });

    if (_.isEmpty(files))
        return cb("No valid input files found, received: " + util.inspect(options.files, {
            depth: null
        }));

    cb(null, jsxgettext.generate(files, options));
};

function unary(fn) {
    if (fn.length === 1) return fn;
    return function (args) {
        return fn.call(this, args);
    };
}

module.exports = function (grunt) {
    grunt.registerMultiTask('jsxgettext', 'A Grunt task to run jsxgettext against files to extract strings into a POT file.', function () {
        var self = this;
        var done = self.async();

        async.forEach(self.files, function (fileSet, eCb) {
            var dest;
            if (typeof fileSet.dest !== 'undefined' && fileSet.dest) {
                dest = fileSet.dest;
            } else {
                dest = path.join(fileSet['output-dir'] || '', fileSet.output);
            }

            var options = _.defaults(self.options(), {
                files: fileSet.src,
                dest: dest,
                'output-dir': fileSet['output-dir'],
                output: fileSet['output']
            });
            task(grunt, options, function (err, res) {

                if (err) return eCb(err);

                grunt.file.write(dest, res);
                eCb();
            });
        }, err => {
            if (err) grunt.fatal(err);
            done();
        });

    });
};
