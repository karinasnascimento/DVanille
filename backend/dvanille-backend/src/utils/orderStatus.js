/**
 * Máquina de estados do pedido.
 *
 * PENDING -> CONFIRMED -> PREPARING -> READY -> OUT_FOR_DELIVERY -> DELIVERED   (entrega)
 *                                      READY -> DELIVERED                       (retirada)
 * Cancelamento é permitido até READY. Depois de saiu para entrega, não pode mais cancelar.
 */

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

const TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

/** Status em que o próprio cliente ainda pode cancelar o pedido. */
const CUSTOMER_CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED'];

function getAllowedTransitions(currentStatus, deliveryType) {
  const next = TRANSITIONS[currentStatus] || [];

  if (currentStatus !== 'READY') return [...next];

  // Pedido pronto: entrega segue para "saiu para entrega"; retirada vai direto para entregue.
  return next.filter((status) => {
    if (status === 'CANCELLED') return true;
    return deliveryType === 'DELIVERY' ? status === 'OUT_FOR_DELIVERY' : status === 'DELIVERED';
  });
}

function canTransition(currentStatus, nextStatus, deliveryType) {
  return getAllowedTransitions(currentStatus, deliveryType).includes(nextStatus);
}

module.exports = {
  ORDER_STATUSES,
  TRANSITIONS,
  CUSTOMER_CANCELLABLE_STATUSES,
  getAllowedTransitions,
  canTransition,
};
