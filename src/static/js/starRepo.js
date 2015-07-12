require('whatwg-fetch');

const msg = require('./msg');

function starRepo(opts) {
  let {org, repo, token} = opts;
  return fetch(`https://api.github.com/user/starred/${org}/${repo}`, {
    method: 'put',
    headers: {
      'Authorization': 'token ' + token
    },
  });
}

module.exports = starRepo;
