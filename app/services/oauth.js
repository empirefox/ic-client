import {Injectable, Inject} from 'angular2/angular2';
import {Http} from 'angular2/http';

var env = require('./env_config');

@Injectable
export class Oauth {
  constructor(@Inject(Http) http) {
    this.http = http;
    this.trans = {
      QQ: '使用QQ账户登录',
      BAIDU: '使用百度账户登录',
      WEIBO: '使用微博账户登录',
      MOCK: '使用Mock账户登录',
    };
  }

  getProviders() {
    return this.http.get(env.apiOrigin + '/auth/oauths').toRx().map(res => res.json().map(oauth => {
      oauth.txt = this.trans[oauth.text.toUpperCase()];
      oauth.src = env.mainOrigin + oauth.path + '?path_after_success=/token-one.html';
      return oauth;
    }));
  }
}
