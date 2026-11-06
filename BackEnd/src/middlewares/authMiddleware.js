const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');

function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

/**
 * Exige um JWT válido (Authorization: Bearer <token>).
 * Confere se o token não foi encerrado (logout) e recarrega o usuário do banco,
 * de modo que mudanças de papel/desativação valem imediatamente.
 */
const authenticateToken = asyncHandler(async (req, res, next) => {
  const token = extractBearerToken(req);
  if (!token) throw AppError.unauthorized('Token de autenticação não informado.');

  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token expirado. Faça login novamente.' : 'Token inválido.';
    throw AppError.unauthorized(message);
  }

  const revoked = await prisma.revokedToken.findUnique({ where: { jti: payload.jti } });
  if (revoked) throw AppError.unauthorized('Sessão encerrada. Faça login novamente.');

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!user) throw AppError.unauthorized('Usuário do token não existe mais.');
  if (!user.isActive) throw AppError.forbidden('Conta desativada. Entre em contato com o suporte.');

  req.user = user;
  req.token = { jti: payload.jti, exp: payload.exp };
  next();
});

module.exports = { authenticateToken };
