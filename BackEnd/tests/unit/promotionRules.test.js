const test = require('node:test');
const assert = require('node:assert/strict');
const { getPromotionIssue, normalizeCouponCode } = require('../../src/utils/promotionRules');

const NOW = new Date('2026-10-09T12:00:00Z');
const valid = () => ({
  isActive: true,
  startsAt: '2026-10-01T00:00:00Z',
  endsAt: '2026-12-31T00:00:00Z',
  usageLimit: 10,
  usedCount: 0,
  perUserLimit: 1,
  minOrderValue: 20,
});

const check = (promotion, extra = {}) => getPromotionIssue(promotion, { subtotal: 30, userUsageCount: 0, now: NOW, ...extra });

test('cupom válido não tem problemas', () => assert.equal(check(valid()), null));
test('cupom inexistente', () => assert.match(check(null), /inexistente/i));
test('cupom inativo', () => assert.match(check({ ...valid(), isActive: false }), /inativo/i));
test('cupom expirado', () => assert.match(check({ ...valid(), endsAt: '2026-10-01T00:00:00Z' }), /expirado/i));
test('cupom que ainda não começou', () => assert.match(check({ ...valid(), startsAt: '2026-11-01T00:00:00Z' }), /ainda não/i));
test('limite global de usos', () => assert.match(check({ ...valid(), usedCount: 10 }), /limite/i));
test('limite por usuário (duplicidade)', () => assert.match(check(valid(), { userUsageCount: 1 }), /já utilizou/i));
test('valor mínimo do pedido', () => assert.match(check(valid(), { subtotal: 19.99 }), /mínimo/i));
test('sem limite global (null) e sem mínimo', () => {
  assert.equal(check({ ...valid(), usageLimit: null, minOrderValue: null }, { subtotal: 1 }), null);
});
test('normalizeCouponCode', () => assert.equal(normalizeCouponCode('  bemvindo10 '), 'BEMVINDO10'));
