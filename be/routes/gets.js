var manageDb = require('../db/manageDb');

/* Gets home page */
module.exports.homePage = function(req, res, next) {
  res.render('index');
}

/* Gets list page */
module.exports.listPage = function(req, res, next) {
  var list = req.params.list;

  req.renderProperties = {};
  req.template = 'list';

  manageDb.getThreads(list).then(threads => {
    /* Set threads property */
    req.renderProperties.threads = threads;

    /* Get lists */
    return manageDb.getLists(list);
  }).then(lists => {
    /* Set lists property */
    req.renderProperties.lists = lists;

    /* Set misc properties */
    req.renderProperties.settings = req.settings;
    req.renderProperties.captcha = req.captcha;
    req.renderProperties.userinfo = req.userinfo;

    /* Next middleware */
    next();
  }).catch(err => {
    /* If error, forward it */
    next(err);
  });
}

/* Gets thread page */
module.exports.threadPage = function(req, res, next) {
  var list = req.params.list;
  var thread = req.params.thread;

  req.renderProperties = {};
  req.template = 'thread';

  manageDb.getPosts(list, thread).then((posts) => {
    /* Set lists property */
    req.renderProperties.posts = posts;

    /* Set misc properties */
    req.renderProperties.settings = req.settings;
    req.renderProperties.captcha = req.captcha;
    req.renderProperties.userinfo = req.userinfo;

    /* Get thread info */
    return manageDb.getThreadInfo(list, thread);
  }).then((threadInfo) => {
    /* Set property */
    req.renderProperties.threadInfo = threadInfo;

    /* Next middleware */
    next();
  }).catch(err => {
    /* If error, forward it */
    next(err);
  });
}

module.exports.loginPage = function(req, res, next) {
  res.render('login');
}

module.exports.signupPage = function(req, res, next) {
  res.render('login');
}
