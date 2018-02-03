var redis = require('redis');
var client = redis.createClient();
var defaults = require('./defaults');
var sanitizeHtml = require('sanitize-html');

/* Adds new list to database */
module.exports.addList = function (name, description, owner) {
  var nameSanitized = sanitizeHtml(name);
  var nameFormatted = "lists:" + nameSanitized.replace('.', ':');
  var parent = nameFormatted.split(":").slice(0, -1).join(":") + ":*";

  /* Test if it exists */
  client.keys(parent, function (err, reply) {
    if (reply.length > 0) {
      client.hmset(nameFormatted,
        'description', description,
        'owner', owner,
        'type', defaults.type);
    }
  })
}

/* Removes list from database */
module.exports.delList = function (name) {
  var nameSanitized = sanitizeHtml(name);
  var nameFormatted = "lists:" + nameSanitized.replace('.', ':');

  client.del(nameFormatted);
}

/* Gets child lists */
module.exports.getChildLists = function (name, callback) {
  var nameSanitized = sanitizeHtml(name);
  var nameFormatted = "lists:" + nameSanitized.replace('.', ':') + ':*';

  client.keys(nameFormatted, callback);
}

module.exports.getProperties = function (name, callback) {
  var nameSanitized = sanitizeHtml(name);
  var nameFormatted = "lists:" + nameSanitized.replace('.', ':');

  client.hgetall(nameFormatted, callback);
}
