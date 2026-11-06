const { body } = require('express-validator');

const PROMOTION_FIELDS = [
  'name',
  'description',
  'code',
  'type',
  'value',
  'startsAt',
  'endsAt',
  'usageLimit',
  'perUserLimit',
  'minOrderValue',
  'isActive',
];

const promotionRules = (required) => {
  const maybe = (chain) => (required ? chain : chain.optional());

  return [
    maybe(body('name')).isString().trim().isLength({ min: 2, max: 120 }).withMessage('Nome deve ter entre 2 e 120 caracteres.'),
    body('description').optional({ values: 'null' }).isString().trim().isLength({ max: 500 }).withMessage('Descrição muito longa (máx. 500).'),
    maybe(body('code'))
      .isString()
      .trim()
      .matches(/^[A-Za-z0-9_-]{3,50}$/)
      .withMessage('Código deve ter 3 a 50 caracteres (letras, números, - ou _).'),
    maybe(body('type')).isIn(['PERCENTAGE', 'FIXED']).withMessage('type deve ser PERCENTAGE ou FIXED.'),
    maybe(body('value')).isFloat({ min: 0.01 }).withMessage('value deve ser maior que zero.').toFloat(),
    maybe(body('startsAt')).isISO8601().withMessage('startsAt deve ser uma data ISO 8601.').toDate(),
    maybe(body('endsAt')).isISO8601().withMessage('endsAt deve ser uma data ISO 8601.').toDate(),
    body('usageLimit').optional({ values: 'null' }).isInt({ min: 1 }).withMessage('usageLimit deve ser um inteiro >= 1.').toInt(),
    body('perUserLimit').optional().isInt({ min: 1, max: 1000 }).withMessage('perUserLimit deve ser um inteiro >= 1.').toInt(),
    body('minOrderValue').optional({ values: 'null' }).isFloat({ min: 0 }).withMessage('minOrderValue deve ser >= 0.').toFloat(),
    body('isActive').optional().isBoolean().withMessage('isActive deve ser true ou false.').toBoolean(),
  ];
};

module.exports = {
  PROMOTION_FIELDS,
  createPromotionRules: promotionRules(true),
  updatePromotionRules: promotionRules(false),
};
