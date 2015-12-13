'use strict';

import {Component, View, NgFor, NgClass} from 'angular2/angular2';

import {Providers} from 'services/oauth';

let ipc = require('electron').ipcRenderer;
let url = require('url');
let querystring = require('querystring');

/*start-non-standard*/
@Component({
  selector: 'login',
  viewProviders: [Providers],
  inputs: ['status'],
})

@View({
  templateUrl: 'components/login/login.html',
  directives: [NgFor, NgClass],
})
/*end-non-standard*/

export class Login {
  constructor(providers: Providers) {
    ipc.send('get-status');
    this.providers = providers.get('loginview');
  }

  set status(status) {
    switch (status) {
    case 'bad_reg_token':
      this.txt = '用户登录信息错误，请重新登录';
      break;
    case 'save_reg_token_error':
      this.txt = '保存用户登录信息错误，请稍后重新登录';
      break;
    default:
      this.txt = '';
    }
  }

  onAuthenticate(provider) {
    provider.authenticate();
  }
}
