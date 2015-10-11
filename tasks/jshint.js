var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('jshint', function () {
  return gulp.src(['app/*.js', 'app/@(components|services)/**/*.js', 'vendor/electron_boilerplate/*.js']).
  pipe(jshint()).pipe(jshint.reporter('jshint-stylish')).
  pipe(jshint.reporter('fail'));
});
