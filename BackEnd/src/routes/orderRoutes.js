const { Router } = require('express');
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { idParam } = require('../validators/commonValidator');
const { quoteOrderRules, createOrderRules, listOrdersRules } = require('../validators/orderValidator');

const router = Router();

router.use(authenticateToken);

router.post('/quote', quoteOrderRules, validate, orderController.quoteOrder);
router.post('/', createOrderRules, validate, orderController.createOrder);
router.get('/', listOrdersRules, validate, orderController.listMyOrders);
router.get('/:id', idParam(), validate, orderController.getOrder);
router.get('/:id/tracking', idParam(), validate, orderController.getOrderTracking);
router.post('/:id/cancel', idParam(), validate, orderController.cancelMyOrder);

module.exports = router;
