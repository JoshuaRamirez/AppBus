module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-babel');

    grunt.initConfig({
        "babel": {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "dist/app-bus.js": "AppBus.js"
                }
            }
        }
    });

    grunt.registerTask("default", ["babel"]);

};