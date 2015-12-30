'use strict';
import {Component, View} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';

/*start-non-standard*/
@Component({
  selector: 'app-version'
})

@View({
  templateUrl: 'components/appVersion/appVersion.html'
})
/*end-non-standard*/

export class AppVersion {
    constructor() {
        this.electronVersion = process.versions['electron'];
    }
}

bootstrap(AppVersion);
