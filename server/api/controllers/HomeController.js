/*
 *
*/
'use strict';

module.exports = {
  index: function (req, res) {
    var context;
    var modelFactory = new ModelFactory(req.language);
    modelFactory.getContext()
      .then(function (_context) {
        context = _context;
        res.render('index', context);
      });
  },
  heartbeat: function (req, res) {
    res.json('ok');
  }
};