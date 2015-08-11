import {Component, View, Inject, NgFor, CSSClass} from 'angular2/angular2';

import {Oauth} from 'services/oauth';

var ipc = require('ipc');

@Component({
  selector: 'login',
  appInjector: [],
  viewInjector: [Oauth],
  properties: ['status'],
})

@View({
  templateUrl: 'components/login/login.html',
  directives: [NgFor, CSSClass],
})

export class Login {
  constructor(@Inject(Oauth) oauthService) {
    oauthService.getProviders().subscribe(oauths => this.oauths = oauths);
    this.webview = document.getElementById("loginview");
    this.webview.src = 'data:text/plain,Please choose your favorite login entry';

    if (this.webview.name !== 'loginview') {
      this.webview.name = 'loginview';
      this.addListeners();
    }
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
        this.webview.src = 'data:text/plain,Please choose your favorite login entry';
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

    this.webview.addEventListener('did-get-redirect-request', (event) => {
      this.webview.src = event.newUrl;
    });
  }

  doLogin(oauth) {
    this.webview.src = oauth.src;
  }
}
