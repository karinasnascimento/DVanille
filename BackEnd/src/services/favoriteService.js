const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { parsePagination, buildPagination } = require('../utils/pagination');
const { productInclude, serializeProduct } = require('./productService');

async function addFavorite(userId, productId) {
  const product = await prisma.product.findFirst({ where: { id: productId, isActive: true }, select: { id: true } });
  if (!product) throw AppError.notFound('Produto não encontrado.');

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  if (existing) throw AppError.conflict('Este produto já está nos seus favoritos.');

  const favorite = await prisma.favorite.create({
    data: { userId, productId },
    include: { product: { include: productInclude } },
  });
  return { ...favorite, product: serializeProduct(favorite.product) };
}

async function removeFavorite(userId, productId) {
  const result = await prisma.favorite.deleteMany({ where: { userId, productId } });
  if (result.count === 0) throw AppError.notFound('Este produto não está nos seus favoritos.');
}

async function listFavorites(userId, query) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = { userId, product: { isActive: true } };

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where,
      include: { product: { include: productInclude } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.favorite.count({ where }),
  ]);

  const items = favorites.map((favorite) => ({ ...favorite, product: serializeProduct(favorite.product) }));
  return { items, pagination: buildPagination({ page, limit, total }) };
}

async function isFavorite(userId, productId) {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  return { productId, isFavorite: Boolean(favorite) };
}

module.exports = { addFavorite, removeFavorite, listFavorites, isFavorite };
