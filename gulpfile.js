var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('html', function() {
   return gulp.src('src/**/*.html')
      .pipe(gulp.dest('build'));
});

gulp.task('sass', function() {
   return $.rubySass('src/scss/', { style: 'expanded' })
      .pipe(gulp.dest('build/css'));
});

gulp.task('resources', function() {
   return gulp.src('src/**/*.{png}')
      .pipe(gulp.dest('build'));
});

gulp.task('scripts', function() {
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
   gulp.watch('src/**/*.{js,jsx}', ['scripts']);
   gulp.watch('src/**/*.scss', ['sass']);
   gulp.watch('src/**/*.html', ['html']);
});

gulp.task('build', ['html', 'sass', 'scripts'], function() {

});

function handleError(err) {
   console.log(err.toString());
   this.emit('end');
}
