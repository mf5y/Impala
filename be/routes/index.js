var express = require('express');
var router = express.Router();
var manageDb = require('../db/manageDb');

/* GET home page. */
router.get('/', function(req, res, next) {
  manageDb.addList("test", "meme", "hi");
  /*manageDb.getProperties("sponge:bob", function (err, reply) {
    console.log(reply);
  });*/
  res.render('index', { title: 'Express' });
});

module.exports = router;
