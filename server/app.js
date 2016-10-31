'use strict';
process.chdir(__dirname);
var ofa = require('ofa')(); // jshint ignore:line

module.exports = ofa
.use('ofa-env')
.use('ofa-config')
.use('ofa-seneca')
.use('ofa-seneca-client')
.use('ofa-service')
.use('ofa-controller')
.use('ofa-express')
.use('ofa-express-view') // view need be use before route
.use('ofa-express-policy')
.use('ofa-express-route')
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
