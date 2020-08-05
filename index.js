#!/usr/bin/env node

const cli = require('cli');
const simpleGit = require('simple-git');
const { promises: fs } = require('fs');

const Trello = require('./src/trello');
const Gusgit = require('./src/gusgit');

const errorHandler = require('./src/errorHandler');

const options = cli.parse(null, {
  ['branch <branch>']: 'Creates a git branch named "T<number>". <branch> is either a Trello link or a branch name in the format "T<number>".',
  ['rebase [<from>]']: 'Compiles a set of commits from the current branch into one. <from> is the name of the branch to be linked from. By default <from> = master.',
  ['land [<to>]']: 'Merges the current branch with the <to> branch, deletes it, and adds the commit link to the Trello card to which the branch was attached. By default <to> = master.',
});

const init = async () => {
  try {
    const gusgitConfigBuffer = await fs.readFile('./gusgit.config.json');
    const gusgitConfig = JSON.parse(gusgitConfigBuffer.toString());

    const trello = new Trello(gusgitConfig);
    const git = simpleGit({
      baseDir: process.cwd(),
      binary: 'git',
      maxConcurrentProcesses: 6,
    });

    const gusgit = new Gusgit(trello, git, gusgitConfig);

    const { command, args } = cli;
    const fn = gusgit[command].bind(gusgit);

    if (!fn) {
      throw `Not found command ${command}`;
    }

    await fn(...args);
  } catch(e) {
    errorHandler(e);
  }
}

init();