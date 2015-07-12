module.exports = function(opts) {
  let {org, currentPage} = opts;
  return `https://api.github.com/orgs/${org}/repos?per_page=100&page=${currentPage}`;
}
