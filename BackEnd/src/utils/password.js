const bcrypt = require('bcryptjs');
const env = require('../config/env');

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, env.bcryptRounds);
}

async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

module.exports = { hashPassword, comparePassword };
