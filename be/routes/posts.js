var manageDb = require('../db/manageDb');
var userCrypt = require('../util/usercrypt');

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

  manageDb.addPost(list, thread, req.body)
    .then(code => {
      res.redirect(thread + '#' + code);
    }).catch(err => {
      next(err);
    });
}

/* Creation of an account */
module.exports.makeAccount = function (req, res, next) {
  manageDb.addUser(req.body)
    .then(() => {
      res.redirect('/site');
    }).catch(err => {
      next(err);
    })
}

/* Logging in */
module.exports.logIn = function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  var info;

  manageDb.getUserInfo(username)
    .then(infoFound => {
      info = infoFound;

      return userCrypt.comparePassword(password, info.passhash);
    }).then(correct => {
      if (correct) {
        req.session.userinfo = info;
        res.redirect('/site');
      }
      /* Wrong password */
      else return Promise.reject(new Error('Wrong password!'));
    }).catch(err => {
      next(err);
    })
}

module.exports.lockThread = function (req, res, next) {
  var list = req.params.list;
  var thread = req.params.thread;

  manageDb.lockThread(list, thread)
    .then(() => {
      res.redirect('');
    });
}

module.exports.unlockThread = function (req, res, next) {
  var list = req.params.list;
  var thread = req.params.thread;

  manageDb.unlockThread(list, thread)
    .then(() => {
      res.redirect('');
    });
}

module.exports.stickyThread = function (req, res, next) {
  var list = req.params.list;
  var thread = req.params.thread;

  manageDb.stickyThread(list, thread)
    .then(() => {
      res.redirect('');
    });
}

module.exports.unstickyThread = function (req, res, next) {
  var list = req.params.list;
  var thread = req.params.thread;

  manageDb.unstickyThread(list, thread)
    .then(() => {
      res.redirect('');
    });
}
