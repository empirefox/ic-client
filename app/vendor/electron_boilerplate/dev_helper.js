'use strict';

var app = require('app');
var Menu = require('menu');
var BrowserWindow = require('browser-window');

module.exports.setDevMenu = function () {
    var devMenu = Menu.buildFromTemplate([{
        label: 'Development',
        submenu: [{
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: function () {
                BrowserWindow.getFocusedWindow().reloadIgnoringCache();
            }
        },{
            label: 'Toggle DevTools',
            accelerator: 'Alt+CmdOrCtrl+I',
            click: function () {
                BrowserWindow.getFocusedWindow().toggleDevTools();
            }
        },{
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: function () {
                app.quit();
            }
        },{
            label: 'Send not-running',
            accelerator: 'CmdOrCtrl+1',
            click: function () {
              BrowserWindow.getFocusedWindow().webContents.send('room-status', 'not-running');
            }
        },{
            label: 'Send no-connection',
            accelerator: 'CmdOrCtrl+2',
            click: function () {
              BrowserWindow.getFocusedWindow().webContents.send('room-status', 'no-connection');
            }
        },{
            label: 'Send auth-err',
            accelerator: 'CmdOrCtrl+3',
            click: function () {
              BrowserWindow.getFocusedWindow().webContents.send('room-status', 'auth-err');
            }
        },{
            label: 'Send running',
            accelerator: 'CmdOrCtrl+4',
            click: function () {
              BrowserWindow.getFocusedWindow().webContents.send('room-status', 'running');
            }
        }]
    }]);
    Menu.setApplicationMenu(devMenu);
};
