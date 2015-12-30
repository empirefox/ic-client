'use strict';

var app = require('app');
var Menu = require('menu');
var BrowserWindow = require('browser-window');

var statusArray = ['connecting', 'logging_in', 'regging', 'unregging_room',
  'unreachable', 'disconnected', 'bad_server_msg',
  'bad_room_token', 'reg_error', 'save_room_token_error', 'bad_reg_token', 'save_reg_token_error',
  'ready', 'ws_opened', 'not_running'
].map(function (s) {
  return {
    label: s,
    click: function () {
      BrowserWindow.getFocusedWindow().webContents.send('room-status', s);
    }
  };
});

module.exports.setDevMenu = function () {
  var devMenu = Menu.buildFromTemplate([{
    label: 'Development',
    submenu: [{
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: function () {
        BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
      }
    }, {
      label: 'Toggle DevTools',
      accelerator: 'Alt+CmdOrCtrl+I',
      click: function () {
        BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
      }
    }, {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: function () {
        app.quit();
      }
    }, {
      label: 'Send regable',
      click: function () {
        BrowserWindow.getFocusedWindow().webContents.send('regable');
      }
    }],
  }, {
    label: 'SendStatus',
    submenu: statusArray,
  }]);
  Menu.setApplicationMenu(devMenu);
};
