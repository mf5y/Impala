var mongoClient = require('mongodb');
var defaults = require('./defaults');
var util = require('../util');
var base32 = require('base32');
var randomBytes = require('random-bytes');
var sanitizeHtml = require('sanitize-html');

const url = 'mongodb://localhost:27017';

function checkDocumentExists (callback) {

}

/* Adds list to database */
module.exports.addList = function (properties) {
  /* Sanitize */
  var propertiesSanitized = util.sanitize(properties);

  var description = propertiesSanitized.owner;
  var owner = propertiesSanitized.owner;

  /* Remove special characters */
  var name = propertiesSanitized.name.replace(/[^\w\s\.]/gi, '');
  /* Remove last dot */
  var parent = name.split('.').slice(0, -1).join('.');

  return mongoClient.connect(url)
    .then(client => {
      /* Lists collection */
      var db = client.db('local');
      var lists = db.collection('lists');

      /* Find parent */
      return lists.find({
        'name' : parent
      }).toArray()
        .then(parent => {
          /* If parent exists */
          if (parent.length > 0) {
            var list = { 'name': name,
              'description': description,
              'owner': owner };
            /* Add list */
            return lists.update(list,
              list,
              { 'upsert' : true });
          }
          /* Otherwise throw error */
          else return Promise.reject(new Error ('Parent list not found!'))
        });
    });
}

/* Removes list from database */
module.exports.delList = function (name) {
  /* Sanitize */
  var nameSanitized = sanitizeHtml(name);

  return mongoClient.connect(url)
    .then(client => {
      /* Lists collection */
      var db = client.db('local');
      var lists = db.collection('lists');

      return lists.deleteOne({ 'name' : nameSanitized });
    })
}

/* Adds thread to database */
module.exports.addThread = function (list, properties) {
  /* Random code */
  var code = base32.encode(randomBytes.sync(8));

  /* Sanitize */
  var propertiesSanitized = util.sanitize(properties);

  var listSanitized = sanitizeHtml(list);

  /* Variables */
  var date = new Date();

  var name = propertiesSanitized.name;
  var text = propertiesSanitized.text;
  var email = propertiesSanitized.email;
  var subject = propertiesSanitized.subject;

  return mongoClient.connect(url)
    .then(client => {
      /* Posts collection */
      var db = client.db('local');
      var posts = db.collection('posts');
      var threads = db.collection('threads');

      /* Insert thread */
      return threads
        .insert({
          'list': listSanitized,
          'id': code,
          'author': name,
          'subject': subject,
          'bump': date,
          'bumper': name
        }).then(() => {
          /* Insert post */
          return posts.insert({
            'list': listSanitized,
            'id': code,
            'threadID': code,
            'name': name,
            'text': text,
            'email': email,
            'subject': subject,
            'date': date
          });
        });
    });
}
/* Adds post to database */
module.exports.addPost = function (list, thread, properties) {
  /* Random code */
  var code = base32.encode(randomBytes.sync(8));

  /* Sanitize */
  var propertiesSanitized = util.sanitize(properties);

  var listSanitized = sanitizeHtml(list);
  var threadSanitized = sanitizeHtml(thread);

  /* Variables */
  var date = new Date();

  var name = propertiesSanitized.name;
  var text = propertiesSanitized.text;
  var email = propertiesSanitized.email;
  var subject = propertiesSanitized.subject;

  return mongoClient.connect(url)
    .then(client => {
      /* Posts collection */
      var db = client.db('local');
      var posts = db.collection('posts');
      var threads = db.collection('threads');

      /* Make sure thread exists */
      return threads.find({
        'id': threadSanitized,
        'list': listSanitized
      }).toArray()
        .then(threads => {
          /* If parent exists */
          if (threads.length > 0) {
            /* Add list */
            return posts.insert({
              'list': listSanitized,
              'id': code,
              'threadID': threadSanitized,
              'name': name,
              'text': text,
              'email': email,
              'subject': subject,
              'date': date
            });
          }
          /* Otherwise throw error */
          else return Promise.reject(new Error ('Thread not found!'))
        }).then(() => {
          /* Update thread */
          return threads.update({
            'id': threadSanitized,
            'list': listSanitized
          }, {
            $set: {
              'bump': date,
              'bumper': name
            }
          })
        });
    });
}

/* Get threads in list */
module.exports.getThreads = function(list) {
  /* Sanitize */
  var listSanitized = sanitizeHtml(list);

  return mongoClient.connect(url)
    .then(client => {
      /* Posts collection */
      var db = client.db('local');
      var threads = db.collection('threads');

      /* Get threads */
      return threads.find({
        'list': listSanitized
      }).toArray();
    });
}

/* Get posts in thread */
module.exports.getPosts = function(list, thread) {
  /* Sanitize */
  var listSanitized = sanitizeHtml(list);
  var threadSanitized = sanitizeHtml(thread);

  return mongoClient.connect(url)
    .then(client => {
      /* Posts collection */
      var db = client.db('local');
      var posts = db.collection('posts');

      /* Get posts */
      return posts.find({
        'list': listSanitized,
        'threadID': threadSanitized
      }).sort({ date: 1 })
        .toArray().then(threadPosts => {
        /* If there are posts */
        if (threadPosts.length > 0) {
          return Promise.resolve(threadPosts);
        }
        /* Otherwise error */
        else return Promise.reject(new Error ('Thread not found!'));
      });
    });
}
