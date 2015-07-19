import {Component, View, bootstrap} from 'angular2/angular2';
import {NgSwitch, NgSwitchWhen} from 'angular2/directives';

import {NotRunning} from 'components/notRunning/notRunning';
import {NoConnection} from 'components/noConnection/noConnection';
import {AuthErr} from 'components/authErr/authErr';
import {Running} from 'components/running/running';

var ipc = require('ipc');

@Component({
  selector: 'status'
})

@View({
  templateUrl: 'components/status/status.html',
  directives: [NgSwitch, NgSwitchWhen, NotRunning, NoConnection, AuthErr, Running]
})

export class Status {
  constructor() {
    this.roomStatus = 'auth-err';
    ipc.on('room-status', (s) => {
      console.log('from main process:', s);
      this.roomStatus = s;
    });
  }
}

bootstrap(Status);
