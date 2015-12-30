// Loads config/env_XXX.json file and puts it
// in proper place for given Electron context.

'use strict';

(function () {
  var jsonfile = require('jsonfile');
  if (typeof window === 'object') {
    // Web browser context, __dirname points to folder where app.html file is.
    window.env = jsonfile.readFileSync(__dirname + '/env_config.json');
  } else {
    // Node context
    module.exports = jsonfile.readFileSync(__dirname + '/../../env_config.json');
  }
}());
