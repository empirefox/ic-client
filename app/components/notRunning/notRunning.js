import {Component, View} from 'angular2/angular2';

var ipc = require('ipc');

@Component({
  selector: 'not-running'
})

@View({
  templateUrl: 'components/notRunning/notRunning.html'
})

export class NotRunning {
  constructor() {
  }

  start(){
    ipc.send('start-room');
  }
}
