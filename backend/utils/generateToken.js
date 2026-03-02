const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/Keys');

const generateToken = (payload) => {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;
