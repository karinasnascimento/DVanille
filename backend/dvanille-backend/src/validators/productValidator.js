const { body, query, param } = require('express-validator');
const { paginationQuery } = require('./commonValidator');

const PRODUCT_FIELDS = [
  'categoryId',
  'name',
  'description',
  'price',
  'promotionalPrice',
  'sku',
  'stock',
  'isAvailable',
  'isActive',
  'isFeatured',
  'preparationTime',
  'calories',
  'carbohydrates',
  'proteins',
  'fats',
  'fiber',
  'sodium',
  'ingredients',
  'allergens',
  'containsGluten',
  'containsLactose',
  'containsMilk',
  'containsEggs',
  'containsSoy',
  'containsPeanuts',
  'containsNuts',
  'containsSugar',
  'isVegetarian',
  'isVegan',
];

const BOOLEAN_FIELDS = [
  'isAvailable',
  'isActive',
  'isFeatured',
  'containsGluten',
  'containsLactose',
  'containsMilk',
  'containsEggs',
  'containsSoy',
  'containsPeanuts',
  'containsNuts',
  'containsSugar',
  'isVegetarian',
  'isVegan',
];

const NUTRITION_DECIMALS = ['carbohydrates', 'proteins', 'fats', 'fiber', 'sodium'];

/** required=true na criação (campos obrigatórios), false na edição (tudo opcional). */
const productFieldRules = (required) => {
  const maybe = (chain) => (required ? chain : chain.optional());

  return [
    maybe(body('name')).isString().trim().isLength({ min: 2, max: 160 }).withMessage('Nome deve ter entre 2 e 160 caracteres.'),
    maybe(body('categoryId')).isInt({ min: 1 }).withMessage('categoryId inválido.').toInt(),
    maybe(body('price')).isFloat({ min: 0.01, max: 99999999 }).withMessage('Preço deve ser maior que zero.').toFloat(),
    body('promotionalPrice')
      .optional({ values: 'null' })
      .isFloat({ min: 0.01 })
      .withMessage('Preço promocional deve ser maior que zero.')
      .toFloat(),
    body('description').optional({ values: 'null' }).isString().trim().isLength({ max: 5000 }).withMessage('Descrição muito longa.'),
    body('sku').optional({ values: 'null' }).isString().trim().isLength({ min: 1, max: 60 }).withMessage('SKU deve ter até 60 caracteres.'),
    body('stock').optional().isInt({ min: 0, max: 1000000 }).withMessage('Estoque deve ser um inteiro >= 0.').toInt(),
    body('preparationTime').optional({ values: 'null' }).isInt({ min: 0, max: 1440 }).withMessage('Tempo de preparo inválido (minutos).').toInt(),
    body('calories').optional({ values: 'null' }).isInt({ min: 0, max: 100000 }).withMessage('Calorias inválidas.').toInt(),
    ...NUTRITION_DECIMALS.map((field) =>
      body(field).optional({ values: 'null' }).isFloat({ min: 0 }).withMessage(`${field} deve ser um número >= 0.`).toFloat()
    ),
    body('ingredients').optional({ values: 'null' }).isString().trim().isLength({ max: 5000 }).withMessage('Ingredientes muito longos.'),
    body('allergens').optional({ values: 'null' }).isString().trim().isLength({ max: 2000 }).withMessage('Alérgenos muito longos.'),
    ...BOOLEAN_FIELDS.map((field) => body(field).optional().isBoolean().withMessage(`${field} deve ser true ou false.`).toBoolean()),
  ];
};

const BOOLEAN_QUERY_FILTERS = [
  'onPromotion',
  'featured',
  'available',
  'glutenFree',
  'lactoseFree',
  'milkFree',
  'eggFree',
  'soyFree',
  'peanutFree',
  'nutFree',
  'sugarFree',
  'vegetarian',
  'vegan',
];

const listProductsRules = [
  ...paginationQuery,
  query('search').optional().isString().trim().isLength({ max: 100 }).withMessage('search muito longo.'),
  query('categoryId').optional().isInt({ min: 1 }).withMessage('categoryId inválido.'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice inválido.'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice inválido.'),
  query('sort').optional().isIn(['name', 'price', 'newest', 'featured']).withMessage('sort deve ser name, price, newest ou featured.'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order deve ser asc ou desc.'),
  ...BOOLEAN_QUERY_FILTERS.map((field) => query(field).optional().isBoolean().withMessage(`${field} deve ser true ou false.`)),
];

const productIdOrSlugParam = [param('id').isString().trim().isLength({ min: 1, max: 180 }).withMessage('Identificador inválido.')];

const updateStockRules = [
  body().custom((value) => {
    const hasStock = value && value.stock !== undefined;
    const hasAdjustment = value && value.adjustment !== undefined;
    if (hasStock === hasAdjustment) throw new Error('Informe "stock" (valor absoluto) OU "adjustment" (variação).');
    return true;
  }),
  body('stock').optional().isInt({ min: 0, max: 1000000 }).withMessage('stock deve ser um inteiro >= 0.').toInt(),
  body('adjustment').optional().isInt({ min: -1000000, max: 1000000 }).withMessage('adjustment deve ser um inteiro.').toInt(),
];

module.exports = {
  PRODUCT_FIELDS,
  createProductRules: productFieldRules(true),
  updateProductRules: productFieldRules(false),
  listProductsRules,
  productIdOrSlugParam,
  updateStockRules,
};
