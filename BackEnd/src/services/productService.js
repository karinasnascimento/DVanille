const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { parsePagination, buildPagination } = require('../utils/pagination');
const { generateUniqueSlug } = require('../utils/slug');
const { getEffectivePrice, isOnPromotion } = require('../utils/money');
const { toPublicPath, removeStoredFile } = require('../utils/storage');

const productInclude = { category: { select: { id: true, name: true, slug: true } } };

// Filtro alimentar da query string -> condição no banco.
// Ex.: ?lactoseFree=true => containsLactose = false ; ?vegan=true => isVegan = true
const DIETARY_FILTERS = {
  glutenFree: { containsGluten: false },
  lactoseFree: { containsLactose: false },
  milkFree: { containsMilk: false },
  eggFree: { containsEggs: false },
  soyFree: { containsSoy: false },
  peanutFree: { containsPeanuts: false },
  nutFree: { containsNuts: false },
  sugarFree: { containsSugar: false },
  vegetarian: { isVegetarian: true },
  vegan: { isVegan: true },
};

const SORT_OPTIONS = {
  name: (order) => ({ name: order }),
  price: (order) => ({ price: order }),
  newest: (order) => ({ createdAt: order }),
  featured: () => [{ isFeatured: 'desc' }, { name: 'asc' }],
};

const isTrue = (value) => value === true || value === 'true' || value === '1';

/** Acrescenta campos derivados úteis ao app (preço efetivo, disponibilidade, resumo alimentar). */
function serializeProduct(product) {
  if (!product) return product;

  const effectivePrice = getEffectivePrice(product);
  return {
    ...product,
    effectivePrice,
    isOnPromotion: isOnPromotion(product),
    inStock: product.isActive && product.isAvailable && product.stock > 0,
    dietary: {
      glutenFree: !product.containsGluten,
      lactoseFree: !product.containsLactose,
      milkFree: !product.containsMilk,
      eggFree: !product.containsEggs,
      soyFree: !product.containsSoy,
      peanutFree: !product.containsPeanuts,
      nutFree: !product.containsNuts,
      sugarFree: !product.containsSugar,
      vegetarian: product.isVegetarian,
      vegan: product.isVegan,
    },
  };
}

function buildProductWhere(filters = {}, { includeInactive = false } = {}) {
  const and = [];
  const where = {};

  if (!includeInactive) {
    where.isActive = true;
    where.category = { isActive: true };
  }

  if (filters.search) {
    and.push({ OR: [{ name: { contains: filters.search } }, { description: { contains: filters.search } }] });
  }

  if (filters.categoryId) where.categoryId = Number(filters.categoryId);
  if (filters.category) {
    where.category = { ...(where.category || {}), slug: String(filters.category) };
  }

  // Preço considerado = preço promocional (quando existe) ou preço normal.
  const range = {};
  if (filters.minPrice !== undefined && filters.minPrice !== '') range.gte = Number(filters.minPrice);
  if (filters.maxPrice !== undefined && filters.maxPrice !== '') range.lte = Number(filters.maxPrice);
  if (Object.keys(range).length > 0) {
    and.push({
      OR: [{ promotionalPrice: { not: null, ...range } }, { promotionalPrice: null, price: range }],
    });
  }

  if (isTrue(filters.onPromotion)) where.promotionalPrice = { not: null };
  if (filters.featured !== undefined && filters.featured !== '') where.isFeatured = isTrue(filters.featured);
  if (isTrue(filters.available)) {
    where.isAvailable = true;
    where.stock = { gt: 0 };
  }

  Object.entries(DIETARY_FILTERS).forEach(([param, condition]) => {
    if (isTrue(filters[param])) Object.assign(where, condition);
  });

  if (and.length > 0) where.AND = and;
  return where;
}

async function listProducts(query = {}, { includeInactive = false } = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = buildProductWhere(query, { includeInactive });

  const order = query.order === 'desc' ? 'desc' : 'asc';
  const sortBuilder = SORT_OPTIONS[query.sort] || SORT_OPTIONS.name;

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, include: productInclude, orderBy: sortBuilder(order), skip, take }),
    prisma.product.count({ where }),
  ]);

  return { items: items.map(serializeProduct), pagination: buildPagination({ page, limit, total }) };
}

async function getRatingSummary(productId) {
  const aggregate = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : null,
    count: aggregate._count.rating,
  };
}

/** Aceita id numérico ou slug. */
async function getProduct(idOrSlug, { includeInactive = false } = {}) {
  const isNumeric = /^\d+$/.test(String(idOrSlug));
  const product = await prisma.product.findFirst({
    where: {
      ...(isNumeric ? { id: Number(idOrSlug) } : { slug: String(idOrSlug) }),
      ...(includeInactive ? {} : { isActive: true }),
    },
    include: productInclude,
  });

  if (!product) throw AppError.notFound('Produto não encontrado.');

  const rating = await getRatingSummary(product.id);
  return { ...serializeProduct(product), rating };
}

async function getAvailability(id) {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    select: { id: true, name: true, isAvailable: true, stock: true },
  });
  if (!product) throw AppError.notFound('Produto não encontrado.');

  const inStock = product.isAvailable && product.stock > 0;
  return {
    productId: product.id,
    name: product.name,
    isAvailable: product.isAvailable,
    stock: product.stock,
    inStock,
    maxQuantity: inStock ? product.stock : 0,
  };
}

