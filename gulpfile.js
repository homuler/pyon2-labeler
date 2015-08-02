var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('copy', function() {
   return gulp.src('src/**/*.{html,png}')
      .pipe(gulp.dest('build'));
});

gulp.task('scripts', ['copy'], function() {
   return gulp.src('src/**/*.{js,jsx}')
      .pipe($.sourcemaps.init())
      .pipe($.babel({
         stage: 0
      }))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('build'));
});

gulp.task('lint', function() {
   var eslint = require('gulp-eslint');
   return gulp.src('src/js/**/*.{js, jsx}')
      .pipe(eslint({useEslintrc: true}))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
});

gulp.task('watch', function() {
   gulp.watch('src/**/*.*', ['scripts']);
});

function handleError(err) {
   console.log(err.toString());
   this.emit('end');
}
