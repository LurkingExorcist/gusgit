const cli = require('cli');
const input = require('input');
const utils = require('./utils');

class Gusgit {
  constructor (trelloInstanse, gitInstanse, config) {
    this.trello = trelloInstanse;
    this.git = gitInstanse;
    this.config = config;

    if (!config.repository) {
      throw 'Config file requires repository link';
    }

    if (config.repository.indexOf('github.com') !== -1) {
      this.repoType = 'github';
    } else if (config.repository.indexOf('bitbucket.org') !== -1) {
      this.repoType = 'bitbucket';
    } else {
      throw 'Unknown repository type';
    }
  }
  
  async ['branch <branch>'](branchName) {
    const { number, cardId } = this.parseBranchName(branchName);

    const newBranchName = `T${number}`;

    try {
      await this.trello.getCard(cardId);
    } catch(e) {
      const cardByNumber = await this.trello.findCardByIdShort(+number);

      if (!cardByNumber) {
        throw 'Not found Trello card with that number';
      }
    }

    await this.git.checkoutLocalBranch(newBranchName);

    cli.info(`Current branch is: ${newBranchName}`)
  }
  
  async ['rebase [<from>]']() {
    const branch = await this.git.branch();
    const { total } = await this.git.log({
      from: 'master',
      to: 'HEAD'
    });

    if (total === 0) {
      throw 'No commits to diff';
    }

    const { number: idShort } = this.parseBranchName(branch.current);

    const cardByNumber = await this.trello.findCardByIdShort(+idShort);

    if (!cardByNumber) {
      throw 'Not found Trello card with that number';
    }

    const commitName = await input.text('Enter your commit name:');
    const commitMessage = `${branch.current} | ${commitName}`;

    await this.git.reset(['--soft', `HEAD~${total}`])
    await this.git.commit(commitMessage);

    cli.info(commitMessage)
  }
  
  async ['land [<to>]'](to = 'master') {
    const branch = await this.git.branch();
    const hist = await this.git.log({
      from: 'master',
      to: 'HEAD'
    });

    if (hist.total !== 1) {
      throw 'Land command requires rebase before';
    }

    const templateMatch = hist.latest.message.match(utils.commitTemplateRegexp);

    if (!templateMatch) {
      throw 'Commit name doesn\'t match template';
    }

    const { number: idShort } = this.parseBranchName(branch.current);

    const cardByNumber = await this.trello.findCardByIdShort(+idShort);

    if (!cardByNumber) {
      throw 'Not found Trello card with that number';
    }

    await this.git.checkout(to);
    await this.git.mergeFromTo(branch.current, to);
    await this.git.branch(['-D', branch.current]);
    await this.git.push('origin', to);

    let commitLink = utils.commitLink[this.repoType](hist.latest.hash);

    if (this.config.repository[this.config.repository.length - 1] === '/') {
      commitLink = this.config.repository + commitLink;
    } else {
      commitLink = this.config.repository + '/' + commitLink;
    }
    
    await this.trello.addAttachmentToCard(cardByNumber.shortLink, commitLink);
  }

  parseBranchName(branchName) {
    let result = branchName.match(utils.trelloCardRegexp);

    if (!result) {
      result = branchName.match(utils.branchNameRegexp);

      if (!result) {
        throw 'Branch name is incorrect :(';
      }
    }

    return result.groups;
  }
}

module.exports = Gusgit;