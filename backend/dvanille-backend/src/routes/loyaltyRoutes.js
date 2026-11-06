const { Router } = require('express');
const loyaltyController = require('../controllers/loyaltyController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { idParam, paginationQuery } = require('../validators/commonValidator');

const router = Router();

router.use(authenticateToken);

router.get('/', loyaltyController.getSummary);
router.get('/history', paginationQuery, validate, loyaltyController.listHistory);
router.get('/rewards', loyaltyController.listRewards);
router.post('/rewards/:id/redeem', idParam(), validate, loyaltyController.redeemReward);

module.exports = router;
