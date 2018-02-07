var settings = require('../settings.json');
var util = require('../util/general.js')
var stringUtil = require('../util/string.js')

/* Sanitize user input fields */
module.exports.sanitizeProperties = function (req, res, next) {
  /* Sanitize parameters */
  req.params = util.sanitize(req.params);

  /* Sanitize body */
  req.body = util.sanitize(req.body);

  /* Continue */
  next();
}

/* Make sure post has no errors */
module.exports.checkPost = function (req, res, next) {
  /* Make sure correct length */
  if (req.body.text.length < settings.minPostSize && settings.minPostSize != 0) {
    var errorMsg = 'Post too short! (minimum ' + settings.minPostSize + ' characters)';
    var error = new Error(errorMsg);

    /* Call error handler */
    next(error);
  }

  if (req.body.text.length > settings.maxPostSize && settings.maxPostSize != 0) {
    var errorMsg = 'Post too long! (maximum ' + settings.maxPostSize + ' characters)';
    var error = new Error(errorMsg);

    /* Call error handler */
    next(error);
  }

  /* Make sure valid e-mail */
  if (settings.checkEmail && !req.body.email.includes('@') || !req.body.email.includes('.')) {
    var errorMsg = 'Invalid e-mail format!';
    var error = new Error(errorMsg);

    /* Call error handler */
    next(error);
  }

  /* Make sure subject exists */
  if (settings.requireSubject && req.body.subject == '') {
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
  if (settings.showCaptcha && !req.session.captchaValid) {
    var errorMsg = 'Expired captcha!';
    var error = new Error(errorMsg);

    req.session.captchaValid = false;

    /* Call error handler */
    next(error);
  }

  /* Captcha correct? */
  if (settings.showCaptcha && req.session.captcha != req.body.captcha) {
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
