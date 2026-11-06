const test = require('node:test');
const assert = require('node:assert/strict');
const {
  toCents,
  fromCents,
  getEffectivePrice,
  isOnPromotion,
  calculateDiscountCents,
  calculateDeliveryFee,
  calculateTotals,
} = require('../../src/utils/money');

test('toCents/fromCents evitam erro de ponto flutuante', () => {
  assert.equal(toCents(0.1 + 0.2), 30);
  assert.equal(toCents('12.90'), 1290);
  assert.equal(fromCents(1290), 12.9);
});

test('getEffectivePrice usa o preço promocional apenas quando é menor que o normal', () => {
  assert.equal(getEffectivePrice({ price: 14.9, promotionalPrice: 12.9 }), 12.9);
  assert.equal(getEffectivePrice({ price: 14.9, promotionalPrice: null }), 14.9);
  assert.equal(getEffectivePrice({ price: 14.9, promotionalPrice: 20 }), 14.9);
  assert.equal(getEffectivePrice({ price: '10.00', promotionalPrice: '8.00' }), 8);
  assert.equal(isOnPromotion({ price: 10, promotionalPrice: 8 }), true);
  assert.equal(isOnPromotion({ price: 10, promotionalPrice: null }), false);
});

test('calculateDiscountCents: percentual, fixo e limitado ao subtotal', () => {
  assert.equal(calculateDiscountCents({ type: 'PERCENTAGE', value: 10 }, 5000), 500);
  assert.equal(calculateDiscountCents({ type: 'FIXED', value: 5 }, 5000), 500);
  assert.equal(calculateDiscountCents({ type: 'FIXED', value: 100 }, 5000), 5000);
  assert.equal(calculateDiscountCents(null, 5000), 0);
});

test('calculateTotals: subtotal = preço do banco x quantidade, desconto e taxa', () => {
  const items = [
    { unitPrice: 12.9, quantity: 2 },
    { unitPrice: 11.5, quantity: 1 },
  ];
  const totals = calculateTotals({ items, promotion: { type: 'PERCENTAGE', value: 10 }, deliveryFee: 8 });

  assert.deepEqual(totals, { subtotal: 37.3, discount: 3.73, deliveryFee: 8, total: 41.57 });
});

test('calculateTotals sem cupom e sem entrega', () => {
  const totals = calculateTotals({ items: [{ unitPrice: 5.5, quantity: 3 }] });
  assert.deepEqual(totals, { subtotal: 16.5, discount: 0, deliveryFee: 0, total: 16.5 });
});

test('calculateDeliveryFee: retirada não paga taxa; entrega grátis acima do mínimo', () => {
  assert.equal(calculateDeliveryFee({ deliveryType: 'PICKUP', baseFee: 8, orderValue: 10 }), 0);
  assert.equal(calculateDeliveryFee({ deliveryType: 'DELIVERY', baseFee: 8, orderValue: 10 }), 8);
  assert.equal(calculateDeliveryFee({ deliveryType: 'DELIVERY', baseFee: 8, freeAboveOrderValue: 50, orderValue: 60 }), 0);
  assert.equal(calculateDeliveryFee({ deliveryType: 'DELIVERY', baseFee: 8, freeAboveOrderValue: 50, orderValue: 49.99 }), 8);
});
