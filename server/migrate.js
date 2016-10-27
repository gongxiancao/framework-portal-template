'use strict';
process.chdir(__dirname);

var migrate = require('migrate');
var set = migrate.load('migrations/.migrate', 'migrations');

module.exports = set;