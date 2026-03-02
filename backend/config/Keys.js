require("dotenv").config(); // Load .env variables

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
};
