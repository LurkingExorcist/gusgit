# Gusgit: cli for linking Trello cards to git commits

### Read in [RU](/README.russian.md)

## Why gusgit?

During teamwork in Trello, sometimes there is a need to organize the names of commits and branches, as well as link them directly to the cards for Code Review.

Gusgit automates the above processes.

test
test

## Installation

    sudo npm i -g gusgit

## Usage

    gusgit branch <branch>

Creates a git branch named "T\<number>". \<branch> is either a Trello link or a branch name in the format "T\<number>".


    gusgit rebase [<from>]
    
Compiles a set of commits from the current branch into one. \<from> is the name of the branch to be linked from. By default \<from> = master.

    gusgit land [<to>]
    
Merges the current branch with the \<to> branch, deletes it, and adds the commit link to the Trello card to which the branch was attached. By default \<to> = master.

## Configuration

For the cli to work correctly in the project, there must be a config with the name **gusgit.config.json** inside it.

## Config format
    {
      "appkey": <Trello API key>,
      "token": <Trello user API token>,
      "boardId": <Trello board ID>,
      "repository": <Link to git repository>
    }

### * You can get the API key and Trello token by following the link: https://trello.com/app-key

### * The board ID is contained in the board link, which is usually displayed in the following format: https://trello.com/b/\<Board ID>/\<Project name>

    For example: https://trello.com/b/XtVBJIta/gusgit

### * Currently only links to github and bitbucket repositories are supported
