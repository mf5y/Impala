var manageDb = require('../db/manageDb');

module.exports.deleteThread = function (req, res, next) {
  var list = req.params.list;
  var thread = req.params.thread;

  manageDb.deleteThread(list, thread)
    .then(() => {
      res.redirect('');
    });
}

module.exports.deletePost = function (req, res, next) {
  var list = req.params.list;
  var thread = req.params.thread;
  var id = req.params.id;

  manageDb.deletePost(list, thread, id)
    .then(() => {
      res.redirect('');
    });
}
