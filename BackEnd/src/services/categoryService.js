const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { generateUniqueSlug } = require('../utils/slug');
const { toPublicPath, removeStoredFile } = require('../utils/storage');

const withProductCount = {
  _count: { select: { products: { where: { isActive: true } } } },
};

function serializeCategory(category) {
  if (!category) return category;
  const { _count, ...rest } = category;
  return { ...rest, productCount: _count ? _count.products : undefined };
}

async function listCategories({ includeInactive = false } = {}) {
  const categories = await prisma.category.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: withProductCount,
    orderBy: { name: 'asc' },
  });
  return categories.map(serializeCategory);
}

/** Aceita id numérico ou slug (ex.: /api/categories/cafes). */
async function getCategory(idOrSlug, { includeInactive = false } = {}) {
  const isNumeric = /^\d+$/.test(String(idOrSlug));
  const category = await prisma.category.findFirst({
    where: {
      ...(isNumeric ? { id: Number(idOrSlug) } : { slug: String(idOrSlug) }),
      ...(includeInactive ? {} : { isActive: true }),
    },
    include: withProductCount,
  });

  if (!category) throw AppError.notFound('Categoria não encontrada.');
  return serializeCategory(category);
}

async function assertNameAvailable(name, excludeId = null) {
  const existing = await prisma.category.findUnique({ where: { name }, select: { id: true } });
  if (existing && existing.id !== excludeId) {
    throw AppError.conflict('Já existe uma categoria com este nome.', [{ field: 'name', message: 'Nome já utilizado.' }]);
  }
}

async function createCategory({ name, description, isActive = true }) {
  await assertNameAvailable(name);
  const slug = await generateUniqueSlug(prisma.category, name);
  const category = await prisma.category.create({
    data: { name, slug, description: description || null, isActive },
    include: withProductCount,
  });
  return serializeCategory(category);
}

async function updateCategory(id, { name, description, isActive }) {
  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) throw AppError.notFound('Categoria não encontrada.');

  const data = {};
  if (name !== undefined && name !== current.name) {
    await assertNameAvailable(name, id);
    data.name = name;
    data.slug = await generateUniqueSlug(prisma.category, name, id);
  }
  if (description !== undefined) data.description = description || null;
  if (isActive !== undefined) data.isActive = isActive;

  const category = await prisma.category.update({ where: { id }, data, include: withProductCount });
  return serializeCategory(category);
}

/**
 * Exclui a categoria se ela nunca teve produtos; caso contrário apenas desativa
 * (para não quebrar produtos e pedidos antigos).
 */
async function deleteCategory(id) {
  const category = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!category) throw AppError.notFound('Categoria não encontrada.');

  if (category._count.products === 0) {
    await prisma.category.delete({ where: { id } });
    await removeStoredFile(category.image);
    return { deleted: true, deactivated: false };
  }

  await prisma.category.update({ where: { id }, data: { isActive: false } });
  return { deleted: false, deactivated: true };
}

async function setCategoryImage(id, filename) {
  const current = await prisma.category.findUnique({ where: { id }, select: { image: true } });
  if (!current) {
    await removeStoredFile(toPublicPath('categories', filename));
    throw AppError.notFound('Categoria não encontrada.');
  }

  const category = await prisma.category.update({
    where: { id },
    data: { image: toPublicPath('categories', filename) },
    include: withProductCount,
  });
  await removeStoredFile(current.image);
  return serializeCategory(category);
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  setCategoryImage,
};
