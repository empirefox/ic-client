'use strict';

var path = require('path');
var gulp = require('gulp');
// load all gulp plugins
var $ = require('gulp-load-plugins')({
  lazy: true
});

var jetpack = require('fs-jetpack');

// own modules
var utils = require('./utils');
var config = require('./gulp.config')();
var roomConfig = require('./room.config')();
var apiData = require('./api-data');

var projectDir = jetpack;
var srcDir = projectDir.cwd('./app');
var destDir = projectDir.cwd('./build');

// -------------------------------------
// Tasks
// -------------------------------------

var transpileTask = function () {
  return gulp.src(config.jsCodeToTranspile, {
      base: './app',
    }).
    // pipe($.sourcemaps.init()).
    // pipe($.babel({
    //   optional: ["es7.decorators"]
    // })).
    // pipe($.sourcemaps.write(".")).
  pipe(gulp.dest(destDir.path()));

  // return gulp.src('app/**/*.js')
  //   .pipe(rename({extname: ''})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
  //   .pipe(plumber())
  //   .pipe(traceur({
  //     modules: 'instantiate',
  //     moduleName: true,
  //     annotations: true,
  //     types: true,
  //     memberVariables: true
  //   }))
  //   .pipe(rename({extname: '.js'})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
  //   .pipe(gulp.dest('dist'));
};

gulp.task('clean', function (callback) {
  return destDir.dirAsync('.', {
    empty: true,
  });
});

var copyTask = function () {
  return projectDir.copyAsync('app', destDir.path(), {
    overwrite: true,
    matching: config.copyFromAppDir,
  });
};

gulp.task('copy', ['clean'], copyTask);
gulp.task('copy-watch', copyTask);

gulp.task('transpile', ['clean'], transpileTask);
gulp.task('transpile-watch', transpileTask);

var stylusTask = function () {
  return gulp.src('app/stylus/*.styl').pipe($.stylus({
    'include css': true,
    'paths': ['css', 'jspm_packages'],
  })).pipe(gulp.dest(destDir.path('stylesheets')));
};
gulp.task('stylus', ['clean'], stylusTask);
gulp.task('stylus-watch', stylusTask);

gulp.task('finalize', ['clean'], function () {
  let manifest = srcDir.read('package.json', 'json');

  switch (utils.getEnvName()) {
  case 'devremote':
  case 'development':
    // Add "dev" suffix to name, so Electron will write all
    // data like cookies and localStorage into separate place.
    manifest.name += '-dev';
    manifest.productName += ' Dev';
    break;
  case 'test':
    // Add "test" suffix to name, so Electron will write all
    // data like cookies and localStorage into separate place.
    manifest.name += '-test';
    manifest.productName += ' Test';
    // Change the main entry to spec runner.
    manifest.main = 'spec.js';
    break;
  }
  destDir.write('package.json', manifest);

  let envConfigRaw = projectDir.read('config/env_' + utils.getEnvName() + '.json', 'json');
  let envConfig = Object.assign(apiData(), envConfigRaw);
  envConfig.roomBinName = roomConfig.name;
  switch (utils.getEnvName()) {
  case 'devremote':
    envConfig.roomDb = roomConfig.name + '-devremote.db';
    break;
  case 'development':
    envConfig.roomDb = roomConfig.name + '-dev.db';
    break;
  case 'test':
    envConfig.roomDb = roomConfig.name + '-test.db';
    break;
  case 'production':
    envConfig.roomDb = roomConfig.name + '.db';
  }
  destDir.write('env_config.json', envConfig);
});

gulp.task('watch', function () {
  gulp.watch(config.jsCodeToTranspile, ['transpile-watch']);
  gulp.watch(config.copyFromAppDir, {
    cwd: 'app'
  }, ['copy-watch']);
  gulp.watch('app/**/*.styl', ['stylus-watch']);
});

gulp.task('copyRoom', function () {
  return gulp.src(roomConfig[utils.os()].bin).pipe($.rename({
    basename: roomConfig.name,
  })).pipe(gulp.dest(roomConfig.electron));
});

gulp.task('build', ['transpile', 'stylus', 'copy', 'finalize']);

gulp.task('default', ['build']);
