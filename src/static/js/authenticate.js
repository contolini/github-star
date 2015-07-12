const get = require('browser-get');

let request = get('http://localhost:9999/authenticate/' + code);

request.then(function(resp){
  repos.concat(resp);
  getRepos();
}).catch(function(resp){
  msg('Invalid GitHub organization. I found ' + currentPage + ' pages.');
});
