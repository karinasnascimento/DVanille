const prisma = require('../config/database');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { parsePagination, buildPagination } = require('../utils/pagination');
const { generateOrderNumber } = require('../utils/orderNumber');
const { getEffectivePrice, calculateTotals, calculateDeliveryFee, toCents, fromCents } = require('../utils/money');
const { normalizeCouponCode } = require('../utils/promotionRules');
const {
  CUSTOMER_CANCELLABLE_STATUSES,
  getAllowedTransitions,
  canTransition,
} = require('../utils/orderStatus');
const { getGateway } = require('./paymentGateway');
const paymentService = require('./paymentService');
const promotionService = require('./promotionService');
const notificationService = require('./notificationService');
const loyaltyService = require('./loyaltyService');

const TRANSACTION_OPTIONS = { maxWait: 5000, timeout: 20000 };

const orderInclude = {
  items: { orderBy: { id: 'asc' } },
  payment: true,
  statusHistory: { orderBy: { createdAt: 'asc' } },
};

function serializeOrder(order, { includeAllowedTransitions = false } = {}) {
  if (!order) return order;

  const serialized = {
    ...order,
    canCancel: CUSTOMER_CANCELLABLE_STATUSES.includes(order.orderStatus),
  };
  if (includeAllowedTransitions) {
    serialized.allowedNextStatuses = getAllowedTransitions(order.orderStatus, order.deliveryType);
  }
  return serialized;
}

function snapshotAddress(address) {
  const { label, recipientName, street, number, complement, neighborhood, city, state, zipCode, reference } = address;
  return { label, recipientName, street, number, complement, neighborhood, city, state, zipCode, reference };
}

async function resolveDeliveryAddress(client, userId, { deliveryType, addressId }) {
  if (deliveryType !== 'DELIVERY') return null;

  if (!addressId) {
    throw AppError.unprocessable('Informe o endereço de entrega.', [
      { field: 'addressId', message: 'Endereço obrigatório para entrega.' },
    ]);
  }

  const address = await client.address.findFirst({ where: { id: addressId, userId } });
  if (!address) {
    throw AppError.unprocessable('Endereço de entrega inválido.', [{ field: 'addressId', message: 'Endereço inválido.' }]);
  }
  return address;
}

/** Calcula subtotal, desconto, taxa de entrega e total a partir dos itens e do cupom. */
function priceOrder({ items, promotion, deliveryType }) {
  const base = calculateTotals({ items, promotion });
  const deliveryFee = calculateDeliveryFee({
    deliveryType,
    baseFee: env.delivery.fee,
    freeAboveOrderValue: env.delivery.freeAboveOrderValue,
    orderValue: base.subtotal - base.discount,
  });
  return calculateTotals({ items, promotion, deliveryFee });
}

/** Cupom enviado no checkout tem prioridade sobre o aplicado ao carrinho. */
async function resolvePromotion(client, userId, cart, couponCode, subtotal) {
  const code = couponCode ? normalizeCouponCode(couponCode) : cart.promotion?.code;
  if (!code) return null;

  const { promotion } = await promotionService.validateCoupon(code, { userId, subtotal }, client);
  return promotion;
}

/**
 * Cria o pedido a partir do carrinho do usuário, tudo em UMA transação:
 * valida carrinho -> reserva estoque -> valida cupom -> cobra pagamento -> grava pedido,
 * itens, pagamento e histórico -> esvazia o carrinho. Qualquer falha desfaz tudo (rollback).
 */
