var manageDb = require('../db/manageDb');

/* Gets home page */
module.exports.homePage = function(req, res, next) {
  res.render('index');
}

/* Gets list page */
module.exports.listPage = function(req, res, next) {
  var list = req.params.list;

  manageDb.getThreads(list).then(threads => {
    res.render('list', {
      threadList : threads,
      settings : req.settings,
      captchaSvg : req.captcha
    });
  }).catch(err => {
    /* If error, forward it */
    next(err);
  });
}

/* Gets thread page */
module.exports.threadPage = function(req, res, next) {
  var list = req.params.list;
  var thread = req.params.thread;

  manageDb.getPosts(list, thread).then((posts) => {
    /* All are from the same list so we can just take one */
    var listName = posts[0].list;

    res.render('thread', {
      postList : posts,
      settings : req.settings,
      captchaSvg : req.captcha
    });
  }).catch(err => {
    /* If error, forward it */
    next(err);
  });
}
