/**
 * infra
 *
 * @module      :: Policy
 * @description :: Simple policy to log
 *
 */
'use strict';

module.exports = function(req, res, next) {
  logger.info(req.method + ' ' + req.url);
  res.error = function (err, status) {
    status = status || 400;
    res.status(status).json({errcode: err.code, errmsg: err.message});
  };
  return next();
};
