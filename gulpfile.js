'use strict';

var _ = require('lodash');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var packageJson = require('./package.json');
var packager = require('electron-packager');

gulp.task('html', function() {
   return gulp.src('src/**/*.html')
      .pipe(gulp.dest('build'));
});

gulp.task('sass', function() {
    return gulp.src('src/scss/*.scss')
      .pipe($.sass({ style: 'expanded' }).on('error', $.sass.logError))
      .pipe(gulp.dest('build/css'));
});

gulp.task('packageJson', function() {
   var fs = require('fs');
   var copied = _.cloneDeep(packageJson);
   copied.main = 'main.js';
   fs.writeFile('./build/package.json', JSON.stringify(copied));
});

gulp.task('scripts', function() {
   return gulp.src('src/**/*.{js,jsx}')
      .pipe($.babel({
         stage: 0
      }))
      .on('error', handleError)
      .pipe(gulp.dest('build'));
});

gulp.task('lint', function() {
   var eslint = require('gulp-eslint');
   return gulp.src('src/renderer/**/*.{js,jsx}')
      .pipe(eslint({useEslintrc: true}))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
});

gulp.task('watch', function() {
   gulp.watch('src/**/*.{js,jsx}', ['scripts']);
   gulp.watch('src/**/*.scss', ['sass']);
   gulp.watch('src/**/*.html', ['html']);
});

gulp.task('build', ['packageJson', 'html', 'sass', 'scripts']);

function handleError(err) {
   console.log(err.toString());
   this.emit('end');
}

gulp.task('package', ['linux', 'win32', 'darwin'].map(function(platform) {
   var taskName = 'package:' + platform;
   console.log(platform);
   gulp.task(taskName, ['build'], function(done) {
      packager({
         dir: './build',
         name: 'pyon2-labeler',
         arch: 'x64',
         platform: platform,
         out: './release/' + platform,
         version: '0.30.1',
         overwrite: true
      }, function (err) {
         done();
      });
   });
   return taskName;
}));

