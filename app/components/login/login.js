import {Component, View, NgFor, CSSClass} from 'angular2/angular2';
import {Inject} from 'angular2/di';

import {Oauth} from 'services/oauth';

var ipc = require('ipc');

@Component({
  selector: 'login',
  appInjector: [],
  viewInjector: [Oauth],
})

@View({
  templateUrl: 'components/login/login.html',
  directives: [NgFor, CSSClass],
})

export class Login {
  constructor(@Inject(Oauth) oauthService) {
    oauthService.getProviders().subscribe(oauths => this.oauths = oauths);
    this.webview = document.getElementById("loginview");
    this.webview.addEventListener('ipc-message', (event) => {
      console.log('from webview:', event);
      switch (event.channel) {
      case 'reg-token':
        ipc.send('reg-token-ok', event.args[0]);
        zone.run(() => {
          this.err = null;
        });
        break;
      case 'reg-token-error':
        this.reging = false;
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
