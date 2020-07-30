const cli = require('cli');

module.exports = (e) => {
  console.error(e)
  cli.error(e);
}