'use strict';
import {Component, View, NgZone, EventEmitter, Output} from 'angular2/core';

let ipc = require('electron').ipcRenderer;

/*start-non-standard*/
@Component({
  selector: 'navbar',
  outputs: ['toggleCameras'],
})

@View({
  templateUrl: 'components/navbar/navbar.html',
})
/*end-non-standard*/

export class Navbar {

  constructor (){
    this.toggleCameras = new EventEmitter();
  }

  onToggleCameras() {
    console.log('click toggle');
    this.toggleCameras.emit();
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
