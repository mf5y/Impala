var manageDb = require('../db/manageDb');

/* Creation of a list */
module.exports.makeList = function(req, res, next) {
  manageDb.addList(req.body).then(b => {
      res.render('index');
    }).catch(err => {
      /* If error, forward it */
      next(err);
    });
}

/* Creation of a thread */
module.exports.makeThread = function(req, res, next) {
  var list = req.params.list;

  manageDb.addThread(list, req.body)
    .then(code => {
      res.redirect(list + '/' + code);
    }).catch(err => {
      next(err);
    });
}

/* Creation of a post */
module.exports.makePost = function(req, res, next) {
  var list = req.params.list;
  var thread = req.params.thread;

  var code = manageDb.addPost(list, thread, req.body).then(code => {
    res.redirect(thread + '#' + code);
  }).catch(err => {
    next(err);
  });
}
