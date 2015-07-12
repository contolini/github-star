require('whatwg-fetch');

const Promise = require('es6-promise').Promise,
      msg = require('./msg'),
      endpoint = require('./getEndpoint');

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function getRepos(opts) {
  let {token, org} = opts,
      repos = [],
      page = 0;
  return new Promise((resolve, reject) => {
    function getNextRepo() {
      let currentPage = ++page;
      fetch(endpoint({org, currentPage}), {
          headers: {
            'Authorization': 'token ' + token
          }
        })
        .then(checkStatus)
        .then(resp => resp.json())
        .then(json => {
          if (!json.length) {
            return resolve(repos);
          }
          repos = repos.concat(json);
          getNextRepo();
        })
        .catch(err => {
          reject(err.message);
        });  
    }
    getNextRepo();
  });
}

module.exports = getRepos;
