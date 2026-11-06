const { body, query } = require('express-validator');
const { paginationQuery } = require('./commonValidator');

const createReviewRules = [
  body('productId').isInt({ min: 1 }).withMessage('productId inválido.').toInt(),
  body('orderId').optional({ values: 'null' }).isInt({ min: 1 }).withMessage('orderId inválido.').toInt(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating deve ser um inteiro de 1 a 5.').toInt(),
  body('comment').optional({ values: 'null' }).isString().trim().isLength({ max: 1000 }).withMessage('Comentário: máximo de 1000 caracteres.'),
];

const updateReviewRules = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('rating deve ser um inteiro de 1 a 5.').toInt(),
  body('comment').optional({ values: 'null' }).isString().trim().isLength({ max: 1000 }).withMessage('Comentário: máximo de 1000 caracteres.'),
];

const listReviewsRules = [
  ...paginationQuery,
  query('productId').optional().isInt({ min: 1 }).withMessage('productId inválido.'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('rating deve ser de 1 a 5.'),
];

module.exports = { createReviewRules, updateReviewRules, listReviewsRules };
