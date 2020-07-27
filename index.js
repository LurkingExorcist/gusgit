const cli = require('cli');
const simpleGit = require('simple-git');
const input = require('input');
const Trello = require('./trello');

const utils = require('./utils');
const errorHandler = require('./errorHandler');

const gusgitConfig = require('./gusgit.config.json');

const trello = new Trello(gusgitConfig);

const git = simpleGit({
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
})

const options = cli.parse(null, {
  ['branch <branch>']: 'Makes git branch in current directory with name "T<number>". <branch> is Trello link or branch name in format "T<number>"',
  ['rebase [<from>]']: 'Composes your commits to one. <from> is .....',
});

const commands = {
  ['branch <branch>']: async (branchName) => {
    let result = branchName.match(utils.trelloCardRegexp);

    if (!result) {
      result = branchName.match(utils.branchNameRegexp);

      if (!result) {
        throw 'Branch name is incorrect :(';
      }
    }

    const { number, cardId } = result.groups;
    const newBranchName = `T${number}`;

    try {
      await trello.getCard(cardId);
    } catch(e) {
      const cardByNumber = await trello.findCardByIdShort(+number);

      if (!cardByNumber) {
        throw 'Not found Trello card with that number';
      }
    }

    await git.checkoutLocalBranch(newBranchName);

    cli.info(`Current branch is: ${newBranchName}`)
  },
  ['rebase [<from>]']: async () => {
    const branch = await git.branch();
    const { total } = await git.log({
      from: 'master',
      to: 'HEAD'
    });

    if (total === 0) {
      throw 'No commits to diff';
    }

    const match = branch.current.match(utils.branchNameRegexp);

    if (!match) {
      throw 'Branch name doesn\'t match format T<number>';
    }

    const { number: idShort } = match.groups;
    const cardByNumber = await trello.findCardByIdShort(+idShort);
    console.log(idShort)

    if (!cardByNumber) {
      throw 'Not found Trello card with that number';
    }

    const commitName = await input.text('Enter your commit name:');
    const commitMessage = `${branch.current} | ${commitName}`;

    await git.reset(['--soft', `HEAD~${total}`])
    await git.commit(commitMessage);

    cli.info(commitMessage)
  },
}

const init = async () => {
  try {
    const { command, args } = cli;
    const fn = commands[command];

    if (!fn) {
      throw `Not found command ${command}`;
    }

    await commands[command](...args);
  } catch(e) {
    errorHandler(e);
  }
}

init();