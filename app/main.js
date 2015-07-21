'use strict';

var app = require('app');
var ipc = require('ipc');
var exec = require('child_process').exec;
var BrowserWindow = require('browser-window');
var env = require('./vendor/electron_boilerplate/env_config');
var devHelper = require('./vendor/electron_boilerplate/dev_helper');
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');
/*jshint -W079 */
var WebSocket = require('ws');

var mainWindow;
var regRoomUrl;
var connection;

function sendToWindow(channel, msg) {
  if (mainWindow) {
    console.log('sendToWindow:', channel, msg);
    mainWindow.webContents.send(channel, msg);
  }
}

function sendToRoom(msg) {
  if (connection) {
    console.log('sendToRoom', msg);
    connection.send(JSON.stringify(msg));
  }
}

function startRoom() {
  exec('./ic-one');
}
startRoom();

function onRoomStaus(status) {
  switch (status) {
  case 'unreachable':
    sendToWindow('room-status', 'no-connection');
    break;
  case 'not_authed':
    sendToWindow('room-status', 'auth-err');
    break;
  case 'auth_failed':
    sendToWindow('room-status', 'auth-err');
    break;
  case 'not_ready':
    sendToWindow('room-status', 'not-running');
    break;
  case 'ready':
    sendToWindow('room-status', 'running');
    break;
  default:
    console.log(status);
  }
}

try {
  connection = new WebSocket('ws://127.0.0.1:12301/register', {
    origin: 'http://127.0.0.1:9999',
  });
  connection.binaryType = 'arraybuffer';
  connection.onopen = function () {
    console.log('onopen');
    sendToRoom({
      type: 'GetRegRoomUrl',
    });
  };
  connection.onclose = function () {
    console.log('onclose');
    sendToWindow('room-status', 'not-running');
  };
  connection.onerror = function (error) {
    console.log(error);
  };
  connection.onmessage = function (e) {
    console.log('onemessage:', e.data);
    let statusObj = JSON.parse(e.data);
    switch (statusObj.type) {
    case 'Status':
      onRoomStaus(statusObj.content);
      break;
    case 'RegRoomUrl':
      regRoomUrl = statusObj.content;
      sendToWindow('reg-room-url-change', regRoomUrl);
      break;
    default:
      console.log('unknow message', statusObj);
    }
  };
} catch (e) {
  console.log(e);
}

// used by authErr to save addr
ipc.on('reg-room-ok', function (event, addr) {
  console.log('reg-room with addr:', addr);
  sendToRoom({
    type: 'SetSecretAddress',
    content: addr,
  });
});
// used by authErr sync return value
ipc.on('get-reg-room-url', function (event) {
  event.returnValue = regRoomUrl;
});

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
  width: 640,
  height: 360
});

app.on('ready', function () {

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

  mainWindow.on('close', function () {
    mainWindowState.saveState(mainWindow);
  });
});

app.on('window-all-closed', function () {
  app.quit();
});
