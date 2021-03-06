'use strict';

var path = require('path');

module.exports = function () {

  var config = {
    osx: {
      bin: '',
    },
    linux: {
      // generally link a dir here
      bin: path.join(__dirname, '../dev/linux/room-bin/main'),
    },
    windows: {
      bin: '',
    },

    name: 'room',
    electron: path.join(__dirname, '../node_modules/electron-prebuilt/dist/'),
  };

  return config;
};
