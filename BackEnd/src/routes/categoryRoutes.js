const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');
const { uploadCategoryImage } = require('../middlewares/uploadMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { idParam } = require('../validators/commonValidator');
const { productIdOrSlugParam } = require('../validators/productValidator');
const { createCategoryRules, updateCategoryRules } = require('../validators/categoryValidator');

const router = Router();

// Público
router.get('/', categoryController.listCategories);
router.get('/:id', productIdOrSlugParam, validate, categoryController.getCategory);

// Administração
router.post('/', authenticateToken, requireAdmin, createCategoryRules, validate, categoryController.createCategory);
router.put('/:id', authenticateToken, requireAdmin, idParam(), updateCategoryRules, validate, categoryController.updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, idParam(), validate, categoryController.deleteCategory);
router.post(
  '/:id/image',
  authenticateToken,
  requireAdmin,
  idParam(),
  validate,
  ...uploadCategoryImage,
  categoryController.uploadCategoryImage
);

module.exports = router;
