const prisma = require('../config/database');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { getGateway } = require('./paymentGateway');
const notificationService = require('./notificationService');

const CARD_METHODS = ['CREDIT_CARD', 'DEBIT_CARD'];

const PAYMENT_METHODS = [
  { method: 'PIX', label: 'PIX', description: 'Gera um código PIX; o pagamento é confirmado depois (simulado).', online: true },
  { method: 'CREDIT_CARD', label: 'Cartão de crédito', description: 'Aprovação imediata (simulada).', online: true },
  { method: 'DEBIT_CARD', label: 'Cartão de débito', description: 'Aprovação imediata (simulada).', online: true },
  { method: 'CASH', label: 'Dinheiro', description: 'Pago na entrega ou na retirada.', online: false },
];

function listPaymentMethods() {
  return PAYMENT_METHODS;
}

/**
 * Cobra o pedido no gateway. É chamado DENTRO da transação do pedido: se o pagamento
 * for recusado, lançamos um erro e toda a transação (estoque, cupom, pedido) é desfeita.
 * Com um gateway real, o ideal é autorizar fora da transação e confirmar via webhook.
 */
async function authorizePayment({ method, amount, card }) {
  const result = await getGateway().charge({ method, amount, card });

  if (result.status === 'DECLINED') {
    throw AppError.unprocessable(`Pagamento recusado. ${result.failureReason || ''}`.trim(), [
      { field: 'card', message: result.failureReason || 'Pagamento recusado.' },
    ]);
  }

  return { ...result, provider: getGateway().name };
}

async function findPaymentForUser(user, orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order || (user.role !== 'ADMIN' && order.userId !== user.id)) {
    throw AppError.notFound('Pedido não encontrado.');
  }
  if (!order.payment) throw AppError.notFound('Pagamento não encontrado para este pedido.');

  return order;
}

async function getPaymentByOrder(user, orderId) {
  const order = await findPaymentForUser(user, orderId);
  return { orderId: order.id, orderNumber: order.orderNumber, orderStatus: order.orderStatus, payment: order.payment };
}

/**
 * Marca o pagamento como aprovado dentro de uma transação.
 * Se o pedido ainda estiver PENDING, ele avança automaticamente para CONFIRMED.
 */
async function approvePayment(tx, order, { note = 'Pagamento aprovado.' } = {}) {
  const now = new Date();
  await tx.payment.update({ where: { orderId: order.id }, data: { status: 'APPROVED', paidAt: now } });

  const data = { paymentStatus: 'APPROVED' };
  let confirmed = false;

  if (order.orderStatus === 'PENDING') {
    data.orderStatus = 'CONFIRMED';
    confirmed = true;
  }

  const updated = await tx.order.update({ where: { id: order.id }, data });

  if (confirmed) {
    await tx.orderStatusHistory.create({ data: { orderId: order.id, status: 'CONFIRMED', note } });
    await notificationService.notifyOrderStatus(tx, updated, 'CONFIRMED');
  }

  return updated;
}

/** Simula a confirmação de um pagamento PIX (equivale ao webhook do gateway). */
async function confirmPixPayment(user, orderId) {
  if (!env.payment.allowSimulation) {
    throw AppError.forbidden('A confirmação simulada de pagamento está desabilitada.');
  }

  const found = await findPaymentForUser(user, orderId);
  if (found.payment.method !== 'PIX') {
    throw AppError.unprocessable('Apenas pagamentos PIX podem ser confirmados por esta rota.');
  }
  if (found.orderStatus === 'CANCELLED') throw AppError.conflict('Pedido cancelado não pode ser pago.');
  if (found.payment.status !== 'PENDING') {
    throw AppError.conflict(`Pagamento já está com status ${found.payment.status}.`);
  }

  return prisma.$transaction(async (tx) => {
    await approvePayment(tx, found, { note: 'Pagamento PIX confirmado.' });
    return tx.payment.findUnique({ where: { orderId } });
  });
}

/**
 * Estorno (admin): vale para pagamentos aprovados. Em pedidos cancelados o estorno
 * já é feito automaticamente por orderService.
 */
async function refundPayment(orderId) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order || !order.payment) throw AppError.notFound('Pagamento não encontrado para este pedido.');
  if (order.payment.status !== 'APPROVED') {
    throw AppError.conflict('Somente pagamentos aprovados podem ser estornados.');
  }

  const result = await getGateway().refund({ transactionId: order.payment.transactionId, amount: order.payment.amount });

  return prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { orderId }, data: { status: 'REFUNDED', refundedAt: result.refundedAt } });
    await tx.order.update({ where: { id: orderId }, data: { paymentStatus: 'REFUNDED' } });
    await notificationService.createNotification(tx, {
      userId: order.userId,
      title: 'Pagamento estornado',
      message: `O pagamento do pedido ${order.orderNumber} foi estornado.`,
      type: 'PAYMENT',
      data: { orderId },
    });
    return tx.payment.findUnique({ where: { orderId } });
  });
}

module.exports = {
  CARD_METHODS,
  listPaymentMethods,
  authorizePayment,
  getPaymentByOrder,
  approvePayment,
  confirmPixPayment,
  refundPayment,
};
