const { param, query } = require('express-validator');

/** Valida um parâmetro de rota inteiro positivo e o converte para Number. */
const idParam = (name = 'id') => [
  param(name).isInt({ min: 1 }).withMessage(`"${name}" deve ser um número inteiro positivo.`).toInt(),
];

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page deve ser um inteiro >= 1.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit deve estar entre 1 e 100.'),
];

module.exports = { idParam, paginationQuery };
