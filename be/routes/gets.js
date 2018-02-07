var manageDb = require('../db/manageDb');

/* Gets home page */
module.exports.homePage = function(req, res, next) {
  res.render('index');
}

/* Gets list page */
module.exports.listPage = function(req, res, next) {
  var list = req.params.list;

  var threadList;
  var listList;

  manageDb.getThreads(list).then(threads => {
    threadList = threads;
    return manageDb.getLists(list);
  }).then(lists => {
    res.render('list', {
      threadList : threadList,
      boardList : lists,
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

module.exports.loginPage = function(req, res, next) {
  res.render('login');
}
