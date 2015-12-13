'use strict';
import {Component, View} from 'angular2/angular2';

let ipc = require('electron').ipcRenderer;

/*start-non-standard*/
@Component({
  selector: 'no-connection',
  inputs: ['status'],
})

@View({
  templateUrl: 'components/noConnection/noConnection.html',
})
/*end-non-standard*/

export class NoConnection {
  constructor() {}

  set status(status) {
    switch (status) {
    case 'unreachable':
      this.txt = '本地监控室已运行，但无法连接服务器';
      break;
    case 'disconnected':
      this.txt = '本地监控室已运行，到服务器的连接已断开';
      break;
    case 'bad_server_msg':
      this.txt = '服务器消息错误，连接已断开';
      break;
    default:
      this.txt = '';
    }
  }

  doConnect() {
    ipc.send('do-connect');
  }
}
