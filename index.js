#!/usr/bin/env node

const cli = require('cli');
const simpleGit = require('simple-git');
const { promises: fs } = require('fs');

const Trello = require('./src/trello');
const Gusgit = require('./src/gusgit');

const errorHandler = require('./src/errorHandler');

const options = cli.parse(null, {
  ['branch <branch>']: 'Создает git-ветку с названием "T<number>". <branch> - это либо ссылка на Trello, либо название ветки в формате "T<number>"',
  ['rebase [<from>]']: 'Компанует набор коммитов из текущей ветки в один. <from> - это название ветки, относительно которой должна произойти компановка. По умолчанию <from> = master',
  ['land [<to>]']: 'Мержит текущую ветку с веткой <to>, удаляет ее и добавляет ссылку на коммит в карточку Trello, к которой была прикреплена ветка. По умолчанию <to> = master',
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