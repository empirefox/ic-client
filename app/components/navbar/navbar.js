import {Component, View, NgZone, bootstrap} from 'angular2/angular2';

var ipc = require('ipc');

@Component({
  selector: 'navbar',
  appInjector: [NgZone],
})

@View({
  templateUrl: 'components/navbar/navbar.html',
})

export class Navbar {
  constructor(zone: NgZone) {
    this.rec = 1;
    this.toggleRecBtnDiabled = 1;
    this.toggleRecTxt = '切换录像';
    ipc.on('rec-enabled', (rec) => {
      zone.run(() => {
        this.rec = rec;
        if (rec) {
          this.toggleRecTxt = '关闭录像';
        } else {
          this.toggleRecTxt = '开启录像';
        }
        this.toggleRecBtnDiabled = 0;
      });
    });
    ipc.send('get-rec-enabled');
  }

  toggleRec() {
    if (this.toggleRecBtnDiabled) {
      ipc.send('get-rec-enabled');
      return;
    }
    this.toggleRecBtnDiabled = 1;
    this.toggleRecTxt = '正在切换录像';
    ipc.send('set-rec-enabled', !this.rec);
  }

  removeRegToken() {
    ipc.send('remove-reg-token');
  }

  term() {
    ipc.send('term');
  }

  close() {
    ipc.send('close');
  }
}

bootstrap(Navbar);
