/*
 *  WeCanPlay : Library for html5 games
 *  http://www.wecanplay.fr/
 *
 * Grunt file
 */

module.exports = function (grunt) {
    "use strict";
    
    // Project configuration.
    var config = {
        pkg: {
            name: "WeCanPlay",
            version: "1.0",
            buildsDir: "builds",
            examplesDir: "examples",
            
            files : [ // in dependency order!
                "src/WCP.js",
                "src/tools.js",
                "src/vector.js",
                "src/time.js",
                "src/events.js",
                "src/view.js",
                "src/sprite.js",
                "src/draw.js",
                "src/animation.js",
                "src/asset.js",
                "src/audio.js",
                "src/text.js",
                "src/filter.js",
                "src/matrix.js"
            ]
        },
        
        meta: {
            banner: grunt.file.read('src/banner.txt')
        },
        
        lint: {
            all: ["src/*.js"]
        },
        qunit: {
            files: ['test_unit/**/*.html']
        },
        min: {
            dist: {
                src: ["<banner>", "<%= pkg.buildsDir %>/WCP-<%= pkg.version %>.js"],
                dest: "<%= pkg.buildsDir %>/WCP-<%= pkg.version %>-min.js"
            }
        },
        
        /**
         * External tools config
         */
        jshint: {},
        uglify: {},
    };
    
    // Load and process .jshintrc file to get project jsHint options
    var jshintFile = "src/.jshintrc";
    
    try {
        var jshintOptions = grunt.file.read(jshintFile).replace(/\/\/(.*)/g, "\n");
        config.jshint.options = JSON.parse(jshintOptions);
    } catch (e) {
        grunt.log.error("jsHint: impossible to parse the file '" + jshintFile + "' : " + e);
    }
    
    // helpers
    
    grunt.registerHelper('concat', function(files, options) {
        options = grunt.utils._.defaults(options || {}, {
            separator: grunt.utils.linefeed
        });
        return files ? files.map(function(filepath) {
            return grunt.task.directive("<file_strip_banner:"+filepath+">", grunt.file.read);
        }).join(grunt.utils.normalizelf(options.separator)) : '';
    });
    
    grunt.initConfig(config);
    
    /**
     * Tasks 
     */
    grunt.registerTask("default", "lint");
    
    grunt.registerTask("norm", "lint");
    grunt.registerTask("merge", "concat");
    grunt.registerTask("test", "qunit");
    grunt.registerTask("build", "concat min examples");
    
    grunt.registerTask("examples", "Copy the current build files to the examples/ directory", function () {
        function doCopy(src, dst) {
            src = grunt.template.process(src);
            dst = grunt.template.process(dst);
            
            grunt.file.copy(src, dst);
            grunt.log.writeln("   " + src + " -> " + dst);
        }
        
        doCopy("<%= pkg.buildsDir %>/WCP-<%= pkg.version %>.js", "<%= pkg.examplesDir %>/build-WCP.js");
        doCopy("<%= min.dist.dest %>", "<%= pkg.examplesDir %>/build-WCP-min.js");
    });
    
    grunt.registerTask('concat', 'Concatenate files.', function() {
        // Concat specified files.
        var src = grunt.helper('concat', config.pkg.files);
        grunt.file.write(config.pkg.buildsDir+"/WCP-"+config.pkg.version+".js", grunt.task.directive("<banner>")+src);
        // Fail task if errors were logged.
        if (this.errorCount) { return false; }
        // Otherwise, print a success message.
        grunt.log.writeln('File "' + config.pkg.buildsDir+"/WCP-"+config.pkg.version+".js" + '" created.');
    });
};
