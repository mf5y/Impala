var mongoClient = require('mongodb');
var base32 = require('base32');
var randomBytes = require('random-bytes');

const url = 'mongodb://localhost:27017';

/* Adds list to database */
module.exports.addList = function (properties) {
  var description = properties.owner;
  var owner = properties.owner;

  /* Remove special characters */
  var name = properties.name.replace(/[^\w\s\.]/gi, '');
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
module.exports.delList = function (list) {

  return mongoClient.connect(url)
    .then(client => {
      /* Lists collection */
      var db = client.db('local');
      var lists = db.collection('lists');

      return lists.deleteOne({ 'name' : list });
    })
}

/* Adds thread to database */
module.exports.addThread = function (list, properties) {
  /* Random code */
  var code = base32.encode(randomBytes.sync(8));

  /* Variables */
  var date = new Date();

  var name = properties.name;
  var text = properties.text;
  var email = properties.email;
  var subject = properties.subject;

  return mongoClient.connect(url)
    .then(client => {
      /* Posts collection */
      var db = client.db('local');
      var posts = db.collection('posts');
      var threads = db.collection('threads');

      /* Insert thread */
      return threads
        .insert({
          'list': list,
          'id': code,
          'author': name,
          'subject': subject,
          'bump': date,
          'bumper': name
        }).then(() => {
          /* Insert post */
          return posts.insert({
            'list': list,
            'id': code,
            'threadID': code,
            'name': name,
            'text': text,
            'email': email,
            'subject': subject,
            'date': date
          });
        }).then(() => {
          /* Return code */
          return Promise.resolve(code);
        });
    });
}
/* Adds post to database */
module.exports.addPost = function (list, thread, properties) {
  /* Random code */
  var code = base32.encode(randomBytes.sync(8));

  /* Variables */
  var date = new Date();

  var name = properties.name;
  var text = properties.text;
  var email = properties.email;
  var subject = properties.subject;

  return mongoClient.connect(url)
    .then(client => {
      /* Posts collection */
      var db = client.db('local');
      var posts = db.collection('posts');
      var threads = db.collection('threads');

      /* Make sure thread exists */
      return threads.find({
        'id': thread,
        'list': list
      }).toArray()
        .then(threads => {
          /* If parent exists */
          if (threads.length > 0) {
            /* Add list */
            return posts.insert({
              'list': list,
              'id': code,
              'threadID': thread,
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
            'id': thread,
            'list': list
          }, {
            $set: {
              'bump': date,
              'bumper': name
            }
          })
        }).then(() => {
          /* Return code */
          return Promise.resolve(code);
        });
    });
}

/* Get threads in list */
module.exports.getThreads = function(list) {
  return mongoClient.connect(url)
    .then(client => {
      /* Posts collection */
      var db = client.db('local');
      var threads = db.collection('threads');

      /* Get threads */
      return threads.find({
        'list': list
      }).sort({ bump: -1 }).toArray();
    });
}

/* Get posts in thread */
module.exports.getPosts = function(list, thread) {
  return mongoClient.connect(url)
    .then(client => {
      /* Posts collection */
      var db = client.db('local');
      var posts = db.collection('posts');

      /* Get posts */
      return posts.find({
        'list': list,
        'threadID': thread
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

/* Get list settings */
module.exports.getListSettings = function(list) {
  return mongoClient.connect(url)
    .then(client => {
      /* Lists collection */
      var db = client.db('local');
      var lists = db.collection('lists');

      return lists.find({
        'name': list
      }).toArray();
    })
}
