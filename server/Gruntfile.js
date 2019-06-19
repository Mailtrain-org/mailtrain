'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        eslint: {
            all: [
                'lib/**/*.js',
                'models/**/*.js',
                'routes/**/*.js',
                'services/**/*.js',
                'lib/**/*.js',
                'test/**/*.js',
                'app-builder.js',
                'index.js',
                'Gruntfile.js',
                ]
        }
    });

    // Load the plugin(s)
    grunt.loadNpmTasks('grunt-eslint');
    grunt.task.loadTasks('tasks');

    // Tasks
    grunt.registerTask('default', ['eslint']);
};
