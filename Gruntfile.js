

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
  	pkg: grunt.file.readJSON('package.json'),
  	ngAnnotate: {
        options: {
            singleQuotes: true,
        },
        calendar: {
            files: {
                'build/moonbook.annotated.js': ['src/moonbook.js'],
                'build/templates.annotated.js': ['build/templates.js']
            },
        },
    },
  	ngtemplates:  {
  		"moonbook.calendar":        {
  			src:      'src/*.html',
  			dest:     'build/templates.js',
  		}
  	},
  	concat: {
  		options: {
  			separator: ';',
  		},
  		dist: {
  			src: ['build/moonbook.annotated.js', 'build/templates.annotated.js'],
  			dest: 'dist/moonbook.js',
  		},
  	},
  	cssmin: {
  		target: {
  			files: {
  				'dist/moonbook.min.css': ['src/moonbook.css']
  			}
  		}
  	},
  	uglify: {
  		target: {
  			files: {
  				'dist/moonbook.min.js': ['dist/moonbook.js']
  			}
  		}
  	},
  	clean: ["build"]
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-clean');
  // Default task(s).
  grunt.registerTask('default', ['ngtemplates', 'ngAnnotate', 'concat', 'uglify', 'cssmin', 'clean']);

};