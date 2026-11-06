const { body, query } = require('express-validator');
const { ORDER_STATUSES } = require('../utils/orderStatus');
const { paginationQuery } = require('./commonValidator');

const DELIVERY_TYPES = ['DELIVERY', 'PICKUP'];
const PAYMENT_METHODS = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH'];
const PAYMENT_STATUSES = ['PENDING', 'APPROVED', 'DECLINED', 'REFUNDED'];
const CARD_METHODS = ['CREDIT_CARD', 'DEBIT_CARD'];

const deliveryRules = [
  body('deliveryType').isIn(DELIVERY_TYPES).withMessage('deliveryType deve ser DELIVERY ou PICKUP.'),
  body('addressId')
    .if(body('deliveryType').equals('DELIVERY'))
    .exists({ values: 'falsy' })
    .withMessage('addressId é obrigatório para entrega (DELIVERY).')
    .bail()
    .isInt({ min: 1 })
    .withMessage('addressId inválido.')
    .toInt(),
  body('couponCode').optional({ values: 'falsy' }).isString().trim().isLength({ max: 50 }).withMessage('Cupom inválido.'),
];

const quoteOrderRules = deliveryRules;

const createOrderRules = [
  ...deliveryRules,
  body('paymentMethod').isIn(PAYMENT_METHODS).withMessage(`paymentMethod deve ser: ${PAYMENT_METHODS.join(', ')}.`),
  body('notes').optional({ values: 'falsy' }).isString().trim().isLength({ max: 500 }).withMessage('Observações: máximo de 500 caracteres.'),

  // Dados do cartão: validados aqui, usados só na autorização e NUNCA armazenados.
  body('card')
    .if(body('paymentMethod').isIn(CARD_METHODS))
    .exists()
    .withMessage('Informe os dados do cartão (card).'),
  body('card.number')
    .if(body('paymentMethod').isIn(CARD_METHODS))
    .customSanitizer((value) => String(value || '').replace(/[\s-]/g, ''))
    .matches(/^\d{13,19}$/)
    .withMessage('Número do cartão inválido.'),
  body('card.holderName')
    .if(body('paymentMethod').isIn(CARD_METHODS))
    .isString()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Nome impresso no cartão inválido.'),
  body('card.expiryMonth')
    .if(body('paymentMethod').isIn(CARD_METHODS))
    .isInt({ min: 1, max: 12 })
    .withMessage('Mês de validade inválido.')
    .toInt(),
  body('card.expiryYear')
    .if(body('paymentMethod').isIn(CARD_METHODS))
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 })
    .withMessage('Ano de validade inválido.')
    .toInt(),
  body('card.cvv')
    .if(body('paymentMethod').isIn(CARD_METHODS))
    .matches(/^\d{3,4}$/)
    .withMessage('CVV inválido.'),
];

const updateOrderStatusRules = [
  body('status').isIn(ORDER_STATUSES).withMessage(`status deve ser: ${ORDER_STATUSES.join(', ')}.`),
  body('note').optional({ values: 'falsy' }).isString().trim().isLength({ max: 255 }).withMessage('Observação: máximo de 255 caracteres.'),
];

const listOrdersRules = [
  ...paginationQuery,
  query('status').optional().isIn(ORDER_STATUSES).withMessage('status inválido.'),
  query('paymentStatus').optional().isIn(PAYMENT_STATUSES).withMessage('paymentStatus inválido.'),
  query('deliveryType').optional().isIn(DELIVERY_TYPES).withMessage('deliveryType inválido.'),
  query('dateFrom').optional().isISO8601().withMessage('dateFrom deve ser uma data ISO 8601.'),
  query('dateTo').optional().isISO8601().withMessage('dateTo deve ser uma data ISO 8601.'),
];

module.exports = {
  quoteOrderRules,
  createOrderRules,
  updateOrderStatusRules,
  listOrdersRules,
};
