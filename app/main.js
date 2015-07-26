'use strict';

var kill = require('tree-kill');
var path = require('path');
var app = require('app');
var ipc = require('ipc');
var exec = require('child_process').exec;
var BrowserWindow = require('browser-window');
var env = require('./vendor/electron_boilerplate/env_config');
var devHelper = require('./vendor/electron_boilerplate/dev_helper');
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');

require('crash-reporter').start();

// TODO insecure adapt
global.WebSocket = require('ws');
global.window = {};
var ws = require('rc-socket.js');

var mainWindow;
var conn;
var roomInfo;
var isFinish;
var reconnectTimes = 0;
var reconnectTimeoutObj;

app.commandLine.appendSwitch ('ignore-certificate-errors', 'true');

function sendToWindow(channel, msg) {
  if (mainWindow) {
    console.log('sendToWindow:', channel, msg);
    mainWindow.webContents.send(channel, msg);
  }
}

function sendToRoom(msg) {
  if (conn) {
    console.log('sendToRoom', msg);
    try {
      conn.send(JSON.stringify(msg));
    } catch (e) {
      console.log('sendToRoom err:', e);
    }
  }
}

function quit(type) {
  isFinish = true;
  app.quit();
  if (type === 'Exit' && roomInfo && roomInfo.pid) {
    kill(roomInfo.pid, 'SIGTERM');
  }
  sendToRoom({
    type: type,
  });
  setTimeout(function () {
    if (conn) {
      conn.close();
    }
    process.exit();
  }, 500);
}

function startRoom() {
  var roomArgs = env.roomDb ? `-cpath="${env.roomDb}"` : '';
  var dir = path.join(app.getPath('exe'), '..');
  console.log(`exec: ${dir}/{env.roomBinName} ${roomArgs}`);
  exec(`${dir}/{env.roomBinName} ${roomArgs}`);
}
startRoom();

function onRoomStaus(status) {
  switch (status) {
  case 'unreachable':
    sendToWindow('room-status', 'no-connection');
    break;
  case 'authing':
    sendToWindow('room-status', 'authing');
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
  case 'removing':
    sendToWindow('room-status', 'removing');
    break;
  default:
    console.log(status);
  }
}

try {
  // TODO insecure adpated protocols => ws options
  conn = new ws('ws://127.0.0.1:12301/register', {
    origin: 'http://127.0.0.1:12301',
  });
  conn.binaryType = 'arraybuffer';
  conn.onopen = function () {
    console.log('onopen');
    reconnectTimes = 0;
    sendToWindow('room-status', 'ws-opened');
    sendToRoom({
      type: 'GetRoomInfo',
    });
  };
  conn.onclose = function () {
    console.log('onclose');
    sendToWindow('room-status', 'not-running');
  };
  conn.onerror = function (error) {
    console.log('onerror:', error);
    if (!isFinish) {
      clearTimeout(reconnectTimeoutObj);
      reconnectTimeoutObj = setTimeout(function () {
        if (reconnectTimes++ > 6) {
          startRoom();
        }
        conn.connect();
      }, 5e3);
    }
  };
  conn.onmessage = function (e) {
    console.log('onemessage:', e.data);
    let statusObj = JSON.parse(e.data);
    switch (statusObj.type) {
    case 'Status':
      onRoomStaus(statusObj.content);
      break;
    case 'RoomInfo':
      roomInfo = statusObj.content;
      console.log(roomInfo);
      break;
    default:
      console.log('unknow message', statusObj);
    }
  };
} catch (e) {
  console.log('catch:', e);
}

// used by authErr to save addr
ipc.on('reg-room-ok', function (event, addr) {
  sendToRoom({
    type: 'SetSecretAddress',
    content: addr,
  });
});
// used by notRunning
ipc.on('start-room', function () {
  startRoom();
});
// used by running
ipc.on('remove-room', function () {
  sendToRoom({
    type: 'RemoveRoom',
  });
});
// used by wsOpened
ipc.on('get-status', function () {
  sendToRoom({
    type: 'GetStatus',
  });
});
// used by navbar
ipc.on('term', function () {
  quit('Exit');
});
// used by navbar
ipc.on('close', function () {
  quit('Close');
});

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
  width: 800,
  height: 450,
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

  if (env.name === 'development' || env.name === 'devremote') {
    devHelper.setDevMenu();
    mainWindow.openDevTools();
  }

  mainWindow.on('crashed', function (event) {
    console.log('mainWindow crashed:', event);
  });

  mainWindow.on('close', function () {
    mainWindowState.saveState(mainWindow);
  });
});

app.on('window-all-closed', function () {
  quit('Close');
});
