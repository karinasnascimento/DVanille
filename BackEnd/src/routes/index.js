const { Router } = require('express');
const healthController = require('../controllers/healthController');

const router = Router();

router.get('/health', healthController.checkHealth);

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/addresses', require('./addressRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/categories', require('./categoryRoutes'));
router.use('/favorites', require('./favoriteRoutes'));
router.use('/cart', require('./cartRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/promotions', require('./promotionRoutes'));
router.use('/reviews', require('./reviewRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/loyalty', require('./loyaltyRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
