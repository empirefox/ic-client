import {Component, View} from 'angular2/angular2';

var ipc = require('ipc');

@Component({
  selector: 'wsOpened'
})

@View({
  templateUrl: 'components/wsOpened/wsOpened.html'
})

export class WsOpened {
  constructor() {
  }

  getStatus() {
    ipc.send('get-status');
  }
}
