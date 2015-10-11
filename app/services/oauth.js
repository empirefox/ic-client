'use strict';

import {Http} from 'angular2/http';

let ipc = require('ipc');
let url = require('url');
let querystring = require('querystring');
let S = require('string');
let providers = require('./oauth_providers.json');

export class Provider {
  constructor(http, sp, selector) {
    this.http = http;
    this.sp = sp;
    this.selector = selector;
    this.icon = sp.icon;
    this.text = sp.text;
    this.btn = sp.btn;
  }

  authenticate() {
    let webview = this.createLoginView(this.buildAuthorizeUrl());
    let promise = new Promise((resolve, reject) => {
      webview.addEventListener('did-get-redirect-request', event => {
        let parser = url.parse(event.newUrl);
        if (parser.search || parser.hash) {
          let queryParams = parser.search.substring(1).replace(/\/$/, '');
          let qs = querystring.parse(queryParams);
          if (!qs.error) {
            resolve(qs);
            this.createLoginView('data:text/plain,Please wait!');
          } else {
            this.createLoginView('data:text/plain,Error:' + qs.error);
          }
          return;
        }
        this.createLoginView('data:text/plain,Authorization Failed');
      });

      webview.addEventListener('did-fail-load', event => {
        reject('Authorization Failed to Load');
        this.createLoginView('data:text/plain,Authorization Failed to Load');
      });
    });

    return promise.then(oauthData => {
      let stateName = this.sp.name + '_state';
      if (oauthData.state && oauthData.state !== window.localStorage.getItem(stateName)) {
        this.createLoginView('data:text/plain,OAuth "state" mismatch');
        throw new Error('OAuth "state" mismatch');
      }
      return this.exchangeForToken(oauthData);
    }).catch(err => this.sp.createLoginView('data:text/plain,' + err));
  }

  buildAuthorizeUrl() {
    let stateName = this.sp.name + '_state';
    window.localStorage.setItem(stateName, this.state());
    return [this.sp.authorizationEndpoint, this.buildQueryString()].join('?');
  }

  exchangeForToken(oauthData) {
    var data = Object.assign({}, oauthData);
    var paramNames = this.sp.responseParams;

    for (let key in paramNames) {
      let value = paramNames[key];
      switch (key) {
      case 'code':
        data[value] = oauthData.code;
        break;
      case 'clientId':
        data[value] = this.sp.clientId;
        break;
      case 'redirectUri':
        data[value] = this.sp.redirectUri;
        break;
      default:
        data[value] = oauthData[key];
      }
    }

    if (oauthData.state) {
      data.state = oauthData.state;
    }

    return new Promise((resolve, reject) => {
      ipc.removeAllListeners('xreq-failed');
      ipc.on('xreq-failed', (event, err) => {
        ipc.removeAllListeners('xreq-failed');
        reject(err);
      });
      ipc.send('xreq', {
        path: this.sp.path,
        body: JSON.stringify(data),
      });
    });
  }

  createLoginView(src) {
    let loginview = document.getElementById(this.selector);
    loginview.innerHTML = `<webview src="${src}"></webview>`;
    return loginview.firstElementChild;
  }

  state() {
    return Math.random().toString(36).slice(2);
  }

  // port from satellizer
  buildQueryString() {
    let keyValuePairs = {};
    ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'].forEach(params => {

      this.sp[params] && this.sp[params].forEach(paramName => {
        let camelizedName = S(paramName).camelize().s;
        let paramValue = typeof this.sp[paramName] === 'function' ? this.sp[paramName]() : this.sp[camelizedName];

        if (paramName === 'state') {
          let stateName = this.sp.name + '_state';
          paramValue = window.localStorage.getItem(stateName);
        }

        if (paramName === 'scope' && Array.isArray(paramValue)) {
          paramValue = paramValue.join(this.sp.scopeDelimiter);

          if (this.sp.scopePrefix) {
            paramValue = [this.sp.scopePrefix, paramValue].join(this.sp.scopeDelimiter);
          }
        }

        keyValuePairs[paramName] = paramValue;
      });
    });

    return querystring.stringify(keyValuePairs);
  }
}

export class Providers {
  constructor(http: Http) {
    this.http = http;
  }

  get(selector) {
    return providers.map(p => new Provider(this.http, p, selector));
  }
}
