'use strict';

var url = require('url');
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
  let apiOriginParser = url.parse(apiData.ApiOrigin);
  let proxyParser = url.parse(apiData.ProxyAuthServer);

  let providers = apiData.Providers.map(p => {
    let parser = p.Proxied ? proxyParser : apiOriginParser;
    let protocol = parser.protocol.slice(0, -1);
    if (protocol !== 'http' && protocol !== 'https') {
      throw new Error(`protocol[${protocol}] is not http or https`);
    }
    // map Port from many/satellizer-factory.js
    let over = cleanObject({
      name: p.Name,
      clientId: p.ClientID,
      scope: p.Scope,
      redirectUri: p.RedirectURL ? p.RedirectURL.replace(/about:\/\/blank/g, env.siteOrigin) : env.siteOrigin,
      authorizationEndpoint: p.AuthURL,

      // protocol to require
      protocol: protocol,
      // request options
      request: {
        hostname: parser.hostname,
        port: parser.port,
        path: p.Path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },

      icon: p.Icon,
      text: apiData.Translates[p.Name],
      btn: p.Btn,
    });
    let sp = apiData.Satellizers[p.Name];

    return Object.assign({}, defaults, sp, over);
  });

  let pSuffix = apiOriginParser.protocol.slice(4);
  // will exported to env_config.json
  return {
    apiOrigin: apiData.ApiOrigin,
    apiWsUrl: `ws${pSuffix}//${apiOriginParser.host}`,
    stuns: apiData.Stuns,
    providers: providers,
  };
};
