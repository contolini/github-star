require('whatwg-fetch');

const msg = require('./msg'),
      sanitize = require('./sanitize'),
      endpoint = require('./getEndpoint'),
      starRepo = require('./starRepo'),
      getRepos = require('./getRepos');

const code = window.location.href.match(/\?code=(.*)/)
           ? window.location.href.match(/\?code=(.*)/)[1]
           : null,
      token = localStorage.getItem('github-star-token'),
      formEl = document.querySelector('#star-em'),
      orgEl = document.querySelector('#org'),
      goEl = document.querySelector('#go'),
      loadingEl = document.querySelector('#loading');

orgEl.value = localStorage.getItem('org') || 'cfpb';

formEl.addEventListener('submit', go);

function go(ev) {
  ev.preventDefault();
  showBusy();
  localStorage.setItem('org', sanitize(orgEl.value));
  if (token) {
    starRepos({token});
  } else {
    showBusy();
    msg(`First, let's get GitHub's authorization...`);
    setTimeout(() => {
      window.location.href = 'https://github.com/login/oauth/authorize?client_id=c15da5760425ba46e7b4&scope=public_repo';
    }, 2000);
  }
}

function showBusy(hide) {
  if (hide) {
    return document.querySelector('body').classList.add('hidden');
  }
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

  getRepos({token, org: sanitize(orgEl.value)})
    .then(repos => {
      reposLeft = repos.length;
      msg(`Found ${repos.length} repositories. Preparing to star 'em all.`);
      setTimeout(() => {
        repos.forEach(repo => {
          starRepo({
            org: repo.owner.login,
            repo: repo.name,
            token: token
          })
          .then(() => {
            msg(`Successfully starred ${repos.length - --reposLeft} ${repo.owner.login} repositories.`);
            if (reposLeft < 1) {
              reposLeft = 0;
              msg(`Successfully starred all ${repo.owner.login} repositories!`);
              hideBusy();
            }
          })
          .catch(err => console.error(err));
        });
      }, 1000);
    })
    .catch(err => {
      if (err === 'Unauthorized') {
        window.location.href = 'https://github.com/login/oauth/authorize?client_id=c15da5760425ba46e7b4&scope=public_repo';
      } else {
        msg('Hmmmm. I\'m unable to find any repositories. Are you sure you provided a valid GitHub organization?');
      }
      console.error('Error: ' + err);
      hideBusy();
    });

}

function init() {
  if (code) {
    showBusy(true);
    fetch('http://heart-github.herokuapp.com/authenticate/' + code)
      .then(resp => resp.json())
      .then(json => {
        if (json.token) {
          localStorage.setItem('github-star-token', json.token);
          localStorage.setItem('github-star-autopilot', true);
          window.location.replace(location.origin + location.pathname);
        }
        if (json.error) {
          window.location.href = location.origin + location.pathname;
        }
      })
      .catch(resp => {
        window.location.href = location.origin + location.pathname;
        console.error(resp);
      });
    return;
  }
  if (token && localStorage.getItem('github-star-autopilot')) {
    showBusy();
    localStorage.removeItem('github-star-autopilot');
    starRepos({token});
  }
}

init();
