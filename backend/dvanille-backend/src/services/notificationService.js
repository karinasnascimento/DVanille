const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { parsePagination, buildPagination } = require('../utils/pagination');

const ORDER_NOTIFICATIONS = {
  PENDING: {
    type: 'ORDER_CREATED',
    title: 'Pedido recebido',
    message: (order) => `Recebemos o seu pedido ${order.orderNumber}. Aguardando confirmação.`,
  },
  CONFIRMED: {
    type: 'ORDER_CONFIRMED',
    title: 'Pedido confirmado',
    message: (order) => `Seu pedido ${order.orderNumber} foi confirmado.`,
  },
  PREPARING: {
    type: 'ORDER_PREPARING',
    title: 'Pedido em preparação',
    message: (order) => `Estamos preparando o seu pedido ${order.orderNumber}.`,
  },
  READY: {
    type: 'ORDER_READY',
    title: 'Pedido pronto',
    message: (order) =>
      order.deliveryType === 'PICKUP'
        ? `Seu pedido ${order.orderNumber} está pronto para retirada.`
        : `Seu pedido ${order.orderNumber} está pronto e logo sairá para entrega.`,
  },
  OUT_FOR_DELIVERY: {
    type: 'ORDER_OUT_FOR_DELIVERY',
    title: 'Pedido saiu para entrega',
    message: (order) => `Seu pedido ${order.orderNumber} saiu para entrega.`,
  },
  DELIVERED: {
    type: 'ORDER_DELIVERED',
    title: 'Pedido entregue',
    message: (order) => `Pedido ${order.orderNumber} concluído. Bom apetite! Que tal avaliar os produtos?`,
  },
  CANCELLED: {
    type: 'ORDER_CANCELLED',
    title: 'Pedido cancelado',
    message: (order) => `Seu pedido ${order.orderNumber} foi cancelado.`,
  },
};

/** "client" pode ser o prisma normal ou o "tx" de uma transação. */
async function createNotification(client, { userId, title, message, type = 'SYSTEM', data }) {
  return client.notification.create({
    data: { userId, title, message, type, data: data || undefined },
  });
}

async function notifyOrderStatus(client, order, status) {
  const template = ORDER_NOTIFICATIONS[status];
  if (!template) return null;

  return createNotification(client, {
    userId: order.userId,
    title: template.title,
    message: template.message(order),
    type: template.type,
    data: { orderId: order.id, orderNumber: order.orderNumber, status },
  });
}

async function listNotifications(userId, query = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = { userId };
  if (query.unread === true || query.unread === 'true') where.isRead = false;

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { items, pagination: buildPagination({ page, limit, total }), unreadCount };
}

async function getUnreadCount(userId) {
  const unreadCount = await prisma.notification.count({ where: { userId, isRead: false } });
  return { unreadCount };
}

async function markAsRead(userId, id) {
  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) throw AppError.notFound('Notificação não encontrada.');
  if (notification.isRead) return notification;

  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

async function markAllAsRead(userId) {
  const result = await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  return { updated: result.count };
}

/** Admin: envia um aviso (ex.: promoção) para todos os clientes ativos. */
async function broadcastNotification({ title, message, type = 'PROMOTION' }) {
  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER', isActive: true }, select: { id: true } });
  if (customers.length === 0) return { sent: 0 };

  const result = await prisma.notification.createMany({
    data: customers.map((customer) => ({ userId: customer.id, title, message, type })),
  });
  return { sent: result.count };
}

module.exports = {
  createNotification,
  notifyOrderStatus,
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  broadcastNotification,
};
