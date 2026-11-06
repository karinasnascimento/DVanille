const { Router } = require('express');
const promotionController = require('../controllers/promotionController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { idParam, paginationQuery } = require('../validators/commonValidator');
const { createPromotionRules, updatePromotionRules } = require('../validators/promotionValidator');
const { validatePromotionRules } = require('../validators/miscValidator');

const router = Router();

// Público: cupons vigentes
router.get('/', promotionController.listActivePromotions);

// Cliente: testa um cupom contra o carrinho atual
router.post('/validate', authenticateToken, validatePromotionRules, validate, promotionController.validateCoupon);

// Administração (CRUD completo; também disponível em /api/admin/promotions)
router.get('/admin/all', authenticateToken, requireAdmin, paginationQuery, validate, promotionController.listPromotions);
router.get('/admin/:id', authenticateToken, requireAdmin, idParam(), validate, promotionController.getPromotion);
router.post('/', authenticateToken, requireAdmin, createPromotionRules, validate, promotionController.createPromotion);
router.put('/:id', authenticateToken, requireAdmin, idParam(), updatePromotionRules, validate, promotionController.updatePromotion);
router.delete('/:id', authenticateToken, requireAdmin, idParam(), validate, promotionController.deletePromotion);

module.exports = router;
