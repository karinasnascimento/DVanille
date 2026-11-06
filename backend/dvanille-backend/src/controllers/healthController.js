const prisma = require('../config/database');

/** GET /api/health - verifica API e conexão com o MySQL. */
async function checkHealth(req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      success: true,
      message: "D'Vanille API funcionando.",
      database: 'connected',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[health] Falha ao consultar o banco:', error.message);
    return res.status(503).json({
      success: false,
      message: "D'Vanille API no ar, mas o banco de dados está indisponível.",
      database: 'disconnected',
      errors: [],
    });
  }
}

module.exports = { checkHealth };
