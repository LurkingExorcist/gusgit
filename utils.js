const utils = {};

utils.trelloCardRegexp = /(https:\/\/trello.com\/c\/[A-Za-z0-9]+\/(?<number>[0-9]+)-.+)/;
utils.branchNameRegexp = /T(?<number>[0-9]+)/;

module.exports = utils;