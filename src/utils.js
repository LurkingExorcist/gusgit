const utils = {};

utils.trelloCardRegexp = /(https:\/\/trello.com\/c\/(?<cardId>[A-Za-z0-9]+)\/(?<number>[0-9]+)-.+)/;
utils.branchNameRegexp = /T(?<number>[0-9]+)/;
utils.commitTemplateRegexp = /T(?<number>[0-9]+) \| .+/;

utils.commitLink = {
  bitbucket: (commit) => `commits/${commit}`,
  github: (commit) => `commit/${commit}`,
};

module.exports = utils;