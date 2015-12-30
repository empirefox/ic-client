'use strict';
let fs = require('fs');
let path = require('path');

// http://stackoverflow.com/a/24311711/2778814
module.exports.mkdirpSync = function (dirpath) {
  var parts = dirpath.split(path.sep);
  for (var i = 1; i <= parts.length; i++) {
    try {
      fs.mkdirSync(path.join.apply(null, parts.slice(0, i)));
    } catch (error) {
      if (error.code != 'EEXIST') {
        throw error;
      }
    }
  }
};

// absolute path
module.exports.ensureDir = function (dir) {
  return new Promise((resolve, reject) => {
    fs.stat(dir, (err, stat) => {
      if (err || !stat || !stat.isDirectory()) {
        try {
          mkdirpSync(dir);
          resolve();
        } catch (e) {
          reject(e);
        }
        return;
      }
      resolve();
    });
  });
};
