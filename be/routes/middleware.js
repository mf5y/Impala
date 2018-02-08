var defaultSettings = require('../settings.json');
var util = require('../util/general');
var stringUtil = require('../util/string');
var svgCaptcha = require('svg-captcha');
var nodeCache = require('node-cache');
var userCrypt = require('../util/usercrypt')
var manageDb = require('../db/manageDb');
var crypto = require('crypto');

const captchaSettings = {
  size : 6,
  noise: 3
}

var settingsCache = new nodeCache({
  stdTTL: 600 /* Ten minute cache */
});

var usersCache = new nodeCache({
  stdTTL: 3600 /* Hour long cache */
})

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

module.exports.render = function (req, res, next) {
  var template = req.template;
  var properties = req.renderProperties;

  /* Render */
  res.render(template, properties);
}

module.exports.hashPassword = function (req, res, next) {
    /* Hash password */
    userCrypt.hashPassword(req.body.password)
      .then(hash => {
        /* Save hashed password */
        req.body.passhash = hash;

        /* Continue */
        next();
      });
}

module.exports.verifyUserInfo = function (req, res, next) {
  if (!req.session.userinfo) {
    /* If user isn't logged in, no user info */
    req.userinfo = {};

    next();
  }
  else {
    var username = req.session.userinfo.username;
    var passhash = req.session.userinfo.passhash;

    /* Check cache */
    var cachedUserInfo = usersCache.get(username);

    /* Miss */
    if (cachedUserInfo == undefined) {
      manageDb.getUserInfo(username)
        .then(info => {
          /* If password is correct, set userinfo */
          if (passhash == info.passhash) {
            /* Set info */
            req.userinfo = info;

            /* Store in cache */
            usersCache.set(username, info);

            /* Continue */
            next();
          }

          else req.userinfo = { };
        });
    }

    /* Hit */
    else {
      req.userinfo = cachedUserInfo;

      /* Continue */
      next();
    }
  }
}

module.exports.applyNameFormatting = function (req, res, next) {
  /* Signed in */
  if (req.userinfo.username != undefined) {
    /* If no username */
    if (req.body.username == '') {
      req.body.username = req.settings.anonymousName;
    }

    /* If auto */
    if (req.body.username == 'auto' ) {
      req.body.username = '<span class=\'user\'>' + req.userinfo.username + '</span>';
    }

    /* Otherwise use the name and hash the tripcode part */
    else req.body.username = req.body.username.replace(/#.*$/g, function (str) {
      return '#' + crypto.createHash('sha256').update(str).digest("base64").substr(0, 8);
    });
  }

  else {
    /* If no username */
    if (req.body.username == '') {
      req.body.username = req.settings.anonymousName;
    }

    /* Otherwise use the name and hash the tripcode part */
    else req.body.username = req.body.username.replace(/#.*$/g, function (str) {
      return '#' + crypto.createHash('sha256').update(str).digest("base64").substr(0, 8);
    });
  }

  /* Continue */
  next();
}

module.exports.assertPermissions = function (permission) {
  return function (req, res, next) {
    var targetPrivilege = req.settings[permission];
    if (!req.userinfo) {
      next(new Error('You must be a ' + targetPrivilege + ' to do that.'));
    }
    else {
      var userPrivilege = req.userinfo.type;

      if (util.hasAdequatePrivileges(userPrivilege, targetPrivilege)) {
        /* Continue */
        next();
      }

      else next(new Error('You must be a(n) ' + targetPrivilege + ' to do that.'));
    }
  }
}
