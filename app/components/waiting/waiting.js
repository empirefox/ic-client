'use strict';
import {Component, View} from 'angular2/angular2';

let ipc = require('electron').ipcRenderer;

/*start-non-standard*/
@Component({
  selector: 'waiting',
  inputs: ['status'],
})

@View({
  templateUrl: 'components/waiting/waiting.html',
})
/*end-non-standard*/

export class Waiting {
  constructor() {}

  set status(status) {
    switch (status) {
    case 'connecting':
      this.txt = '监控室正在连接到服务器';
      break;
    case 'logging_in':
      this.txt = '监控室正在登录到服务器';
      break;
    case 'unregging_room':
      this.txt = '正在注销本地监控室';
      break;
    case 'regging':
      this.txt = '正在注册本地监控室';
      break;
    case 'ws_opened':
      this.txt = '发现本地监控室, 正在等待状态';
      break;
    default:
      this.txt = '';
    }
  }

  getStatus() {
    ipc.send('get-status');
  }
}
