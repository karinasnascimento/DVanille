const { Prisma } = require('@prisma/client');
const env = require('../config/env');
const AppError = require('../utils/AppError');

function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

/** Traduz erros conhecidos (Prisma, JWT, JSON, upload) em AppError. */
function normalizeError(error) {
  if (error instanceof AppError) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : error.meta?.target;
        return AppError.conflict('Já existe um registro com estes dados.', target ? [{ field: String(target) }] : []);
      }
      case 'P2025':
        return AppError.notFound('Registro não encontrado.');
      case 'P2003':
        return AppError.conflict('Operação não permitida: existem registros relacionados.');
      case 'P2034':
        return AppError.conflict('Conflito de concorrência. Tente novamente.');
      default:
        return new AppError('Erro ao acessar o banco de dados.', 500);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return AppError.badRequest('Dados inválidos para a operação.');
  }

  if (error.name === 'MulterError') {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? `Arquivo muito grande. Tamanho máximo: ${env.maxUploadSizeMb} MB.`
        : 'Erro no envio do arquivo.';
    return AppError.unprocessable(message);
  }

  if (error.type === 'entity.parse.failed' || (error instanceof SyntaxError && 'body' in error)) {
    return AppError.badRequest('JSON inválido no corpo da requisição.');
  }

  if (error.type === 'entity.too.large') {
    return new AppError('Corpo da requisição muito grande.', 413);
  }

  if (error.message === 'CORS_ORIGIN_NOT_ALLOWED') {
    return AppError.forbidden('Origem não permitida pelo CORS.');
  }

  return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  const normalized = normalizeError(error);

  if (!normalized) {
    console.error('[erro inesperado]', error);
    const body = {
      success: false,
      message: 'Erro interno do servidor.',
      errors: [],
    };
    if (!env.isProduction) body.stack = error.stack;
    return res.status(500).json(body);
  }

  if (normalized.statusCode >= 500) {
    console.error('[erro]', error);
  }

  return res.status(normalized.statusCode).json({
    success: false,
    message: normalized.message,
    errors: normalized.errors || [],
  });
}

module.exports = { notFoundHandler, errorHandler };
