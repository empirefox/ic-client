'use strict';

import {Component, View, NgZone, NgSwitch, NgSwitchWhen, bootstrap} from 'angular2/angular2';
import {HTTP_PROVIDERS} from 'angular2/http';

import {NotRunning} from 'components/notRunning/notRunning';
import {NoConnection} from 'components/noConnection/noConnection';
import {AuthErr} from 'components/authErr/authErr';
import {Running} from 'components/running/running';
import {Waiting} from 'components/waiting/waiting';

let ipc = require('electron').ipcRenderer;

/*start-non-standard*/
@Component({
  selector: 'status',
  appInjector: [NgZone],
})

@View({
  templateUrl: 'components/status/status.html',
  directives: [NgSwitch, NgSwitchWhen, NotRunning, NoConnection, AuthErr, Running, Waiting],
})
/*end-non-standard*/

export class Status {
  constructor(zone: NgZone) {
    this.status = 'not_running';
    this.tag = 'not-running';
    ipc.on('room-status', (event, status) => {
      zone.run(() => {
        switch (status) {
        case 'connecting':
        case 'logging_in':
        case 'regging':
        case 'unregging_room':
        case 'ws_opened':
          this.tag = 'waiting';
          break;
        case 'unreachable':
        case 'disconnected':
        case 'bad_server_msg':
          this.tag = 'no-connection';
          break;
        case 'bad_reg_token':
        case 'save_reg_token_error':
          if (this.tag === 'running')
            break;
        case 'bad_room_token':
        case 'reg_error':
        case 'save_room_token_error':
          this.tag = 'auth-err';
          break;
        case 'ready':
          this.tag = 'running';
          break;
        case 'not_running':
          this.tag = 'not-running';
          break;
        default:
          console.log(status);
        }
        this.status = status;
      });
    });
    ipc.send('get-status');
  }
}

bootstrap(Status, [HTTP_PROVIDERS]);
