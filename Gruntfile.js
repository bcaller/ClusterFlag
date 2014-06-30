module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        // Wipe out previous builds and test reporting.
        clean: ["dist/", "test/reports"],

        // Run your source code through JSHint's defaults.
        jshint: {
            options: {
                asi: true,
                laxbreak: true,
                expr: true
            },
            src: ["src/*.js"]
        },

        uglify: {
            options: {
                sourceMap: true,
                wrap: 'ClusterFlag',
                compress: {
                    drop_console: true
                },
                banner: '//Copyright 2014 Benjamin Caller'
            },
            ordered: {
                files: {
                    'dist/source.min.js': ['NULL']
                }
            }
        },

        useminPrepare: {
            options: {
                dest: 'dist'
            },
            html: ['SpecRunner.html']
        }
    });

    // Grunt contribution tasks.
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //Third-party
    grunt.loadNpmTasks('grunt-usemin');

    grunt.registerTask("default", [
        "clean",
        "jshint",
        "orderedUgly"
    ]);

    grunt.registerTask("usemin2ugly", function () {
        var ugly = grunt.config.get("uglify")
        var uglyfiles = ugly.ordered.files
        delete ugly.generated
        var destfile = Object.keys(uglyfiles)[0]
        uglyfiles[destfile] = grunt.config.get("concat").generated.files[0].src
        grunt.config.set("uglify", ugly)
        console.log("hello", grunt.config.get("uglify"))
    })

    grunt.registerTask("orderedUgly", [
        "useminPrepare",
        "usemin2ugly",
        "uglify"
    ]);

};
