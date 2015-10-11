'use strict';

import {Component, View, NgZone, NgIf, FORM_DIRECTIVES}from 'angular2/angular2';

import {Login} from 'components/login/login';

var ipc = require('ipc');

/*start-non-standard*/
@Component({
  selector: 'auth-err',
  appInjector: [NgZone],
  inputs: ['rs:status'],
})

@View({
  templateUrl: 'components/authErr/authErr.html',
  directives: [FORM_DIRECTIVES, NgIf, Login],
})
/*end-non-standard*/

export class AuthErr {
  constructor(zone: NgZone) {
    this.regable = false;
    ipc.removeAllListeners('regable');
    ipc.on('regable', () => {
      zone.run(() => this.regable = true);
    });
    ipc.send('get-regable');
  }

  set rs(status) {
    switch (status) {
    case 'bad_room_token':
      this.txt = '监控室注册信息错误，请重新注册';
      break;
    case 'reg_error':
      this.txt = '服务器在注册本地监控室时发生错误，请稍后重试';
      break;
    case 'save_room_token_error':
      this.txt = '成功注册监控室，但保存监控室注册信息错误';
      break;
    default:
      this.regable = false;
      this.txt = '';
    }
    this.status = status;
  }

  onRegRoom(data) {
    if (!this.regable || !data || !data.name) {
      return;
    }
    this.reging = true;
    ipc.send('reg-room', data.name);
  }
}
