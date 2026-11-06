const { body } = require('express-validator');

const PHONE_REGEX = /^[\d()+\-\s]{8,20}$/;

// bcrypt considera apenas os 72 primeiros bytes; limitamos para evitar surpresas.
const passwordRules = (field = 'password') =>
  body(field)
    .isString()
    .withMessage('A senha é obrigatória.')
    .isLength({ min: 8, max: 72 })
    .withMessage('A senha deve ter entre 8 e 72 caracteres.')
    .matches(/[A-Za-z]/)
    .withMessage('A senha deve conter ao menos uma letra.')
    .matches(/\d/)
    .withMessage('A senha deve conter ao menos um número.');

const registerRules = [
  body('name').isString().trim().isLength({ min: 2, max: 120 }).withMessage('Nome deve ter entre 2 e 120 caracteres.'),
  body('email')
    .isString()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('E-mail inválido.')
    .isLength({ max: 191 })
    .withMessage('E-mail muito longo.'),
  body('phone').optional({ values: 'falsy' }).isString().trim().matches(PHONE_REGEX).withMessage('Telefone inválido.'),
  passwordRules('password'),
];

const loginRules = [
  body('email').isString().trim().toLowerCase().isEmail().withMessage('E-mail inválido.'),
  body('password').isString().notEmpty().withMessage('Informe a senha.'),
];

module.exports = { PHONE_REGEX, passwordRules, registerRules, loginRules };
