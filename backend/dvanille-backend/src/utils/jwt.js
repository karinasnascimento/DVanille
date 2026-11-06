const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * O token carrega apenas o mínimo: id do usuário (sub), papel (role) e um id único (jti)
 * usado para encerrar a sessão no logout. Nunca inclui senha ou dados pessoais.
 * A autorização real sempre consulta o usuário no banco (ver authMiddleware).
 */
function signToken(user) {
  return jwt.sign({ role: user.role }, env.jwt.secret, {
    subject: String(user.id),
    expiresIn: env.jwt.expiresIn,
    jwtid: crypto.randomUUID(),
    algorithm: 'HS256',
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwt.secret, { algorithms: ['HS256'] });
}

module.exports = { signToken, verifyToken };
