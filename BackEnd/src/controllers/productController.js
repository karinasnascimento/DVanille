const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');
const { pick } = require('../utils/pick');
const { PRODUCT_FIELDS } = require('../validators/productValidator');
const productService = require('../services/productService');

const listProducts = asyncHandler(async (req, res) => {
  const { items, pagination } = await productService.listProducts(req.query);
  return sendPaginated(res, { items, pagination });
});

const listFeaturedProducts = asyncHandler(async (req, res) => {
  const { items, pagination } = await productService.listProducts({ ...req.query, featured: 'true', available: 'true' });
  return sendPaginated(res, { items, pagination });
});

const listPromotionalProducts = asyncHandler(async (req, res) => {
  const { items, pagination } = await productService.listProducts({ ...req.query, onPromotion: 'true', available: 'true' });
  return sendPaginated(res, { items, pagination });
});

/** Admin: inclui produtos inativos/indisponíveis. */
const listAllProducts = asyncHandler(async (req, res) => {
  const { items, pagination } = await productService.listProducts(req.query, { includeInactive: true });
  return sendPaginated(res, { items, pagination });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.id);
  return sendSuccess(res, { data: product });
});

const getProductAvailability = asyncHandler(async (req, res) => {
  const availability = await productService.getAvailability(req.params.id);
  return sendSuccess(res, { data: availability });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(pick(req.body, PRODUCT_FIELDS));
  return sendCreated(res, product, 'Produto criado com sucesso.');
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, pick(req.body, PRODUCT_FIELDS));
  return sendSuccess(res, { data: product, message: 'Produto atualizado com sucesso.' });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  const message = result.deleted
    ? 'Produto excluído com sucesso.'
    : 'Produto já possui vendas e foi apenas desativado.';
  return sendSuccess(res, { data: result, message });
});

const uploadProductImage = asyncHandler(async (req, res) => {
  const product = await productService.setProductImage(req.params.id, req.file.filename);
  return sendSuccess(res, { data: product, message: 'Imagem do produto atualizada.' });
});

const listStock = asyncHandler(async (req, res) => {
  const { items, pagination, lowStockThreshold } = await productService.listStock(req.query);
  return sendPaginated(res, { items, pagination, meta: { lowStockThreshold } });
});

const updateStock = asyncHandler(async (req, res) => {
  const product = await productService.updateStock(req.params.id, pick(req.body, ['stock', 'adjustment']));
  return sendSuccess(res, { data: product, message: 'Estoque atualizado com sucesso.' });
});

module.exports = {
  listProducts,
  listFeaturedProducts,
  listPromotionalProducts,
  listAllProducts,
  getProduct,
  getProductAvailability,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  listStock,
  updateStock,
};
