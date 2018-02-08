var bcrypt = require('bcrypt');

const saltRounds = 5;

module.exports.hashPassword = function (password) {
  return bcrypt.hash(password, saltRounds);
}

module.exports.comparePassword = function (password, hash) {
  return bcrypt.compare(password, hash);
}
