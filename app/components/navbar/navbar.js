import {Component, View, bootstrap} from 'angular2/angular2';

var ipc = require('ipc');

@Component({
  selector: 'navbar'
})

@View({
  templateUrl: 'components/navbar/navbar.html'
})

export class Navbar {
  constructor() {}

  quit() {
    ipc.send('quit');
  }

  close() {
    ipc.send('close');
  }
}

bootstrap(Navbar);
