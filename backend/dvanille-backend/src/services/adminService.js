const prisma = require('../config/database');

const LOW_STOCK_THRESHOLD = 10;

/**
 * Estatísticas do painel administrativo.
 * "revenue" = soma dos pedidos com pagamento APROVADO e não cancelados.
 */
async function getDashboard() {
  const paidOrdersWhere = { paymentStatus: 'APPROVED', orderStatus: { not: 'CANCELLED' } };

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    cancelledOrders,
    revenueAggregate,
    lowStockProducts,
    topProductRows,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: 'PENDING' } }),
    prisma.order.count({ where: { orderStatus: { in: ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] } } }),
    prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
    prisma.order.count({ where: { orderStatus: 'CANCELLED' } }),
    prisma.order.aggregate({ where: paidOrdersWhere, _sum: { total: true } }),
    prisma.product.count({ where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } } }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { orderStatus: { not: 'CANCELLED' } } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        orderStatus: true,
        paymentStatus: true,
        deliveryType: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
      },
    }),
  ]);

  const products = await prisma.product.findMany({
    where: { id: { in: topProductRows.map((row) => row.productId) } },
    select: { id: true, name: true, image: true },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));

  return {
    users: { total: totalUsers },
    products: { total: totalProducts, lowStock: lowStockProducts, lowStockThreshold: LOW_STOCK_THRESHOLD },
    orders: {
      total: totalOrders,
      pending: pendingOrders,
      inProgress: inProgressOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
    },
    revenue: Number(revenueAggregate._sum.total || 0),
    topProducts: topProductRows.map((row) => ({
      productId: row.productId,
      name: productsById.get(row.productId)?.name || 'Produto removido',
      image: productsById.get(row.productId)?.image || null,
      quantitySold: row._sum.quantity || 0,
      revenue: Number(row._sum.subtotal || 0),
    })),
    recentOrders,
  };
}

module.exports = { getDashboard };
