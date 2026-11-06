const AppError = require('../utils/AppError');

/** Deve ser usado depois de authenticateToken. Exige role = ADMIN. */
function requireAdmin(req, res, next) {
  if (!req.user) return next(AppError.unauthorized('Não autenticado.'));
  if (req.user.role !== 'ADMIN') {
    return next(AppError.forbidden('Acesso restrito a administradores.'));
  }
  return next();
}

module.exports = { requireAdmin };
