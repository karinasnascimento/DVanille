const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/response');
const { pick } = require('../utils/pick');
const categoryService = require('../services/categoryService');

const FIELDS = ['name', 'description', 'isActive'];

const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories();
  return sendSuccess(res, { data: categories });
});

/** Admin: inclui categorias inativas. */
const listAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories({ includeInactive: true });
  return sendSuccess(res, { data: categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategory(req.params.id);
  return sendSuccess(res, { data: category });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(pick(req.body, FIELDS));
  return sendCreated(res, category, 'Categoria criada com sucesso.');
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, pick(req.body, FIELDS));
  return sendSuccess(res, { data: category, message: 'Categoria atualizada com sucesso.' });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  const message = result.deleted
    ? 'Categoria excluída com sucesso.'
    : 'Categoria possui produtos e foi apenas desativada.';
  return sendSuccess(res, { data: result, message });
});

const uploadCategoryImage = asyncHandler(async (req, res) => {
  const category = await categoryService.setCategoryImage(req.params.id, req.file.filename);
  return sendSuccess(res, { data: category, message: 'Imagem da categoria atualizada.' });
});

module.exports = {
  listCategories,
  listAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
};
