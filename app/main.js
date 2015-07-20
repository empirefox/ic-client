'use strict';

var app = require('app');
var ipc = require('ipc');
var BrowserWindow = require('browser-window');
var env = require('./vendor/electron_boilerplate/env_config');
var devHelper = require('./vendor/electron_boilerplate/dev_helper');
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');

var mainWindow;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
  width: 480,
  height: 270
});

ipc.on('reg-room', (event, addr) => {
  console.log('reg-room with addr:', addr);
});
ipc.on('asynchronous-message', (event, arg) => {
  console.log(arg);
});

app.on('ready', () => {

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height
  });

  if (mainWindowState.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.loadUrl('file://' + __dirname + '/app.html');

  if (env.name === 'development') {
    devHelper.setDevMenu();
    mainWindow.openDevTools();
  }

  mainWindow.on('close', () => mainWindowState.saveState(mainWindow));
});

app.on('window-all-closed', () => app.quit());
