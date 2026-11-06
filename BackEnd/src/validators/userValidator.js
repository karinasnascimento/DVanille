const { body, query } = require('express-validator');
const { PHONE_REGEX, passwordRules } = require('./authValidator');
const { paginationQuery } = require('./commonValidator');

const updateProfileRules = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 120 }).withMessage('Nome deve ter entre 2 e 120 caracteres.'),
  body('phone')
    .optional({ values: 'null' })
    .custom((value) => value === '' || PHONE_REGEX.test(String(value).trim()))
    .withMessage('Telefone inválido.'),
];

const changePasswordRules = [
  body('currentPassword').isString().notEmpty().withMessage('Informe a senha atual.'),
  passwordRules('newPassword'),
];

const setActiveRules = [body('isActive').isBoolean().withMessage('isActive deve ser true ou false.').toBoolean()];

const listUsersRules = [
  ...paginationQuery,
  query('role').optional().isIn(['CUSTOMER', 'ADMIN']).withMessage('role inválido.'),
  query('isActive').optional().isBoolean().withMessage('isActive deve ser true ou false.'),
];

module.exports = { updateProfileRules, changePasswordRules, setActiveRules, listUsersRules };
