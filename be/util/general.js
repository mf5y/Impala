var sanitizeHtml = require('sanitize-html');

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

module.exports.hasAdequatePrivileges = function (privilege, target) {
  const privilegeLevels = ['user', 'mod', 'admin'];

  /* True if privilege is greater than or equal to target */
  return privilegeLevels.indexof(privilege) >= privilegeLevels.indexof(target);
}
