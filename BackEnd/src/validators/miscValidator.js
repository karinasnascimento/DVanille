const { body, query } = require('express-validator');
const { paginationQuery } = require('./commonValidator');

const favoriteRules = [body('productId').isInt({ min: 1 }).withMessage('productId inválido.').toInt()];

const listNotificationsRules = [
  ...paginationQuery,
  query('unread').optional().isBoolean().withMessage('unread deve ser true ou false.'),
];

const broadcastRules = [
  body('title').isString().trim().isLength({ min: 2, max: 160 }).withMessage('Título deve ter entre 2 e 160 caracteres.'),
  body('message').isString().trim().isLength({ min: 2, max: 500 }).withMessage('Mensagem deve ter entre 2 e 500 caracteres.'),
  body('type').optional().isIn(['PROMOTION', 'SYSTEM']).withMessage('type deve ser PROMOTION ou SYSTEM.'),
];

const rewardRules = (required) => {
  const maybe = (chain) => (required ? chain : chain.optional());
  return [
    maybe(body('name')).isString().trim().isLength({ min: 2, max: 120 }).withMessage('Nome deve ter entre 2 e 120 caracteres.'),
    body('description').optional({ values: 'null' }).isString().trim().isLength({ max: 500 }).withMessage('Descrição muito longa (máx. 500).'),
    maybe(body('pointsCost')).isInt({ min: 1 }).withMessage('pointsCost deve ser um inteiro >= 1.').toInt(),
    body('isActive').optional().isBoolean().withMessage('isActive deve ser true ou false.').toBoolean(),
  ];
};

const validatePromotionRules = [body('code').isString().trim().isLength({ min: 2, max: 50 }).withMessage('Informe o código do cupom.')];

module.exports = {
  favoriteRules,
  listNotificationsRules,
  broadcastRules,
  createRewardRules: rewardRules(true),
  updateRewardRules: rewardRules(false),
  validatePromotionRules,
};
