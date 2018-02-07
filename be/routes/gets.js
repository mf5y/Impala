var svgCaptcha = require('svg-captcha');
var manageDb = require('../db/manageDb');
var settings = require('../settings.json');

/* Gets home page */
module.exports.homePage = function(req, res, next) {
  res.render('index');
}

/* Gets list page */
module.exports.listPage = function(req, res, next) {
  var list = req.params.list;

  /* Create and save captcha */
  captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;
  req.session.captchaValid = true;

  manageDb.getThreads(list).then(threads => {
    res.render('list', {
      threadList : threads,
      captchaSvg : settings.showCaptcha ? captcha.data : null
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

  /* Create captcha */
  var captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;
  req.session.captchaValid = true;

  manageDb.getPosts(list, thread).then((posts) => {
    /* All are from the same list so we can just take one */
    var listName = posts[0].list;

    res.render('thread', {
      postList : posts,
      listName : listName,
      captchaSvg : settings.showCaptcha ? captcha.data : null
    });
  }).catch(err => {
    /* If error, forward it */
    next(err);
  });
}
