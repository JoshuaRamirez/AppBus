module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        'eslint': {
            target: [
                'src/*.js',
                'test/*.js'
            ]
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
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                },
                src: ['test/**/*.js']
            }
        }
    });

    grunt.registerTask(

        'default',
        [
            'eslint',
            'babel',
            'mochaTest'
        ]

    );

};