const prisma = require('../config/database');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { parsePagination, buildPagination } = require('../utils/pagination');
const notificationService = require('./notificationService');

/** Pontos ganhos por um valor em reais (ex.: R$ 25,90 => 25 pontos com 1 ponto por real). */
function calculatePoints(amount, pointsPerReal = env.loyalty.pointsPerReal) {
  return Math.floor(Number(amount) * pointsPerReal);
}

/**
 * Credita os pontos de um pedido entregue. Roda dentro da transação do pedido e é
 * idempotente: um pedido nunca gera pontos duas vezes.
 */
async function awardPointsForOrder(tx, order) {
  const points = calculatePoints(order.total);
  if (points <= 0) return null;

  const alreadyAwarded = await tx.loyaltyTransaction.findFirst({
    where: { orderId: order.id, type: 'EARNED' },
    select: { id: true },
  });
  if (alreadyAwarded) return null;

  const user = await tx.user.update({
    where: { id: order.userId },
    data: { loyaltyPoints: { increment: points } },
    select: { loyaltyPoints: true },
  });

  const transaction = await tx.loyaltyTransaction.create({
    data: {
      userId: order.userId,
      orderId: order.id,
      type: 'EARNED',
      points,
      balanceAfter: user.loyaltyPoints,
      description: `Pontos do pedido ${order.orderNumber}`,
    },
  });

  await notificationService.createNotification(tx, {
    userId: order.userId,
    title: 'Você ganhou pontos!',
    message: `+${points} pontos pelo pedido ${order.orderNumber}. Saldo: ${user.loyaltyPoints} pontos.`,
    type: 'REWARD',
    data: { orderId: order.id, points },
  });

  return transaction;
}

async function getSummary(userId) {
  const [user, earned, redeemed] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } }),
    prisma.loyaltyTransaction.aggregate({ where: { userId, type: 'EARNED' }, _sum: { points: true } }),
    prisma.loyaltyTransaction.aggregate({ where: { userId, type: 'REDEEMED' }, _sum: { points: true } }),
  ]);

  return {
    balance: user ? user.loyaltyPoints : 0,
    totalEarned: earned._sum.points || 0,
    totalRedeemed: redeemed._sum.points || 0,
    pointsPerReal: env.loyalty.pointsPerReal,
  };
}

async function listHistory(userId, query) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = { userId };

  const [items, total] = await Promise.all([
    prisma.loyaltyTransaction.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.loyaltyTransaction.count({ where }),
  ]);
  return { items, pagination: buildPagination({ page, limit, total }) };
}

async function listRewards({ includeInactive = false } = {}) {
  return prisma.loyaltyReward.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { pointsCost: 'asc' },
  });
}

/** Troca pontos por uma recompensa. O débito é condicional para impedir saldo negativo. */
async function redeemReward(userId, rewardId) {
  return prisma.$transaction(async (tx) => {
    const reward = await tx.loyaltyReward.findFirst({ where: { id: rewardId, isActive: true } });
    if (!reward) throw AppError.notFound('Recompensa não encontrada.');

    const debit = await tx.user.updateMany({
      where: { id: userId, loyaltyPoints: { gte: reward.pointsCost } },
      data: { loyaltyPoints: { decrement: reward.pointsCost } },
    });
    if (debit.count !== 1) throw AppError.unprocessable('Pontos insuficientes para esta recompensa.');

    const user = await tx.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } });
    const transaction = await tx.loyaltyTransaction.create({
      data: {
        userId,
        rewardId: reward.id,
        type: 'REDEEMED',
        points: reward.pointsCost,
        balanceAfter: user.loyaltyPoints,
        description: `Resgate: ${reward.name}`,
      },
    });

    await notificationService.createNotification(tx, {
      userId,
      title: 'Recompensa resgatada',
      message: `Você resgatou "${reward.name}". Apresente este aviso no balcão. Saldo: ${user.loyaltyPoints} pontos.`,
      type: 'REWARD',
      data: { rewardId: reward.id },
    });

    return { transaction, reward, balance: user.loyaltyPoints };
  });
}

// ---------- Administração das recompensas ----------

async function createReward(data) {
  return prisma.loyaltyReward.create({ data });
}

async function updateReward(id, data) {
  const exists = await prisma.loyaltyReward.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw AppError.notFound('Recompensa não encontrada.');
  return prisma.loyaltyReward.update({ where: { id }, data });
}

module.exports = {
  calculatePoints,
  awardPointsForOrder,
  getSummary,
  listHistory,
  listRewards,
  redeemReward,
  createReward,
  updateReward,
};
