'use strict';
var bodyParser = require('body-parser'),
  multipart = require('connect-multiparty'),
  i18n = require('i18n');

module.exports.http = {
  middlewares: [
    function () {
      return framework.express.static(framework.config.paths.public || '../.tmp/public');
    },
    ['/files', function () {
      return framework.express.static(framework.config.paths.files || '../../files');
    }],
    bodyParser.json.bind(bodyParser),
    bodyParser.urlencoded.bind(bodyParser, { extended: false }),
    multipart,
    function () {
      return function (req, res, next) {
        var language = (req.url.match(/\/(\w+)(\/|$|\?|#)/) || [])[1] || 'ch';
        req.headers['accept-language'] = language;
        next();
      };
    },
    function () {
      return i18n.init;
    }
  ],
  error: function (err, req, res, next) { // error handler must have four arguments
    void(next);
    console.error(err.stack);
    res.render('error/error', {layout: false});
    // res.json('ok');
  }
};
