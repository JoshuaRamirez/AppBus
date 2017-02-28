module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        'eslint': {
            target: ['src/app-bus.js']
        },
        'babel': {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/app-bus.js': 'src/app-bus.js'
                }
            }
        }
    });

    grunt.registerTask(

        'default',
        [
            'eslint',
            'babel'
        ]

    );

};