/**
 * Cálculos monetários feitos em centavos (inteiros) para evitar erros de ponto flutuante.
 * Valores de entrada/saída públicos continuam em reais (Number com 2 casas).
 */

const toCents = (value) => Math.round(Number(value) * 100);
const fromCents = (cents) => Math.round(cents) / 100;

/** Preço praticado hoje: promocional (se válido e menor que o normal) ou o preço normal. */
function getEffectivePrice(product) {
  const price = Number(product.price);
  if (product.promotionalPrice === null || product.promotionalPrice === undefined) return price;

  const promotional = Number(product.promotionalPrice);
  return promotional > 0 && promotional < price ? promotional : price;
}

function isOnPromotion(product) {
  return getEffectivePrice(product) < Number(product.price);
}

/** Desconto de um cupom em centavos, limitado ao subtotal. */
function calculateDiscountCents(promotion, subtotalCents) {
  if (!promotion) return 0;

  const value = Number(promotion.value);
  const raw =
    promotion.type === 'PERCENTAGE' ? Math.round((subtotalCents * value) / 100) : toCents(value);

  return Math.min(Math.max(raw, 0), subtotalCents);
}

/**
 * Taxa de entrega. Entrega grátis quando o valor do pedido (após desconto)
 * atinge o mínimo configurado (0 desativa o benefício).
 */
function calculateDeliveryFee({ deliveryType, baseFee, freeAboveOrderValue = 0, orderValue }) {
  if (deliveryType !== 'DELIVERY') return 0;
  if (freeAboveOrderValue > 0 && orderValue >= freeAboveOrderValue) return 0;
  return fromCents(toCents(baseFee));
}

/**
 * Totais do pedido/carrinho.
 * items: [{ unitPrice, quantity }]
 */
function calculateTotals({ items, promotion = null, deliveryFee = 0 }) {
  const subtotalCents = items.reduce((sum, item) => sum + toCents(item.unitPrice) * item.quantity, 0);
  const discountCents = calculateDiscountCents(promotion, subtotalCents);
  const deliveryFeeCents = toCents(deliveryFee);

  return {
    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    deliveryFee: fromCents(deliveryFeeCents),
    total: fromCents(subtotalCents - discountCents + deliveryFeeCents),
  };
}

module.exports = {
  toCents,
  fromCents,
  getEffectivePrice,
  isOnPromotion,
  calculateDiscountCents,
  calculateDeliveryFee,
  calculateTotals,
};