/** Regras de coerência dos dados (usado em criação e edição, já com os dados mesclados). */
function assertProductRules(data) {
  const errors = [];

  if (data.promotionalPrice !== null && data.promotionalPrice !== undefined) {
    if (Number(data.promotionalPrice) >= Number(data.price)) {
      errors.push({ field: 'promotionalPrice', message: 'O preço promocional deve ser menor que o preço normal.' });
    }
  }

  if (data.isVegan) {
    if (!data.isVegetarian) {
      errors.push({ field: 'isVegetarian', message: 'Produto vegano também deve ser marcado como vegetariano.' });
    }
    ['containsMilk', 'containsLactose', 'containsEggs'].forEach((field) => {
      if (data[field]) errors.push({ field, message: 'Produto vegano não pode conter leite, lactose ou ovos.' });
    });
  }

  if (data.containsLactose && !data.containsMilk) {
    // Lactose vem do leite; mantém o dado consistente para os filtros.
    errors.push({ field: 'containsMilk', message: 'Se contém lactose, também contém leite.' });
  }

  if (errors.length > 0) throw AppError.unprocessable('Dados do produto inconsistentes.', errors);
}

async function assertCategoryUsable(categoryId) {
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) {
    throw AppError.unprocessable('Categoria inexistente.', [{ field: 'categoryId', message: 'Categoria inexistente.' }]);
  }
}

async function assertSkuAvailable(sku, excludeId = null) {
  if (!sku) return;
  const existing = await prisma.product.findUnique({ where: { sku }, select: { id: true } });
  if (existing && existing.id !== excludeId) {
    throw AppError.conflict('Já existe um produto com este SKU.', [{ field: 'sku', message: 'SKU já utilizado.' }]);
  }
}

async function createProduct(data) {
  await assertCategoryUsable(data.categoryId);
  await assertSkuAvailable(data.sku);
  assertProductRules({
    ...data,
    isVegetarian: data.isVegetarian || false,
    isVegan: data.isVegan || false,
  });

  const slug = await generateUniqueSlug(prisma.product, data.name);
  const product = await prisma.product.create({ data: { ...data, slug }, include: productInclude });
  return serializeProduct(product);
}

async function updateProduct(id, data) {
  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) throw AppError.notFound('Produto não encontrado.');

  if (data.categoryId !== undefined) await assertCategoryUsable(data.categoryId);
  if (data.sku !== undefined) await assertSkuAvailable(data.sku, id);

  // Quando a promoção é removida (null) ou o preço muda, valida com o conjunto final.
  assertProductRules({ ...current, ...data });

  const product = await prisma.product.update({ where: { id }, data, include: productInclude });
  return serializeProduct(product);
}

/**
 * Exclui o produto se ele nunca foi vendido; caso contrário apenas desativa,
 * preservando o histórico de pedidos.
 */
async function deleteProduct(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!product) throw AppError.notFound('Produto não encontrado.');

  if (product._count.orderItems === 0) {
    await prisma.product.delete({ where: { id } });
    await removeStoredFile(product.image);
    return { deleted: true, deactivated: false };
  }

  await prisma.product.update({ where: { id }, data: { isActive: false, isAvailable: false } });
  return { deleted: false, deactivated: true };
}

async function setProductImage(id, filename) {
  const current = await prisma.product.findUnique({ where: { id }, select: { image: true } });
  const publicPath = toPublicPath('products', filename);

  if (!current) {
    await removeStoredFile(publicPath);
    throw AppError.notFound('Produto não encontrado.');
  }

  const product = await prisma.product.update({ where: { id }, data: { image: publicPath }, include: productInclude });
  await removeStoredFile(current.image);
  return serializeProduct(product);
}

// ---------- Estoque (admin) ----------

/** Define o estoque absoluto (stock) ou aplica uma variação (adjustment, pode ser negativa). */
async function updateStock(id, { stock, adjustment }) {
  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw AppError.notFound('Produto não encontrado.');

  if (stock !== undefined) {
    await prisma.product.update({ where: { id }, data: { stock } });
  } else {
    // Condicional no banco: nunca deixa o estoque negativo, mesmo com concorrência.
    const result = await prisma.product.updateMany({
      where: { id, ...(adjustment < 0 ? { stock: { gte: -adjustment } } : {}) },
      data: { stock: { increment: adjustment } },
    });
    if (result.count !== 1) throw AppError.conflict('Ajuste inválido: o estoque não pode ficar negativo.');
  }

  const product = await prisma.product.findUnique({ where: { id }, include: productInclude });
  return serializeProduct(product);
}

async function listStock(query = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const threshold = Number.isNaN(parseInt(query.threshold, 10)) ? 10 : parseInt(query.threshold, 10);

  const where = { isActive: true };
  if (isTrue(query.lowStock)) where.stock = { lte: threshold };
  if (query.search) where.OR = [{ name: { contains: query.search } }, { sku: { contains: query.search } }];

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: { id: true, name: true, sku: true, stock: true, isAvailable: true, category: { select: { id: true, name: true } } },
      orderBy: [{ stock: 'asc' }, { name: 'asc' }],
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, pagination: buildPagination({ page, limit, total }), lowStockThreshold: threshold };
}

module.exports = {
  productInclude,
  serializeProduct,
  buildProductWhere,
  listProducts,
  getProduct,
  getAvailability,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductImage,
  updateStock,
  listStock,
};
