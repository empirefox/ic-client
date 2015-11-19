var gulp = require('gulp');
var jslint = require('gulp-jslint');

gulp.task('jslint', function () {
  return gulp.src(['app/*.js', 'app/@(components|services)/**/*.js', 'vendor/electron_boilerplate/*.js']).
  pipe(jslint()).pipe(jslint.reporter('jslint-stylish')).
  pipe(jslint.reporter('fail'));
});
