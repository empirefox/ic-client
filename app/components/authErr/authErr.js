import {Component, View, bootstrap, NgIf}from 'angular2/angular2';
import {formDirectives} from 'angular2/forms';

var ipc = require('ipc');

@Component({
  selector: 'auth-err',
})

@View({
  templateUrl: 'components/authErr/authErr.html',
  directives: [formDirectives, NgIf],
})

export class AuthErr {
  constructor() {
  }

  onRegRoom(value){
    if(!value || !value.roomName){
      return;
    }
		ipc.send('asynchronous-message', 'reg-room', value);
  }
}
