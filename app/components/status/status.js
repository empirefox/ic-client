import {Component, View, Inject, NgZone, NgSwitch, NgSwitchWhen, httpInjectables, bootstrap} from 'angular2/angular2';

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
        switch (this.roomStatus) {
        case 'auth-err':
          if (s === 'authing') {
            return;
          }
          break;
        }

        this.roomStatus = s;
      });
    });
    ipc.send('get-status');
  }
}

bootstrap(Status, [httpInjectables]);
