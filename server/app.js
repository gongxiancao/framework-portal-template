'use strict';
process.chdir(__dirname);
var framework = require('ofa')(); // jshint ignore:line

module.exports = framework
.use('env')
.use('config')
.use('seneca')
.use('seneca-client')
.use('service')
.use('controller')
.use('express')
.use('express-view') // view need be use before route
.use('express-policy')
.use('express-route')
.lift()
.listen()
.on('error', function (err) {
  logger.error(err.stack);
  return process.exit(1);
})
.on('listened', function () {
  /*jshint multistr: true */
  logger.info('\n\
        _____        \n\
  _____/ ____\\____   \m\
 /  _ \\   __\\\\__  \\  \n\
(  <_> )  |   / __ \\_\n\
 \\____/|__|  (____  /\n\
                  \\/ \n\
Portal started, env=' + process.env.NODE_ENV);
});
