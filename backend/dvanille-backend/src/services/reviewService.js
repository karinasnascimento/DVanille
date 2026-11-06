const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { parsePagination, buildPagination } = require('../utils/pagination');

/**
 * Cria uma avaliação. Regra: o usuário só avalia produtos que comprou e já recebeu
 * (pedido DELIVERED contendo o produto). Uma avaliação por produto em cada pedido.
 */
async function createReview(userId, { productId, orderId, rating, comment }) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) throw AppError.notFound('Produto não encontrado.');

  const eligibleOrders = await prisma.order.findMany({
    where: {
      userId,
      orderStatus: 'DELIVERED',
      items: { some: { productId } },
      ...(orderId ? { id: orderId } : {}),
    },
    select: { id: true, reviews: { where: { userId, productId }, select: { id: true } } },
    orderBy: { createdAt: 'desc' },
  });

  if (eligibleOrders.length === 0) {
    throw AppError.forbidden('Você só pode avaliar produtos que comprou e já recebeu.');
  }

  const target = eligibleOrders.find((order) => order.reviews.length === 0);
  if (!target) throw AppError.conflict('Você já avaliou este produto neste pedido.');

  return prisma.review.create({
    data: { userId, productId, orderId: target.id, rating, comment: comment || null },
    include: { product: { select: { id: true, name: true } } },
  });
}

async function updateReview(userId, id, { rating, comment }) {
  const review = await prisma.review.findFirst({ where: { id, userId } });
  if (!review) throw AppError.notFound('Avaliação não encontrada.');

  const data = {};
  if (rating !== undefined) data.rating = rating;
  if (comment !== undefined) data.comment = comment || null;

  return prisma.review.update({ where: { id }, data });
}

/** Cliente apaga a própria avaliação; admin (moderação) apaga qualquer uma. */
async function deleteReview(actor, id) {
  const review = await prisma.review.findFirst({ where: { id, ...(actor.role === 'ADMIN' ? {} : { userId: actor.id }) } });
  if (!review) throw AppError.notFound('Avaliação não encontrada.');
  await prisma.review.delete({ where: { id } });
}

async function listProductReviews(productId, query = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = { productId };

  const [items, total, aggregate, distribution] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { user: { select: { id: true, name: true, profileImage: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.review.count({ where }),
    prisma.review.aggregate({ where, _avg: { rating: true } }),
    prisma.review.groupBy({ by: ['rating'], where, _count: { rating: true } }),
  ]);

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distribution.forEach((row) => {
    ratingCounts[row.rating] = row._count.rating;
  });

  return {
    items,
    pagination: buildPagination({ page, limit, total }),
    summary: {
      average: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : null,
      count: total,
      distribution: ratingCounts,
    },
  };
}

async function listUserReviews(userId, query = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = { userId };

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { product: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.review.count({ where }),
  ]);
  return { items, pagination: buildPagination({ page, limit, total }) };
}

/** Admin: todas as avaliações, com filtros. */
async function listAllReviews(query = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = {};
  if (query.productId) where.productId = Number(query.productId);
  if (query.userId) where.userId = Number(query.userId);
  if (query.rating) where.rating = Number(query.rating);

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.review.count({ where }),
  ]);
  return { items, pagination: buildPagination({ page, limit, total }) };
}

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  listProductReviews,
  listUserReviews,
  listAllReviews,
};