async function createOrder(userId, input) {
  const { deliveryType, addressId, paymentMethod, notes, couponCode, card } = input;

  const orderId = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } }, promotion: true },
    });
    if (!cart || cart.items.length === 0) throw AppError.unprocessable('Seu carrinho está vazio.');

    const address = await resolveDeliveryAddress(tx, userId, { deliveryType, addressId });

    // Ordem fixa por produto reduz a chance de deadlock entre pedidos simultâneos.
    const cartItems = [...cart.items].sort((a, b) => a.productId - b.productId);
    const orderItems = [];

    for (const item of cartItems) {
      const { product } = item;
      if (!product.isActive || !product.isAvailable) {
        throw AppError.conflict(`O produto "${product.name}" não está mais disponível. Remova-o do carrinho.`);
      }

      // Baixa condicional: só decrementa se ainda houver estoque (evita condição de corrida).
      // eslint-disable-next-line no-await-in-loop
      const reserved = await tx.product.updateMany({
        where: { id: product.id, isActive: true, isAvailable: true, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (reserved.count !== 1) {
        throw AppError.conflict(`Estoque insuficiente para "${product.name}".`, [
          { field: 'items', message: `Produto ${product.id} sem estoque suficiente.` },
        ]);
      }

      const unitPrice = getEffectivePrice(product); // preço do banco, congelado no item
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal: fromCents(toCents(unitPrice) * item.quantity),
      });
    }

    const pricingItems = orderItems.map(({ unitPrice, quantity }) => ({ unitPrice, quantity }));
    const baseSubtotal = calculateTotals({ items: pricingItems }).subtotal;
    const promotion = await resolvePromotion(tx, userId, cart, couponCode, baseSubtotal);

    if (promotion) {
      // Reserva atômica de uso: respeita o limite mesmo com pedidos simultâneos.
      const claimed = await tx.promotion.updateMany({
        where: {
          id: promotion.id,
          isActive: true,
          ...(promotion.usageLimit !== null ? { usedCount: { lt: promotion.usageLimit } } : {}),
        },
        data: { usedCount: { increment: 1 } },
      });
      if (claimed.count !== 1) throw AppError.unprocessable('O limite de usos deste cupom foi atingido.');
    }

    const totals = priceOrder({ items: pricingItems, promotion, deliveryType });
    const payment = await paymentService.authorizePayment({ method: paymentMethod, amount: totals.total, card });
    const paid = payment.status === 'APPROVED';

    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId: address ? address.id : null,
        deliveryAddress: address ? snapshotAddress(address) : undefined,
        promotionId: promotion ? promotion.id : null,
        couponCode: promotion ? promotion.code : null,
        subtotal: totals.subtotal,
        discount: totals.discount,
        deliveryFee: totals.deliveryFee,
        total: totals.total,
        paymentMethod,
        paymentStatus: payment.status,
        orderStatus: paid ? 'CONFIRMED' : 'PENDING',
        deliveryType,
        notes: notes || null,
        items: { create: orderItems },
        payment: {
          create: {
            method: paymentMethod,
            status: payment.status,
            amount: totals.total,
            provider: payment.provider,
            transactionId: payment.transactionId,
            pixCode: payment.pixCode,
            cardBrand: payment.cardBrand,
            cardLast4: payment.cardLast4,
            paidAt: payment.paidAt,
          },
        },
        statusHistory: {
          create: [
            { status: 'PENDING', note: 'Pedido criado.' },
            ...(paid ? [{ status: 'CONFIRMED', note: 'Pagamento aprovado.' }] : []),
          ],
        },
      },
    });

    if (promotion) {
      await tx.promotionUsage.create({
        data: { promotionId: promotion.id, userId, orderId: order.id, discountAmount: totals.discount },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({ where: { id: cart.id }, data: { promotionId: null } });

    await notificationService.notifyOrderStatus(tx, order, 'PENDING');
    if (paid) await notificationService.notifyOrderStatus(tx, order, 'CONFIRMED');

    return order.id;
  }, TRANSACTION_OPTIONS);

  return getOrderById({ id: userId, role: 'CUSTOMER' }, orderId);
}

/** Simula o checkout (sem reservar estoque nem cobrar): mostra totais, taxa e cupom. */
async function quoteOrder(userId, { deliveryType, addressId, couponCode }) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } }, promotion: true },
  });
  if (!cart || cart.items.length === 0) throw AppError.unprocessable('Seu carrinho está vazio.');

  await resolveDeliveryAddress(prisma, userId, { deliveryType, addressId });

  const items = cart.items.map((item) => ({ unitPrice: getEffectivePrice(item.product), quantity: item.quantity }));
  const baseSubtotal = calculateTotals({ items }).subtotal;
  const promotion = await resolvePromotion(prisma, userId, cart, couponCode, baseSubtotal);
  const totals = priceOrder({ items, promotion, deliveryType });

  const unavailableItems = cart.items
    .filter((item) => !item.product.isActive || !item.product.isAvailable || item.product.stock < item.quantity)
    .map((item) => ({ productId: item.productId, name: item.product.name }));

  return {
    ...totals,
    deliveryType,
    couponCode: promotion ? promotion.code : null,
    canCheckout: unavailableItems.length === 0,
    unavailableItems,
  };
}

// ---------- Consulta ----------

async function getOrderById(actor, id) {
  const isAdmin = actor.role === 'ADMIN';
  const order = await prisma.order.findFirst({
    where: { id, ...(isAdmin ? {} : { userId: actor.id }) },
    include: {
      ...orderInclude,
      ...(isAdmin ? { user: { select: { id: true, name: true, email: true, phone: true } } } : {}),
    },
  });

  if (!order) throw AppError.notFound('Pedido não encontrado.');
  return serializeOrder(order, { includeAllowedTransitions: isAdmin });
}

