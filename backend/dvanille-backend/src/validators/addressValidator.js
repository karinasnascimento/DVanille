const { body } = require('express-validator');

const ADDRESS_FIELDS = [
  'label',
  'recipientName',
  'street',
  'number',
  'complement',
  'neighborhood',
  'city',
  'state',
  'zipCode',
  'reference',
  'isDefault',
];

/**
 * required: campo obrigatório na criação (na edição vira opcional).
 * mandatory: campo nunca pode ficar vazio nem nulo (complement/reference podem).
 */
const text = (field, { max, required, mandatory = true }) => {
  const chain = body(field);
  let base = chain;
  if (!required) base = mandatory ? chain.optional() : chain.optional({ values: 'null' });

  return base
    .isString()
    .withMessage(`${field} deve ser texto.`)
    .trim()
    .isLength({ min: mandatory ? 1 : 0, max })
    .withMessage(mandatory ? `${field} é obrigatório (máx. ${max} caracteres).` : `${field} deve ter no máximo ${max} caracteres.`);
};

const addressRules = (required) => [
  text('label', { max: 50, required }),
  text('recipientName', { max: 120, required }),
  text('street', { max: 160, required }),
  text('number', { max: 20, required }),
  text('complement', { max: 100, required: false, mandatory: false }),
  text('neighborhood', { max: 100, required }),
  text('city', { max: 100, required }),
  (required ? body('state') : body('state').optional())
    .isString()
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]{2}$/)
    .withMessage('state deve ser a sigla do estado (ex.: SP).'),
  (required ? body('zipCode') : body('zipCode').optional())
    .isString()
    .trim()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP inválido. Use 00000-000 ou 00000000.'),
  text('reference', { max: 200, required: false, mandatory: false }),
  body('isDefault').optional().isBoolean().withMessage('isDefault deve ser true ou false.').toBoolean(),
];

module.exports = {
  ADDRESS_FIELDS,
  createAddressRules: addressRules(true),
  updateAddressRules: addressRules(false),
};
