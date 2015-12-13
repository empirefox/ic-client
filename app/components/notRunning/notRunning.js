'use strict';
import {Component, View} from 'angular2/angular2';

let ipc = require('electron').ipcRenderer;

/*start-non-standard*/
@Component({
  selector: 'not-running'
})

@View({
  templateUrl: 'components/notRunning/notRunning.html'
})
/*end-non-standard*/

export class NotRunning {
  constructor() {
  }

  start(){
    ipc.send('start-room');
  }
}
