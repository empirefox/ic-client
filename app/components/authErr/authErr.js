import {Component, View, bootstrap, NgIf}from 'angular2/angular2';
import {formDirectives} from 'angular2/forms';
import {Http, httpInjectables} from 'angular2/http';
import {Inject} from 'angular2/di';

var ipc = require('ipc');

@Component({
  selector: 'auth-err',
  appInjector: [httpInjectables],
})

@View({
  templateUrl: 'components/authErr/authErr.html',
  directives: [formDirectives, NgIf],
})

export class AuthErr {
  constructor(@Inject(Http) http) {
    this.http = http;
  }

  onRegRoom(data){
    if(!data || !data.roomName){
      return;
    }
    this.http.post('https://icv3.luck2.me/many/reg-room', data)
    .map(res => res.json().addr)
    .subscribe(addr => ipc.send('reg-room', addr));
  }
}
