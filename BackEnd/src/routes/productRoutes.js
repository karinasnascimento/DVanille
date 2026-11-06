const { Router } = require('express');
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');
const { uploadProductImage } = require('../middlewares/uploadMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { idParam, paginationQuery } = require('../validators/commonValidator');
const {
  createProductRules,
  updateProductRules,
  listProductsRules,
  productIdOrSlugParam,
} = require('../validators/productValidator');

const router = Router();

// Público (as rotas fixas vêm antes de "/:id")
router.get('/', listProductsRules, validate, productController.listProducts);
router.get('/featured', paginationQuery, validate, productController.listFeaturedProducts);
router.get('/promotions', paginationQuery, validate, productController.listPromotionalProducts);
router.get('/:id', productIdOrSlugParam, validate, productController.getProduct);
router.get('/:id/availability', idParam(), validate, productController.getProductAvailability);
router.get('/:id/reviews', idParam(), paginationQuery, validate, reviewController.listProductReviews);

// Administração
router.post('/', authenticateToken, requireAdmin, createProductRules, validate, productController.createProduct);
router.put('/:id', authenticateToken, requireAdmin, idParam(), updateProductRules, validate, productController.updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, idParam(), validate, productController.deleteProduct);
router.post(
  '/:id/image',
  authenticateToken,
  requireAdmin,
  idParam(),
  validate,
  ...uploadProductImage,
  productController.uploadProductImage
);

module.exports = router;
