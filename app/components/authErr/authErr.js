import {Component, View, NgZone, NgIf}from 'angular2/angular2';
import {formDirectives} from 'angular2/forms';
import {Inject} from 'angular2/di';

import {Reging} from 'components/reging/reging';
import {Login} from 'components/login/login';

var ipc = require('ipc');

@Component({
  selector: 'auth-err',
  appInjector: [NgZone],
})

@View({
  templateUrl: 'components/authErr/authErr.html',
  directives: [formDirectives, NgIf, Reging, Login],
})

export class AuthErr {
  constructor(@Inject(NgZone) zone) {
    this.reging = false;
    ipc.on('regable', (regable) => {
      zone.run(() => {
        this.regable = regable;
      });
    });
  }

  onRegRoom(data) {
    if (!this.regable || !data || !data.name) {
      return;
    }
    this.reging = true;
    ipc.send('reg-room', data.name);
  }
}
