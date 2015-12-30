'use strict';
import {Component, View, NgZone} from 'angular2/core';
import {NgFor, NgIf} from 'angular2/common';

let ipc = require('electron').ipcRenderer;

/*start-non-standard*/
@Component({
  selector: 'cameras',
  appInjector: [NgZone],
  inputs: ['showInput:show'],
})

@View({
  templateUrl: 'components/cameras/cameras.html',
  directives: [NgFor, NgIf],
})
/*end-non-standard*/

export class Cameras {
  constructor(zone: NgZone) {
    this.show = true;
    this.ids = [];
    this.list = [];

    ipc.on('rec-changed', (event, recObj) => {
      zone.run(() => {
        this.ids = recObj.ids || [];

        let camera = recObj.camera;
        camera.rec = camera.Rec;

        let exist = this.list.find(c => camera.Id === c.Id);
        if (exist) {
          Object.assign(exist, camera);
        } else if (this.ids.find(id => camera.Id === id)) {
          this.list.push(camera);
        }

        this.cleanList();
      });
    });
    ipc.send('get-cameras');
  }

  set showInput(v) {
    this.show = v;
  }

  cleanList() {
    this.list.filter(c => this.ids.find(id => c.Id === id));
  }

  onSetRec(c) {
    ipc.send('set-rec', {
      id: c.Id,
      rec: c.rec,
    });
  }
}
