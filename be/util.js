var settings = require('./settings.json');
var sanitizeHtml = require('sanitize-html');

module.exports.checkValues = function (properties) {
  var error = new Error();
  error.status = 400;

  /* Make sure correct length */
  if (properties.text.length < settings.minPostSize && settings.minPostSize != 0) {
    error.message = 'Post too short! (minimum ' + settings.minPostSize + ' characters)';
    return { success: false, error: error };
  }

  if (properties.text.length > settings.maxPostSize && settings.maxPostSize != 0) {
    error.message = 'Post too long! (maximum ' + settings.maxPostSize + ' characters)';
    return { success: false, error: error };
  }

  /* Make sure valid e-mail */
  if (settings.checkEmail && !properties.email.includes('@') || !properties.email.includes('.')) {
    error.status = 'Invalid e-mail format!';
    return { success: false, error: error };
  }

  /* Make sure subject exists */
  if (settings.requireSubject && properties.subject == '') {
    error.status = 'Subject required!';
    return { success: false, error: error };
  }

  return { success: true };
}

/* Sanitize each property */
module.exports.sanitize = function (properties) {
  /* Get all properties */
  var propertiesKeys = Object.keys(properties);
  /* Sanitize each iteratively */
  for (var i = 0; i < propertiesKeys.length; i ++) {
    var key = propertiesKeys[i];
    /* Sanitize */
    properties[key] = sanitizeHtml(properties[key]);
  }

  return properties;
}
