'use strict';

var url = require('url');
var kill = require('tree-kill');
var path = require('path');
var exec = require('child_process').exec;
var electron = require('electron');
var app = electron.app;
var ipcMain = electron.ipcMain;
var shell = electron.shell;
var BrowserWindow = electron.BrowserWindow;
var env = require('./vendor/electron_boilerplate/env_config');
var devHelper = require('./vendor/electron_boilerplate/dev_helper');
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');
var utils = require('./vendor/electron_boilerplate/utils');

let dataDir = app.getPath('userData');
let recDir = path.join(app.getPath('home'), env.recDir);
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

// app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

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
  } else {
    sendToRoom({
      type: type,
    });
  }
  setTimeout(() => {
    if (conn) {
      conn.close();
    }
    process.exit();
  }, 500);
}

function startRoom() {
  Promise.all([utils.ensureDir(recDir), utils.ensureDir(dataDir)]).then(() => {
    // config.go
    let setup = JSON.stringify({
      "DbPath": path.join(dataDir, env.roomDb),
      "RecDir": recDir,
      "WsUrl": env.apiWsUrl,
      "PingSecond": env.pingSecond,
      "Stuns": env.stuns,
    });
    let bin = path.join(app.getPath('exe'), '..', env.roomBinName);
    let cmd = `${bin} -setup='${setup}'`;
    console.log(`exec: ${cmd}`);
    exec(cmd);
  }).catch(console.log.bind(console));
}
startRoom();

function onRoomStaus(status) {
  sendToWindow('room-status', status);
}

function onRegable(status) {
  if (status === 'regable') {
    sendToWindow('regable');
  } else {
    sendToWindow('room-status', status);
  }
}

function onRecEnabled(enabled) {
  sendToWindow('rec-enabled', enabled);
}

try {
  // TODO insecure adpated protocols => ws options
  conn = new ws('ws://127.0.0.1:12301/local', {
    origin: 'http://ic.client',
  });
  conn.binaryType = 'arraybuffer';
  conn.onopen = function () {
    console.log('onopen');
    reconnectTimes = 0;
    sendToWindow('room-status', 'ws_opened');
    sendToRoom({
      type: 'GetRoomInfo',
    });
  };
  conn.onclose = function () {
    console.log('onclose');
    sendToWindow('room-status', 'not_running');
  };
  conn.onerror = function () {
    // console.log('onerror:', error);
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
    case 'Regable':
      onRegable(statusObj.content);
      break;
    case 'RecEnabled':
      onRecEnabled(statusObj.content);
      break;
    case 'RoomInfo':
      roomInfo = statusObj.content;
      break;
    default:
      console.log('unknow message', statusObj);
    }
  };
} catch (e) {
  console.log('catch:', e);
}

// used by login to save reg-token
ipcMain.on('xreq', (event, xreq) => {
  let req = require(xreq.protocol).request(xreq.options, res => {
    let reply = '';
    res.on('data', chunk => reply += chunk);
    res.on('end', () => {
      let rj;
      try {
        rj = JSON.parse(reply).token;
      } catch (e) {
        sendToWindow('xreq-failed', 'reply: ' + reply);
      }
      if (rj) {
        sendToRoom({
          type: 'SetRegToken',
          content: rj,
        });
      }
    });
  });
  req.write(xreq.body);
  req.end();
  req.on('error', err => {
    sendToWindow('xreq-failed', JSON.stringify(err));
  });
});
// used by authErr to reg room
ipcMain.on('reg-room', (event, name) => {
  sendToRoom({
    type: 'DoRegRoom',
    content: {
      name: name,
    },
  });
});
// used by authErr
ipcMain.on('get-regable', () => {
  sendToRoom({
    type: 'GetRegable',
  });
});
// used by noConnection
ipcMain.on('do-connect', () => {
  sendToRoom({
    type: 'DoConnect',
  });
});
// used by notRunning
ipcMain.on('start-room', () => startRoom());
// used by running
ipcMain.on('remove-room', () => {
  sendToRoom({
    type: 'DoRemoveRoom',
  });
});
// used by running
ipcMain.on('open-rec-dir', () => shell.openItem(recDir));
// used by waiting, login
ipcMain.on('get-status', () => {
  sendToRoom({
    type: 'GetStatus',
  });
});
// used by navbar
ipcMain.on('get-rec-enabled', () => {
  sendToRoom({
    type: 'GetRecEnabled',
  });
});
// used by navbar
ipcMain.on('set-rec-enabled', (event, enabled) => {
  sendToRoom({
    type: 'SetRecEnabled',
    content: enabled,
  });
});
// used by navbar
ipcMain.on('remove-reg-token', () => {
  sendToRoom({
    type: 'DoRemoveRegToken',
  });
});
// used by navbar
ipcMain.on('term', () => quit('Exit'));
// used by navbar
ipcMain.on('close', () => quit('Close'));

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
  width: 800,
  height: 500,
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
  });

  if (mainWindowState.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  if (env.name === 'development' || env.name === 'devremote') {
    devHelper.setDevMenu();
    mainWindow.openDevTools();
  }

  mainWindow.webContents.on('crashed', (event) => console.log('mainWindow crashed:', event));

  mainWindow.on('close', () => mainWindowState.saveState(mainWindow));
  mainWindow.on('closed', () => mainWindow = null);
});

app.on('window-all-closed', () => quit('Close'));
