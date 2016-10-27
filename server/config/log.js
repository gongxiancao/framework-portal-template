'use strict';

var winston = require('winston');
console.log('xxxx');
global.logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp: function () {
        return new Date().toISOString();
      }
    })
  ]
});
