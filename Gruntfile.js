'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        eslint: {
            all: ['lib/**/*.js', 'test/**/*.js', 'config/**/*.js', 'services/**/*.js', 'Gruntfile.js', 'app.js', 'index.js', 'routes/editorapi.js']
        },

        nodeunit: {
            all: ['test/nodeunit/**/*-test.js']
        },

        jsxgettext: {
            test: {
                files: [{
                    src: ['views/**/*.hbs', 'lib/**/*.js', 'routes/**/*.js', 'services/**/*.js', 'app.js', 'index.js', '!ignored'],
                    output: 'mailtrain.pot',
                    'output-dir': './languages/'
                }],
                options: {
                    keyword: ['translate', '_']
                }
            }
        }
    });

    // Load the plugin(s)
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.task.loadTasks('tasks');

    // Tasks
    grunt.registerTask('default', ['eslint', 'nodeunit', 'jsxgettext']);
};
