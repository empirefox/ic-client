import {Component, View, NgZone, bootstrap, NgIf}from 'angular2/angular2';
import {formDirectives} from 'angular2/forms';
import {Inject} from 'angular2/di';
import {parseReg} from 'services/path';

var ipc = require('ipc');

@Component({
  selector: 'auth-err',
  appInjector: [NgZone],
})

@View({
  templateUrl: 'components/authErr/authErr.html',
  directives: [formDirectives, NgIf],
})

export class AuthErr {
  constructor(@Inject(NgZone) zone) {
    this.webview = document.getElementById("regview");
    this.src = ipc.sendSync('get-reg-room-url') || '';
    this.finalSrc = this.src.replace(/\/login\.html\?from=/gi, '');
    this.webview.src = this.src;

    this.webview.addEventListener('ipc-message', (event) => {
      console.log('from webview:', event);
      switch (event.channel) {
      case 'addr':
        ipc.send('reg-room-ok', event.args[0]);
        break;
      case 'reg-page-ready':
        zone.run(() => this.regPageReady = true);
        break;
      case 'reg-page-not-ready':
        zone.run(() => this.regPageReady = false);
        break;
      case 'error':
        console.log(event.args[0]);
        break;
      }
    });

    this.webview.addEventListener('did-get-redirect-request', (event) => {
      this.webview.src = event.newUrl;
      if (event.newUrl === this.finalSrc) {
        console.log('node');
        this.webview.nodeintegration = 'true';
        // this.webview.preload = './components/authErr/reg-room.js';
      }
    });

    this.webview.addEventListener('did-get-response-details', (event) => {
      if (event.referrer === this.src && event.newUrl === this.finalSrc) {
        console.log('node');
        this.webview.src = event.newUrl;
        this.webview.nodeintegration = 'true';
        // this.webview.preload = './components/authErr/reg-room.js';
      }
    });

    ipc.on('reg-room-url-change', (url) => {
      if (this.src !== url) {
        this.webview.src = url;
        this.src = url;
        this.finalSrc = this.src.replace(/\/login\.html\?from=/gi, '');
      }
    });
  }

  onRegRoom(data) {
    if (!this.regPageReady || !data || !data.name) {
      return;
    }
    this.webview.executeJavaScript(`RegRoom("${data.name}")`);
  }
}
