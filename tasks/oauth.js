'use strict';

var jetpack = require('fs-jetpack');
var request = require('sync-request');
var utils = require('./utils');

var projectDir = jetpack;
var destDir = projectDir.cwd('./build');
var env = projectDir.read('config/env_' + utils.getEnvName() + '.json', 'json');

// port from satellizer.js factory SatellizerOauth2
var defaults = {
  defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
  responseType: 'code',
  responseParams: {
    code: 'code',
    clientId: 'clientId',
    redirectUri: 'redirectUri'
  },
  state: () => Math.random().toString(36).slice(2),
};

function cleanObject(obj) {
  for (var k in obj) {
    if (obj[k] === undefined) {
      delete(obj, k);
    }
  }
  return obj;
}

module.exports = function () {
  let res = request('GET', env.oauth);
  let apiData = JSON.parse(res.getBody());
  let start = 'PAGE.LOGIN.OAUTH.'.length;

  let providers = apiData.Providers.map(p => {
    // map Port from many/satellizer-factory.js
    let over = cleanObject({
      name: p.Name,
      path: p.Path,
      clientId: p.ClientID,
      scope: p.Scope,
      redirectUri: p.RedirectURL ? p.RedirectURLreplace(/about:\/\/blank/g, env.siteOrigin) : env.siteOrigin,
      authorizationEndpoint: p.AuthURL,

      icon: p.Icon,
      text: apiData.Translates[p.Name],
      btn: p.Btn,
    });
    let sp = apiData.Satellizers[p.Name];

    return Object.assign({}, defaults, sp, over);
  });

  destDir.write('oauth_providers.json', providers);
};
