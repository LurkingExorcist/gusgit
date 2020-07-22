const cli = require('cli');
const simpleGit = require('simple-git');

const utils = require('./utils');
const errorHandler = require('./errorHandler');

const git = simpleGit({
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
})

const options = cli.parse(null, {
  branch: 'Makes git branch in current directory with name "T<number>". Argument is Trello link or branch name in format "T<number>"',
  diff: 'Composes your commits to one'
});

const commands = {
  branch: async (branchName) => {
    let result = branchName.match(utils.trelloCardRegexp);

    if (!result) {
      result = branchName.match(utils.branchNameRegexp);

      if (!result) {
        throw 'Branch name is bad :(';
      }
    }

    const { number } = result.groups;
    const newBranchName = `T${number}`;

    await git.checkoutBranch(newBranchName);

    cli.info(`Current branch is: ${newBranchName}`)
  }
}

const init = async () => {
  try {
    const { command, args } = cli;
    
    await commands[command](...args);
  } catch(e) {
    errorHandler(e);
  }
}

init();