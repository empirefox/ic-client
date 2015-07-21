'use strict';

var path = require('path');

module.exports = function () {

  var config = {
    osx: {
      bin: '',
      testConf: '',
    },
    linux: {
      bin: '/home/savage/go/src/github.com/empirefox/ic-client-one/main/main',
      testConf: '/home/savage/go/src/github.com/empirefox/ic-client-one/main/config.toml',
    },
    windows: {
      bin: '',
      testConf: '',
    },
    name: 'room',
    initConf: '/home/savage/go/src/github.com/empirefox/ic-client-one/main/config.toml',
    electron: path.join(__dirname, '../node_modules/electron-prebuilt/dist/'),
  };

  return config;
};
