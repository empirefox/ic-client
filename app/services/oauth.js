'use strict';

import {
  Http
}
from 'angular2/http';

let ipc = require('electron').ipcRenderer;
let url = require('url');
let querystring = require('querystring');
let providers = window.env.providers;

export class Provider {
  constructor(http, sp, selector) {
    this.http = http;
    this.sp = sp;
    this.selector = selector;
    this.icon = sp.icon;
    this.text = sp.text;
    this.btn = sp.btn;
    this.stateName = sp.name + '_state';
    this.state = null;
    this.responseParams = Object.assign({
      code: 'code',
      clientId: 'clientId',
      redirectUri: 'redirectUri',
    }, sp.responseParams);
  }

  authenticate() {
    let webview = this.createLoginView(this.buildAuthorizeUrl());
    let promise = new Promise((resolve, reject) => {
      webview.addEventListener('did-get-redirect-request', event => {
        let parser = url.parse(event.newURL);
        if (parser.host !== url.parse(this.sp.redirectUri).host) {
          return;
        }
        if (parser.search || parser.hash) {
          let queryParams = parser.search.substring(1).replace(/\/$/, '');
          let qs = querystring.parse(queryParams);
          if (!qs.error) {
            this.createLoginView('data:text/plain,Please wait!');
            resolve(qs);
          } else {
            this.createLoginView('data:text/plain,Error:' + qs.error);
          }
        } else {
          this.createLoginView('data:text/plain,Authorization Failed');
        }
      });

      webview.addEventListener('did-fail-load', event => {
        reject('Authorization Failed to Load');
        this.createLoginView('data:text/plain,Authorization Failed to Load');
      });
    });

    return promise.then(oauthData => {
      if (this.state && oauthData.state !== this.state) {
        this.createLoginView('data:text/plain,OAuth "state" mismatch');
        throw new Error('OAuth "state" mismatch');
      }
      return this.exchangeForToken(oauthData);
    }).catch(err => this.createLoginView('data:text/plain,' + err));
  }

  buildAuthorizeUrl() {
    return this.sp.state ? this.sp.authorizationURL + this.stater() : this.sp.authorizationURL;
  }

  // fork from satellizer
  exchangeForToken(oauthData) {
    var data = Object.assign({}, oauthData);
    var paramNames = this.responseParams;

    for (let key in paramNames) {
      let value = paramNames[key];
      switch (key) {
      case 'code':
        data[value] = oauthData.code;
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
        protocol: this.sp.protocol,
        options: this.sp.request,
        body: JSON.stringify(data),
      });
    });
  }

  createLoginView(src) {
    let loginview = document.getElementById(this.selector);
    loginview.innerHTML = `<webview src="${src}" httpreferrer="${window.env.siteOrigin}"></webview>`;
    return loginview.firstElementChild;
  }

  stater() {
    return this.state = Math.random().toString(36).slice(2);
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
