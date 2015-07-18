/**
 * Created by Yail Anderson on 24/06/2015.
 */

module.exports = function() {

  var config = {

    jsCodeToTranspile: [
      'app/**/*.es6.js',
    ],

    toCopy: [
      'app/*.js',
      'app/node_modules/**',
      'app/jspm_packages/**',
      'app/bower_components/**',
      'app/vendor/**',
      'app/**/*.html'
    ],
  };

  return config;
};
