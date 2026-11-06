const { Router } = require('express');
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { idParam, paginationQuery } = require('../validators/commonValidator');
const { createReviewRules, updateReviewRules } = require('../validators/reviewValidator');

const router = Router();

router.use(authenticateToken);

// Avaliações de um produto são públicas em GET /api/products/:id/reviews
router.get('/me', paginationQuery, validate, reviewController.listMyReviews);
router.post('/', createReviewRules, validate, reviewController.createReview);
router.put('/:id', idParam(), updateReviewRules, validate, reviewController.updateReview);
router.delete('/:id', idParam(), validate, reviewController.deleteReview);

module.exports = router;
