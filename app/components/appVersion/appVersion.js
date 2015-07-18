import {Component, View, bootstrap} from 'angular2/angular2';

@Component({
  selector: 'app-version'
})

@View({
  templateUrl: 'components/appVersion/appVersion.html'
})

export class AppVersion {
    constructor() {
        this.electronVersion = process.versions['electron'];
    }
}

bootstrap(AppVersion);
