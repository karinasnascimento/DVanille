const { Router } = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { idParam } = require('../validators/commonValidator');
const { listNotificationsRules } = require('../validators/miscValidator');

const router = Router();

router.use(authenticateToken);

router.get('/', listNotificationsRules, validate, notificationController.listNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', idParam(), validate, notificationController.markAsRead);

module.exports = router;
