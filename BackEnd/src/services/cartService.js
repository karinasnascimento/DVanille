const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { getEffectivePrice, calculateTotals, toCents, fromCents } = require('../utils/money');
const promotionService = require('./promotionService');

const cartInclude = {
  items: {
    orderBy: { id: 'asc' },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          price: true,
          promotionalPrice: true,
          stock: true,
          isAvailable: true,
          isActive: true,
        },
      },
    },
  },
  promotion: true,
};

async function getOrCreateCart(userId, client = prisma) {
  return client.cart.upsert({ where: { userId }, update: {}, create: { userId }, include: cartInclude });
}

function describeItemIssue(item) {
  const { product } = item;
  if (!product.isActive || !product.isAvailable) return 'Produto indisponível.';
  if (product.stock < item.quantity) return `Estoque insuficiente (disponível: ${product.stock}).`;
  return null;
}

/**
 * Monta a resposta do carrinho. Todos os preços vêm do banco no momento da consulta;
 * o frontend nunca envia preço.
 */
async function buildCartView(cart, userId) {
  const items = cart.items.map((item) => {
    const unitPrice = getEffectivePrice(item.product);
    const issue = describeItemIssue(item);

    return {
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.image,
      quantity: item.quantity,
      unitPrice,
      originalPrice: Number(item.product.price),
      subtotal: fromCents(toCents(unitPrice) * item.quantity),
      isAvailable: !issue,
      availabilityIssue: issue,
    };
  });

  const baseTotals = calculateTotals({ items });
  let coupon = null;
  let promotion = null;

  if (cart.promotion) {
    const preview = await promotionService.previewCoupon(cart.promotion, { userId, subtotal: baseTotals.subtotal });
    coupon = {
      code: cart.promotion.code,
      name: cart.promotion.name,
      type: cart.promotion.type,
      value: Number(cart.promotion.value),
      valid: preview.valid,
      message: preview.message,
    };
    if (preview.valid) promotion = cart.promotion;
  }

  const totals = calculateTotals({ items, promotion });

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    hasUnavailableItems: items.some((item) => !item.isAvailable),
    coupon,
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: totals.total,
  };
}

async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  return buildCartView(cart, userId);
}

async function loadSellableProduct(productId) {
  const product = await prisma.product.findFirst({ where: { id: productId, isActive: true, category: { isActive: true } } });
  if (!product) throw AppError.notFound('Produto não encontrado.');
  if (!product.isAvailable || product.stock <= 0) {
    throw AppError.conflict(`O produto "${product.name}" está indisponível no momento.`);
  }
  return product;
}

function assertStock(product, desiredQuantity) {
  if (desiredQuantity > product.stock) {
    throw AppError.conflict(`Estoque insuficiente para "${product.name}". Disponível: ${product.stock}.`, [
      { field: 'quantity', message: `Máximo disponível: ${product.stock}.` },
    ]);
  }
}

async function addItem(userId, { productId, quantity = 1 }) {
  const product = await loadSellableProduct(productId);
  const cart = await getOrCreateCart(userId);

  const existing = cart.items.find((item) => item.productId === productId);
  const desired = (existing ? existing.quantity : 0) + quantity;
  assertStock(product, desired);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: desired },
    create: { cartId: cart.id, productId, quantity },
  });

  return getCart(userId);
}

async function findCartItem(userId, productId) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((candidate) => candidate.productId === productId);
  if (!item) throw AppError.notFound('Este produto não está no carrinho.');
  return { cart, item };
}

async function setItemQuantity(userId, productId, quantity) {
  const { item } = await findCartItem(userId, productId);

  const product = await loadSellableProduct(productId);
  assertStock(product, quantity);

  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  return getCart(userId);
}

async function incrementItem(userId, productId) {
  const { item } = await findCartItem(userId, productId);
  return setItemQuantity(userId, productId, item.quantity + 1);
}

/** Diminui em 1; ao chegar em zero o item é removido do carrinho. */
async function decrementItem(userId, productId) {
  const { item } = await findCartItem(userId, productId);
  if (item.quantity <= 1) return removeItem(userId, productId);
  return setItemQuantity(userId, productId, item.quantity - 1);
}

async function removeItem(userId, productId) {
  const { item } = await findCartItem(userId, productId);
  await prisma.cartItem.delete({ where: { id: item.id } });
  return getCart(userId);
}

async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
    prisma.cart.update({ where: { id: cart.id }, data: { promotionId: null } }),
  ]);
  return getCart(userId);
}

async function applyCoupon(userId, code) {
  const cart = await getOrCreateCart(userId);
  if (cart.items.length === 0) {
    throw AppError.unprocessable('Adicione itens ao carrinho antes de aplicar um cupom.');
  }

  const subtotal = calculateTotals({
    items: cart.items.map((item) => ({ unitPrice: getEffectivePrice(item.product), quantity: item.quantity })),
  }).subtotal;

  const { promotion } = await promotionService.validateCoupon(code, { userId, subtotal });
  await prisma.cart.update({ where: { id: cart.id }, data: { promotionId: promotion.id } });
  return getCart(userId);
}

async function removeCoupon(userId) {
  const cart = await getOrCreateCart(userId);
  await prisma.cart.update({ where: { id: cart.id }, data: { promotionId: null } });
  return getCart(userId);
}

module.exports = {
  cartInclude,
  getOrCreateCart,
  getCart,
  addItem,
  setItemQuantity,
  incrementItem,
  decrementItem,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
};
