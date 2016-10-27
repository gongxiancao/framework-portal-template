'use strict';
module.exports.routes = {
  'get /': 'HomeController.index',
  'get /heartbeat': 'HomeController.heartbeat',
  'get /:language(en)': 'HomeController.index'
};
