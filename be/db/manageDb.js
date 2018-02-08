var mongoClient = require('mongodb');
var base32 = require('base32');
var randomBytes = require('random-bytes');

const url = 'mongodb://localhost:27017';

/* Adds list to database */
module.exports.addList = function (properties) {
  var description = properties.owner;
  var owner = properties.owner;
  var name = properties.name;

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

/* Adds thread to database */
module.exports.addThread = function (list, properties) {
  /* Random code */
  var code = base32.encode(randomBytes.sync(8));

  /* Variables */
  var date = new Date();

  var username = properties.username;
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
          'author': username,
          'subject': subject,
          'bump': date,
          'bumper': username,
          'stickied': false,
          'locked': false
        }).then(() => {
          /* Insert post */
          return posts.insert({
            'list': list,
            'id': code,
            'threadID': code,
            'author': username,
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

  var username = properties.username;
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
        .then(threadsFound => {
          /* If parent exists */
          if (threadsFound.length == 1) {
            /* And isn't locked */
            if (!threadsFound[0].locked) {
              /* Add post */
              return posts.insert({
                'list': list,
                'id': code,
                'threadID': thread,
                'author': username,
                'text': text,
                'email': email,
                'subject': subject,
                'date': date
              });
            }
            /* Otherwise throw error */
            else return Promise.reject(new Error ('Thread locked!'))
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
              'bumper': username
            }
          })
        }).then(() => {
          /* Return code */
          return Promise.resolve(code);
        });
    });
}


module.exports.addUser = function (properties) {
  var username = properties.username;
  var passhash = properties.passhash;

  return mongoClient.connect(url)
    .then(client => {
      /* Users collection */
      var db = client.db('local');
      var users = db.collection('users');

      return users.find({
        'username' : username
      }).toArray()
        .then(usersFound => {
            /* Make sure user doesn't exist already*/
          if (usersFound.length == 0) {
            return users.insert({
              'username' : username,
              'passhash' : passhash,
              'type' : 'user'
            });
          }
          /* Otherwise throw error */
          else return Promise.reject(new Error ('Username taken!'));
        });
    });
}

/* Get child lists */
module.exports.getLists = function (parent) {
  var parentEscaped = parent.replace('.', '\\.');
  var regex = new RegExp('^' + parentEscaped + '\\.[a-z]*$');

  return mongoClient.connect(url)
    .then(client => {
      /* Lists collection */
      var db = client.db('local');
      var lists = db.collection('lists');

      /* Get child lists */
      return lists.find({
        'name': regex
      }).toArray();
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
      }).sort(
      {
        stickied : -1,
        bump: -1
      }).toArray();
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
      }).toArray().then(lists => {
        /* If there are posts */
        if (lists.length > 0) {
          return Promise.resolve(lists[0]);
        }
        /* Otherwise error */
        else return Promise.reject(new Error ('List not found!'));
      });
    });
}

/* Get user data */
module.exports.getUserInfo = function(username) {
  return mongoClient.connect(url)
    .then(client => {
      /* Users collection */
      var db = client.db('local');
      var users = db.collection('users');

      return users.find({
        'username': username
      }).toArray().then(users => {
        /* If there is a user */
        if (users.length > 0) {
          return Promise.resolve(users[0]);
        }
        /* Otherwise error */
        else return Promise.reject(new Error ('User not found!'));
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
