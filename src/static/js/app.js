require('whatwg-fetch');

const msg = require('./msg'),
      endpoint = require('./getEndpoint'),
      starRepo = require('./starRepo'),
      getRepos = require('./getRepos');

const code = window.location.href.match(/\?code=(.*)/)
           ? window.location.href.match(/\?code=(.*)/)[1]
           : null,
      token = localStorage.getItem('gh-auth'),
      formEl = document.querySelector('#star-em'),
      orgEl = document.querySelector('#org'),
      goEl = document.querySelector('#go'),
      loadingEl = document.querySelector('#loading');

orgEl.value = localStorage.getItem('org') || 'cfpb';

formEl.addEventListener('submit', go);

function go(ev) {
  ev.preventDefault();
  showBusy();
  localStorage.setItem('org', orgEl.value);
  if (token) {
    starRepos({token});
  } else {
    window.location.href = 'https://github.com/login/oauth/authorize?client_id=c15da5760425ba46e7b4&scope=public_repo';
  }
}

function showBusy() {
  orgEl.disabled = true;
  orgEl.classList.add('busy');
  goEl.classList.add('hidden');
  loadingEl.classList.remove('hidden');
}

function hideBusy() {
  orgEl.disabled = false;
  orgEl.classList.remove('busy');
  goEl.classList.remove('hidden');
  loadingEl.classList.add('hidden');
}

function starRepos(opts) {
  let {token} = opts,
      reposLeft;

  msg('Looking for repos...');

  getRepos({token, org: orgEl.value})
  .then(repos => {
    reposLeft = repos.length;
    msg(`Found ${repos.length} repositories. Preparing to star 'em all.`);
    setTimeout(() => {
      repos.forEach(repo => {
        starRepo({
          org: repo.owner.login,
          repo: repo.name,
          token: token
        }).then(() => {
          msg(`Successfully starred ${repos.length - --reposLeft} ${repo.owner.login} repositories.`);
          if (reposLeft < 1) {
            reposLeft = 0;
            msg(`Successfully starred all ${repo.owner.login} repositories!`);
            hideBusy();
          }
        }).catch(resp => console.log(resp));
      });
    }, 1000);
  })
  .catch(err => {
    if (err === 'Unauthorized') {
      window.location.href = 'https://github.com/login/oauth/authorize?client_id=c15da5760425ba46e7b4&scope=public_repo';
    }
    msg('Hmmmm. I\'m unable to find any repositories. Are you sure you provided a valid GitHub organization?');
    console.log('Error: ' + err);
    hideBusy();
  });

}

function init() {
  if (code) {
    fetch('http://heart-github.herokuapp.com/authenticate/' + code)
    .then(resp => resp.json())
    .then(json => {
      if (json.token) {
        localStorage.setItem('gh-auth', json.token);
        starRepos({token: json.token});
      }
    })
    .catch(resp => msg('Error getting GH token. ' + resp));
    return;
  }
}

init();
