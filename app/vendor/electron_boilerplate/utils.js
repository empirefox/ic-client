'use strict';
let fs = require('fs');
let path = require('path');

// http://stackoverflow.com/a/24311711/2778814
function mkdirpSync(dirpath) {
  let parts = dirpath.split(path.sep);
  parts[0] = parts[0] ? parts[0] : '/';
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
function ensureDir(dir) {
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

module.exports = {
  mkdirpSync: mkdirpSync,
  ensureDir: ensureDir,
}
