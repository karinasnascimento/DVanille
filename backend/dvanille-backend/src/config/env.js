const path = require('path');
require('dotenv').config();

const toInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toFloat = (value, fallback) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBool = (value, fallback) => {
  if (value === undefined || value === '') return fallback;
  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
};

const DEFAULT_JWT_SECRET = 'CHANGE_THIS_SECRET';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const env = {
  nodeEnv,
  isProduction,
  isTest,
  port: toInt(process.env.PORT, 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  corsOrigins,
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
  maxUploadSizeMb: toInt(process.env.MAX_UPLOAD_MB, 5),
  bcryptRounds: toInt(process.env.BCRYPT_ROUNDS, 10),
  trustProxy: toInt(process.env.TRUST_PROXY, 0),
  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 15) * 60 * 1000,
    max: toInt(process.env.RATE_LIMIT_MAX, 300),
    authMax: toInt(process.env.AUTH_RATE_LIMIT_MAX, 20),
  },
  delivery: {
    fee: toFloat(process.env.DELIVERY_FEE, 8),
    freeAboveOrderValue: toFloat(process.env.FREE_DELIVERY_MIN_ORDER, 0),
  },
  loyalty: {
    pointsPerReal: toFloat(process.env.LOYALTY_POINTS_PER_REAL, 1),
  },
  payment: {
    gateway: process.env.PAYMENT_GATEWAY || 'simulated',
    allowSimulation: toBool(process.env.ALLOW_PAYMENT_SIMULATION, true),
  },
};

function validateEnv() {
  const problems = [];

  if (!env.databaseUrl) {
    problems.push('DATABASE_URL não definida.');
  }

  if (isProduction) {
    if (env.jwt.secret === DEFAULT_JWT_SECRET || env.jwt.secret.length < 32) {
      problems.push('JWT_SECRET deve ser definido com pelo menos 32 caracteres em produção.');
    }
    if (env.corsOrigins.includes('*')) {
      problems.push('CORS_ORIGIN não pode conter "*" em produção. Liste as origens permitidas.');
    }
    if (env.corsOrigins.length === 0) {
      problems.push('CORS_ORIGIN deve listar as origens permitidas em produção (Web/Admin).');
    }
  } else if (env.jwt.secret === DEFAULT_JWT_SECRET && !isTest) {
    console.warn('[env] Aviso: JWT_SECRET está com o valor padrão. Defina um segredo próprio no .env.');
  }

  if (problems.length > 0) {
    throw new Error(`Configuração inválida:\n - ${problems.join('\n - ')}`);
  }
}

env.validate = validateEnv;

module.exports = env;
