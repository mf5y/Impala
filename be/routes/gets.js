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
    req.renderProperties.threadList = threads;

    /* Get lists */
    return manageDb.getLists(list);
  }).then(lists => {
    /* Set lists property */
    req.renderProperties.boardList = lists;

    /* Set misc properties */
    req.renderProperties.settings = req.settings;
    req.renderProperties.svgCaptcha = req.captcha;

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
    req.renderProperties.postList = posts;

    /* Set misc properties */
    req.renderProperties.settings = req.settings;
    req.renderProperties.svgCaptcha = req.captcha;

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
