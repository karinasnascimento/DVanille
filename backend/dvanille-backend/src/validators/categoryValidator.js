const { body, query } = require('express-validator');

const createCategoryRules = [
  body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres.'),
  body('description').optional({ values: 'null' }).isString().trim().isLength({ max: 500 }).withMessage('Descrição muito longa (máx. 500).'),
  body('isActive').optional().isBoolean().withMessage('isActive deve ser true ou false.').toBoolean(),
];

const updateCategoryRules = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres.'),
  body('description').optional({ values: 'null' }).isString().trim().isLength({ max: 500 }).withMessage('Descrição muito longa (máx. 500).'),
  body('isActive').optional().isBoolean().withMessage('isActive deve ser true ou false.').toBoolean(),
];

const listCategoriesRules = [query('includeInactive').optional().isBoolean().withMessage('includeInactive deve ser true ou false.')];

module.exports = { createCategoryRules, updateCategoryRules, listCategoriesRules };
