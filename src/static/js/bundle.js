'use strict';

var get = require('browser-get'),
    msg = require('./msg'),
    endpoint = require('./getEndpoint'),
    org = window.location.search.replace('?', '').split('&')[0].replace(/([^a-z0-9]+)/gi, '');

var repos = [],
    page = 0,
    request = undefined;

// let status = `${num} ${org} repos hearted.`;

function getRepos() {
  request = get(endpoint(org, ++page));
  getRepos();
}

getRepos();

request.then(function (resp) {
  repos.concat(resp);
});

request['catch'](function (resp) {
  msg('Invalid GitHub organization');
});
//# sourceMappingURL=bundle.js.map
