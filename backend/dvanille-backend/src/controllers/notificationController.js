const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');
const notificationService = require('../services/notificationService');

const listNotifications = asyncHandler(async (req, res) => {
  const { items, pagination, unreadCount } = await notificationService.listNotifications(req.user.id, req.query);
  return sendPaginated(res, { items, pagination, meta: { unreadCount } });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user.id);
  return sendSuccess(res, { data: result });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user.id, req.params.id);
  return sendSuccess(res, { data: notification, message: 'Notificação marcada como lida.' });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  return sendSuccess(res, { data: result, message: 'Todas as notificações foram marcadas como lidas.' });
});

const broadcastNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.broadcastNotification(req.body);
  return sendSuccess(res, { data: result, message: 'Notificação enviada aos clientes.' });
});

module.exports = { listNotifications, getUnreadCount, markAsRead, markAllAsRead, broadcastNotification };
