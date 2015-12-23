'use strict';
import {Component, View} from 'angular2/core';

let ipc = require('electron').ipcRenderer;

/*start-non-standard*/
@Component({
  selector: 'running'
})

@View({
  templateUrl: 'components/running/running.html'
})
/*end-non-standard*/

export class Running {
  constructor() {}

  openRecDir() {
    ipc.send('open-rec-dir');
  }

  remove() {
    ipc.send('remove-room');
  }
}
