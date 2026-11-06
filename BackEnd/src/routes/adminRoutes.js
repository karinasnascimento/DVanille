const { Router } = require('express');
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController');
const promotionController = require('../controllers/promotionController');
const reviewController = require('../controllers/reviewController');
const notificationController = require('../controllers/notificationController');
const loyaltyController = require('../controllers/loyaltyController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');
const { uploadProductImage, uploadCategoryImage } = require('../middlewares/uploadMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { idParam, paginationQuery } = require('../validators/commonValidator');
const { listUsersRules, setActiveRules } = require('../validators/userValidator');
const {
  createProductRules,
  updateProductRules,
  listProductsRules,
  updateStockRules,
} = require('../validators/productValidator');
const { createCategoryRules, updateCategoryRules } = require('../validators/categoryValidator');
const { listOrdersRules, updateOrderStatusRules } = require('../validators/orderValidator');
const { createPromotionRules, updatePromotionRules } = require('../validators/promotionValidator');
const { listReviewsRules } = require('../validators/reviewValidator');
const { broadcastRules, createRewardRules, updateRewardRules } = require('../validators/miscValidator');

const router = Router();

// Todas as rotas abaixo exigem JWT válido + role ADMIN.
router.use(authenticateToken, requireAdmin);

router.get('/dashboard', adminController.getDashboard);

// Usuários
router.get('/users', listUsersRules, validate, adminController.listUsers);
router.get('/users/:id', idParam(), validate, adminController.getUser);
router.patch('/users/:id/status', idParam(), setActiveRules, validate, adminController.setUserActive);

// Produtos
router.get('/products', listProductsRules, validate, productController.listAllProducts);
router.post('/products', createProductRules, validate, productController.createProduct);
router.put('/products/:id', idParam(), updateProductRules, validate, productController.updateProduct);
router.delete('/products/:id', idParam(), validate, productController.deleteProduct);
router.post('/products/:id/image', idParam(), validate, ...uploadProductImage, productController.uploadProductImage);

// Categorias
router.get('/categories', categoryController.listAllCategories);
router.post('/categories', createCategoryRules, validate, categoryController.createCategory);
router.put('/categories/:id', idParam(), updateCategoryRules, validate, categoryController.updateCategory);
router.delete('/categories/:id', idParam(), validate, categoryController.deleteCategory);
router.post('/categories/:id/image', idParam(), validate, ...uploadCategoryImage, categoryController.uploadCategoryImage);

// Pedidos
router.get('/orders', listOrdersRules, validate, orderController.listAllOrders);
router.get('/orders/:id', idParam(), validate, orderController.getOrder);
router.patch('/orders/:id/status', idParam(), updateOrderStatusRules, validate, orderController.updateOrderStatus);

// Estoque
router.get('/stock', paginationQuery, validate, productController.listStock);
router.patch('/stock/:id', idParam(), updateStockRules, validate, productController.updateStock);

// Promoções
router.get('/promotions', paginationQuery, validate, promotionController.listPromotions);
router.get('/promotions/:id', idParam(), validate, promotionController.getPromotion);
router.post('/promotions', createPromotionRules, validate, promotionController.createPromotion);
router.put('/promotions/:id', idParam(), updatePromotionRules, validate, promotionController.updatePromotion);
router.delete('/promotions/:id', idParam(), validate, promotionController.deletePromotion);

// Avaliações
router.get('/reviews', listReviewsRules, validate, reviewController.listAllReviews);
router.delete('/reviews/:id', idParam(), validate, reviewController.deleteReview);

// Notificações em massa
router.post('/notifications/broadcast', broadcastRules, validate, notificationController.broadcastNotification);

// Fidelidade (catálogo de recompensas)
router.get('/loyalty/rewards', loyaltyController.listAllRewards);
router.post('/loyalty/rewards', createRewardRules, validate, loyaltyController.createReward);
router.put('/loyalty/rewards/:id', idParam(), updateRewardRules, validate, loyaltyController.updateReward);

module.exports = router;
