import {Component, View} from 'angular2/angular2';

var ipc = require('ipc');

@Component({
  selector: 'running'
})

@View({
  templateUrl: 'components/running/running.html'
})

export class Running {
  constructor() {}

  openRecDir() {
    ipc.send('open-rec-dir');
  }

  remove() {
    ipc.send('remove-room');
  }
}
