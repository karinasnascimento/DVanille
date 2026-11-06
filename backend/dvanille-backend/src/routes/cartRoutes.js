const { Router } = require('express');
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { idParam } = require('../validators/commonValidator');
const { addItemRules, updateQuantityRules, couponRules } = require('../validators/cartValidator');

const router = Router();

router.use(authenticateToken);

router.get('/', cartController.getCart);
router.delete('/', cartController.clearCart);

router.post('/items', addItemRules, validate, cartController.addItem);
router.patch('/items/:productId', idParam('productId'), updateQuantityRules, validate, cartController.updateItemQuantity);
router.post('/items/:productId/increment', idParam('productId'), validate, cartController.incrementItem);
router.post('/items/:productId/decrement', idParam('productId'), validate, cartController.decrementItem);
router.delete('/items/:productId', idParam('productId'), validate, cartController.removeItem);

router.post('/coupon', couponRules, validate, cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);

module.exports = router;
