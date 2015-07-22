import {Component, View, NgZone, bootstrap} from 'angular2/angular2';
import {NgSwitch, NgSwitchWhen} from 'angular2/directives';
import {Inject} from 'angular2/di';

import {NotRunning} from 'components/notRunning/notRunning';
import {NoConnection} from 'components/noConnection/noConnection';
import {AuthErr} from 'components/authErr/authErr';
import {Running} from 'components/running/running';
import {Removing} from 'components/removing/removing';
import {Authing} from 'components/authing/authing';
import {WsOpened} from 'components/wsOpened/wsOpened';

var ipc = require('ipc');

@Component({
  selector: 'status',
  appInjector: [NgZone],
})

@View({
  templateUrl: 'components/status/status.html',
  directives: [NgSwitch, NgSwitchWhen, NotRunning, NoConnection, AuthErr, Running, Removing, Authing, WsOpened],
})

export class Status {
  constructor(@Inject(NgZone) zone) {
    this.roomStatus = 'not-running';
    ipc.on('room-status', (s) => {
      zone.run(() => {
        if (this.roomStatus === 'auth-err' && s === 'authing') {
          return;
        }
        if (this.roomStatus === s) {
          return;
        }
        this.roomStatus = s;
      });
    });
    ipc.send('get-status');
  }
}

bootstrap(Status);
