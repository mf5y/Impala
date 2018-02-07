var defaultSettings = require('../settings.json');
var util = require('../util/general.js');
var stringUtil = require('../util/string.js');
var svgCaptcha = require('svg-captcha');
var nodeCache = require('node-cache');
var manageDb = require('../db/manageDb');

const captchaSettings = {
  size : 6,
  noise: 3
}

var settingsCache = new nodeCache();

module.exports.getSettings = function (req, res, next) {
  var list = req.params.list;

  /* Get from cache */
  var settings = settingsCache.get(list);

  /* In the case of a cache miss */
  if (settings == undefined) {
    manageDb.getListSettings(list).then(listSettings => {
      /* Cache */
      settingsCache.set(list, listSettings);

      /* Set and continue */
      req.settings = Object.assign(defaultSettings, listSettings);
      next();
    }).catch(err => {
      /* If error, forward it */
      next(err);
    });
  }
  else {
    /* Set and continue */
    req.settings = Object.assign(defaultSettings, settings);
    next();
  }
}

/* Sanitize user input fields */
module.exports.sanitizeProperties = function (req, res, next) {
  /* Sanitize parameters */
  req.params = util.sanitize(req.params);

  /* Sanitize body */
  req.body = util.sanitize(req.body);

  /* Continue */
  next();
}

module.exports.generateCaptcha = function (req, res, next) {
  /* Create and save captcha */
  var captcha = svgCaptcha.create(captchaSettings);

  /* Save correct answer and set the captcha as valid */
  req.session.captcha = captcha.text;
  req.session.captchaValid = true;

  /* Pass captcha picture to next function */
  req.captcha = captcha.data;

  /* Continue */
  next();
}

/* Make sure post has no errors */
module.exports.checkPost = function (req, res, next) {
  /* Make sure correct length */
  if (req.body.text.length < req.settings.minPostSize && req.settings.minPostSize != 0) {
    var errorMsg = 'Post too short! (minimum ' + req.settings.minPostSize + ' characters)';
    var error = new Error(errorMsg);

    /* Call error handler */
    next(error);
  }

  if (req.body.text.length > req.settings.maxPostSize && req.settings.maxPostSize != 0) {
    var errorMsg = 'Post too long! (maximum ' + req.settings.maxPostSize + ' characters)';
    var error = new Error(errorMsg);

    /* Call error handler */
    next(error);
  }

  /* Make sure valid e-mail */
  if (req.settings.checkEmail && !req.body.email.includes('@') || !req.body.email.includes('.')) {
    var errorMsg = 'Invalid e-mail format!';
    var error = new Error(errorMsg);

    /* Call error handler */
    next(error);
  }

  /* Make sure subject exists */
  if (req.settings.requireSubject && req.body.subject == '') {
    var errorMsg = 'Subject required!';
    var error = new Error(errorMsg);

    /* Call error handler */
    next(error);
  }

  /* No errors, next middleware. */
  next();
}

/* Make sure captcha is correct */
module.exports.checkCaptcha = function (req, res, next) {
  if (req.settings.showCaptcha && !req.session.captchaValid) {
    var errorMsg = 'Expired captcha!';
    var error = new Error(errorMsg);

    req.session.captchaValid = false;

    /* Call error handler */
    next(error);
  }

  /* Captcha correct? */
  if (req.settings.showCaptcha && req.session.captcha != req.body.captcha) {
    var errorMsg = 'Wrong captcha!';
    var error = new Error(errorMsg);

    req.session.captchaValid = false;

    /* Call error handler */
    next(error);
  }

  /* No errors, next middleware */
  next();
}

/* Invalidate captcha */
module.exports.invalidateCaptcha = function (req, res, next) {
  /* Invalidate */
  req.session.captchaValid = false;

  /* Continue */
  next();
}

module.exports.applyFormatting = function (req, res, next) {
  /* Get post text */
  var text = req.body.text;

  /* Format it */
  text = stringUtil.splitAndFormat(text);

  /* Replace the old */
  req.body.text = text;

  /* Continue */
  next();
}
