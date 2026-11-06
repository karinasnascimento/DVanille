const { body } = require('express-validator');

const MAX_QUANTITY_PER_ITEM = 99;

const addItemRules = [
  body('productId').isInt({ min: 1 }).withMessage('productId inválido.').toInt(),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: MAX_QUANTITY_PER_ITEM })
    .withMessage(`quantity deve estar entre 1 e ${MAX_QUANTITY_PER_ITEM}.`)
    .toInt(),
];

const updateQuantityRules = [
  body('quantity')
    .isInt({ min: 1, max: MAX_QUANTITY_PER_ITEM })
    .withMessage(`quantity deve estar entre 1 e ${MAX_QUANTITY_PER_ITEM}. Para remover, use DELETE.`)
    .toInt(),
];

const couponRules = [body('code').isString().trim().isLength({ min: 2, max: 50 }).withMessage('Informe o código do cupom.')];

module.exports = { addItemRules, updateQuantityRules, couponRules };
