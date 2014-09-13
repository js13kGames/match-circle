module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    "concat": {
      'temp/lib.all.js': ['lib/*.js'],
      'temp/game.all.js': ['js/entity.js', 'js/game.js']
    },
    "uglify": {
      options: {
        preserveComments:'some',
        compress: {
          global_defs: {
            "DEBUG": false
          }
        },
        mangle: {
          except: []
        }
      },
      my_target: {
        files: {
          'temp/lib.min.js': ['temp/lib.all.js'],
          'temp/game.min.js': ['temp/game.all.js'],
        }
      }
    },
    "copy": {
      main: {
        files: [
          {expand: true, src: ['index.html'], dest: 'build/'},
          {expand: true, cwd: 'temp/', src: ['*.min.js'], dest: 'build/js'},
        ]
      }
    },
    "clean": {
      build: ["temp"]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-closure-compiler');

  grunt.registerTask('default', ['concat', 'uglify', 'copy', 'clean']);
};