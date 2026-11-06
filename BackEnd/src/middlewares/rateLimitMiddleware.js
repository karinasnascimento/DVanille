const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const buildLimiter = ({ max, message }) =>
  rateLimit({
    windowMs: env.rateLimit.windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.isTest,
    message: { success: false, message, errors: [] },
  });

/** Limite geral da API (por IP). */
const apiLimiter = buildLimiter({
  max: env.rateLimit.max,
  message: 'Muitas requisições. Tente novamente em alguns minutos.',
});

/** Limite mais rígido para login/cadastro (reduz força bruta). */
const authLimiter = buildLimiter({
  max: env.rateLimit.authMax,
  message: 'Muitas tentativas de autenticação. Tente novamente em alguns minutos.',
});

module.exports = { apiLimiter, authLimiter };
