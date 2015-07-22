import {Component, View} from 'angular2/angular2';

var ipc = require('ipc');

@Component({
  selector: 'reging'
})

@View({
  templateUrl: 'components/reging/reging.html'
})

export class Reging {
  constructor() {}

  getStatus() {
    ipc.send('get-status');
  }
}
