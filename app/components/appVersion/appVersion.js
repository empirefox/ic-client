'use strict';
import {Component, View, bootstrap} from 'angular2/angular2';

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
