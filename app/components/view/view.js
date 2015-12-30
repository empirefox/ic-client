'use strict';
import {Component, View, enableProdMode} from 'angular2/core';
import {HTTP_PROVIDERS} from 'angular2/http';
import {bootstrap} from 'angular2/platform/browser';

import {Navbar} from 'components/navbar/navbar';
import {Cameras} from 'components/cameras/cameras';
import {Status} from 'components/status/status';

/*start-non-standard*/
@Component({
  selector: 'view',
})

@View({
  templateUrl: 'components/view/view.html',
  directives: [Navbar, Cameras, Status],
})
/*end-non-standard*/

export class MainView {
  constructor() {
    this.showCameras = false;
  }

  onToggleCameras() {
    this.showCameras = !this.showCameras;
  }
}

// enableProdMode();
bootstrap(MainView, [HTTP_PROVIDERS]).catch(err => console.error(err));
