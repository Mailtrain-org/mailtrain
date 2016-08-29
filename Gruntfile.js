'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        eslint: {
            all: ['lib/**/*.js', 'test/**/*.js', 'config/**/*.js', 'Gruntfile.js', 'app.js', 'index.js']
        },

        nodeunit: {
            all: ['test/**/*-test.js']
        }
    });

    // Load the plugin(s)
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Tasks
    grunt.registerTask('default', ['eslint', 'nodeunit']);
};
