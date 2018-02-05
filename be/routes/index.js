var express = require('express');
var router = express.Router();
var manageDb = require('../db/manageDb');
var sanitizeHtml = require('sanitize-html');
var util = require('../util');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Creation of a list */
router.post('/site', function(req, res, next) {
  var list = req.body.list;
  var description = req.body.description;
  var owner = req.body.owner;

  manageDb.addList({
    'name': list,
    'description': description,
    'owner': owner
    }).then(b => {
      res.render('index');
    }).catch(err => {
      /* If error, forward it */
      next(err);
    });
});

/* Read tnreads */
router.get('/site/:list/', function(req, res, next) {
  var list = req.params.list;

  manageDb.getThreads(list).then(threads => {
    res.render('list', {
      threadList : threads
    });
  }).catch(err => {
    /* If error, forward it */
    next(err);
  });
});

/* Read thread */
router.get('/site/:list/:thread/', function(req, res, next) {
  var list = req.params.list;
  var thread = req.params.thread;

  manageDb.getPosts(list, thread).then((posts) => {
    /* Split each body by new line */
    for (var i = 0; i < posts.length; i ++) {
      posts[i].text = posts[i].text.split(/\r?\n/g);
    }
    res.render('thread', {
      postList : posts
    });
  }).catch(err => {
    /* If error, forward it */
    next(err);
  });
});

/* Creation of a thread */
router.post('/site/:list/', function(req, res, next) {
  var list = req.params.list;
  //var check = util.checkValues(req.body);

  manageDb.addThread(list, req.body)
    .then(() => {
      res.render('index');
    }).catch(err => {
      next(err);
    });
});

/* Creation of a post */
router.post('/site/:list/:thread/', function(req, res, next) {
  var list = req.params.list;
  var thread = req.params.thread;
  //var check = util.checkValues(req.body);

  /* If conditions are not met */
  if (!check.success) {
    next(check.error);
  }
  else {
    var code = manageDb.addPost(list, thread, req.body).then(() => {
      res.redirect(thread);
    }).catch(err => {
      next(err);
    });
  }
});

module.exports = router;
