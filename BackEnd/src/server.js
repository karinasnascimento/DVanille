const env = require('./config/env');

try {
  env.validate();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const app = require('./app');
const prisma = require('./config/database');

async function start() {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('[server] Não foi possível conectar ao MySQL. Verifique DATABASE_URL e se o banco está no ar.');
    console.error(error.message);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`[server] D'Vanille API (${env.nodeEnv}) em http://localhost:${env.port}`);
    console.log(`[server] Documentação: http://localhost:${env.port}/api/docs`);
  });

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[server] ${signal} recebido. Encerrando...`);

    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandledRejection:', reason);
});

start();
