#!/usr/bin/env node

'use strict';

let chalk = require('chalk');
let suggestions = require('./index');

let term = process.argv[2] || 'cat';

suggestions.getNew(term, function(err, res) {
  if (!res.suggestions){
    console.log(chalk.red('\nNo suggestions found for ') + chalk.yellow(term) + '\n');
  } else {
    console.log('\nSuggestions:\n');
    res.list.forEach((suggestion) => {
      let str = suggestion.full.replace(suggestion.extra, chalk.green(suggestion.extra));
      console.log('\t' + str);
    });
    console.log();
  }
});