async function listUserOrders(userId, query = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = { userId };
  if (query.status) where.orderStatus = query.status;

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, payment: { select: { method: true, status: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  return { items: items.map((order) => serializeOrder(order)), pagination: buildPagination({ page, limit, total }) };
}

async function listAllOrders(query = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = {};

  if (query.status) where.orderStatus = query.status;
  if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
  if (query.deliveryType) where.deliveryType = query.deliveryType;
  if (query.userId) where.userId = Number(query.userId);
  if (query.search) {
    where.OR = [
      { orderNumber: { contains: query.search } },
      { user: { name: { contains: query.search } } },
      { user: { email: { contains: query.search } } },
    ];
  }
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
    if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        payment: { select: { method: true, status: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items: items.map((order) => serializeOrder(order, { includeAllowedTransitions: true })),
    pagination: buildPagination({ page, limit, total }),
  };
}

/** Linha do tempo para o app (Flutter/Web) acompanhar o pedido. */
async function getOrderTracking(actor, id) {
  const order = await getOrderById(actor, id);

  const flow =
    order.deliveryType === 'DELIVERY'
      ? ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED']
      : ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];

  const reachedAt = {};
  order.statusHistory.forEach((entry) => {
    if (!reachedAt[entry.status]) reachedAt[entry.status] = entry.createdAt;
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    deliveryType: order.deliveryType,
    isCancelled: order.orderStatus === 'CANCELLED',
    steps: flow.map((status) => ({ status, reached: Boolean(reachedAt[status]), reachedAt: reachedAt[status] || null })),
    history: order.statusHistory,
  };
}

// ---------- Mudança de status ----------

/** Efeitos do cancelamento: devolve estoque, libera o cupom e estorna/encerra o pagamento. */
async function applyCancellationEffects(tx, order) {
  const sortedItems = [...order.items].sort((a, b) => a.productId - b.productId);
  for (const item of sortedItems) {
    // eslint-disable-next-line no-await-in-loop
    await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
  }

  if (order.promotionId) {
    await tx.promotion.updateMany({
      where: { id: order.promotionId, usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    });
    await tx.promotionUsage.deleteMany({ where: { orderId: order.id } });
  }

  if (!order.payment) return {};

  if (order.payment.status === 'APPROVED') {
    const refund = await getGateway().refund({ transactionId: order.payment.transactionId, amount: order.payment.amount });
    await tx.payment.update({ where: { orderId: order.id }, data: { status: 'REFUNDED', refundedAt: refund.refundedAt } });
    return { paymentStatus: 'REFUNDED' };
  }

  if (order.payment.status === 'PENDING') {
    await tx.payment.update({
      where: { orderId: order.id },
      data: { status: 'DECLINED', failureReason: 'Pedido cancelado antes do pagamento.' },
    });
    return { paymentStatus: 'DECLINED' };
  }

  return {};
}

/**
 * Altera o status respeitando a máquina de estados.
 * - ADMIN: qualquer transição válida.
 * - CUSTOMER: somente cancelar o próprio pedido enquanto PENDING/CONFIRMED.
 */
async function changeOrderStatus(orderId, nextStatus, { actor, note } = {}) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true, payment: true } });
    if (!order || (actor.role !== 'ADMIN' && order.userId !== actor.id)) {
      throw AppError.notFound('Pedido não encontrado.');
    }

    if (actor.role !== 'ADMIN') {
      if (nextStatus !== 'CANCELLED') throw AppError.forbidden('Você só pode cancelar o seu pedido.');
      if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.orderStatus)) {
        throw AppError.conflict('Este pedido já está em preparo e não pode mais ser cancelado pelo app. Fale com a loja.');
      }
    }

    if (!canTransition(order.orderStatus, nextStatus, order.deliveryType)) {
      const allowed = getAllowedTransitions(order.orderStatus, order.deliveryType);
      throw AppError.conflict(`Transição de status inválida: ${order.orderStatus} -> ${nextStatus}.`, [
        { field: 'status', message: `Próximos status permitidos: ${allowed.length ? allowed.join(', ') : 'nenhum'}.` },
      ]);
    }

    if (nextStatus === 'PREPARING' && order.paymentMethod !== 'CASH' && order.paymentStatus !== 'APPROVED') {
      throw AppError.conflict('O pagamento deste pedido ainda não foi aprovado.');
    }

    const data = { orderStatus: nextStatus };

    if (nextStatus === 'CANCELLED') {
      Object.assign(data, await applyCancellationEffects(tx, order));
      data.cancelledAt = new Date();
    }

    if (nextStatus === 'DELIVERED') {
      data.deliveredAt = new Date();
      // Dinheiro: o pagamento é recebido na entrega/retirada.
      if (order.payment && order.payment.status === 'PENDING') {
        await tx.payment.update({ where: { orderId }, data: { status: 'APPROVED', paidAt: new Date() } });
        data.paymentStatus = 'APPROVED';
      }
    }

    const updated = await tx.order.update({ where: { id: orderId }, data });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: nextStatus,
        note: note || (actor.role === 'ADMIN' ? 'Status alterado pela loja.' : 'Cancelado pelo cliente.'),
      },
    });

    await notificationService.notifyOrderStatus(tx, updated, nextStatus);
    if (nextStatus === 'DELIVERED') await loyaltyService.awardPointsForOrder(tx, updated);
  }, TRANSACTION_OPTIONS);

  return getOrderById(actor, orderId);
}

module.exports = {
  orderInclude,
  priceOrder,
  createOrder,
  quoteOrder,
  getOrderById,
  listUserOrders,
  listAllOrders,
  getOrderTracking,
  changeOrderStatus,
};
