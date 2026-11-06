const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/** Converte os erros do express-validator em uma resposta 422 padronizada. */
function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((error) => ({
    field: error.path,
    message: error.msg,
    location: error.location,
  }));

  return next(AppError.unprocessable('Dados inválidos.', errors));
}

module.exports = { validate };
