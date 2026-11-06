const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const routes = require('./routes');
const buildOpenApiSpec = require('./docs/openapi');
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');
const { ensureUploadDirs } = require('./utils/storage');

/**
 * CORS: apps Flutter mobile não enviam o header "Origin", então passam direto.
 * Navegadores (site, painel admin, Flutter Web) precisam estar listados em CORS_ORIGIN.
 * Fora de produção, se a lista estiver vazia, qualquer origem é aceita para facilitar o desenvolvimento.
 */
function buildCorsOptions() {
  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (env.corsOrigins.includes(origin)) return callback(null, true);
      if (!env.isProduction && env.corsOrigins.length === 0) return callback(null, true);
      return callback(new Error('CORS_ORIGIN_NOT_ALLOWED'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  };
}

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (env.trustProxy > 0) app.set('trust proxy', env.trustProxy);

  // O Swagger UI usa scripts/estilos inline; as imagens de /uploads precisam ser lidas por outras origens (site/app).
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
        },
      },
    })
  );
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  ensureUploadDirs();
  app.use('/uploads', express.static(env.uploadDir, { index: false, dotfiles: 'deny', maxAge: env.isProduction ? '7d' : 0 }));

  // Documentação interativa (Swagger/OpenAPI)
  const openApiSpec = buildOpenApiSpec();
  app.get('/api/docs.json', (req, res) => res.json(openApiSpec));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: "D'Vanille API" }));

  app.use('/api', apiLimiter, routes);

  app.get('/', (req, res) => {
    res.json({ success: true, message: "D'Vanille API", docs: '/api/docs', health: '/api/health' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
