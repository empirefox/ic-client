import {Component, View} from 'angular2/angular2';

var ipc = require('ipc');

@Component({
  selector: 'removing'
})

@View({
  templateUrl: 'components/removing/removing.html'
})

export class Removing {
  constructor() {}

  getStatus() {
    ipc.send('get-status');
  }
}
