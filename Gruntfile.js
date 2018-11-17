'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        eslint: {
            all: ['lib/**/*.js', 'test/**/*.js', 'config/**/*.js', 'services/**/*.js', 'Gruntfile.js', 'app.js', 'index.js', 'routes/editorapi.js']
        }
    });

    // Load the plugin(s)
    grunt.loadNpmTasks('grunt-eslint');
    grunt.task.loadTasks('tasks');

    // Tasks
    grunt.registerTask('default', ['eslint']);
};
