'use strict';

import {Component, View, Inject, NgFor, NgClass} from 'angular2/angular2';

import {Oauth} from 'services/oauth';

let ipc = require('ipc');

@Component({
  selector: 'login',
  viewBindings: [Oauth],
  properties: ['status'],
})

@View({
  templateUrl: 'components/login/login.html',
  directives: [NgFor, NgClass],
})

export class Login {
  constructor(@Inject(Oauth) oauthService) {
    ipc.send('get-status');
    oauthService.getProviders().subscribe(oauths => this.oauths = oauths);
    let loginview = document.getElementById("loginview");
    loginview.innerHTML = '<webview preload="./components/authErr/del.js" nodeintegration></webview>';
    this.webview = loginview.firstElementChild;
    this.webview.src = 'data:text/plain,Please choose your favorite login entry';
    this.addListeners();
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

  addListeners() {
    this.webview.addEventListener('ipc-message', (event) => {
      switch (event.channel) {
      case 'reg-token':
        this.webview.src = 'data:text/plain,Please wait!';
        ipc.send('reg-token-ok', event.args[0]);
        zone.run(() => {
          this.err = null;
        });
        break;
      case 'reg-token-error':
        zone.run(() => {
          this.err = event.args[0];
        });
        break;
      }
    });
  }

  doLogin(src) {
    this.webview.src = src;
  }
}
