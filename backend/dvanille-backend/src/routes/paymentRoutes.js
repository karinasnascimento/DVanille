const { Router } = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { idParam } = require('../validators/commonValidator');

const router = Router();

router.get('/methods', paymentController.listPaymentMethods);

router.get('/order/:orderId', authenticateToken, idParam('orderId'), validate, paymentController.getPaymentByOrder);
router.post('/order/:orderId/confirm', authenticateToken, idParam('orderId'), validate, paymentController.confirmPixPayment);
router.post(
  '/order/:orderId/refund',
  authenticateToken,
  requireAdmin,
  idParam('orderId'),
  validate,
  paymentController.refundPayment
);

module.exports = router;
