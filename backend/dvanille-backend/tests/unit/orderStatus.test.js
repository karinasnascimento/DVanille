const test = require('node:test');
const assert = require('node:assert/strict');
const { ORDER_STATUSES, getAllowedTransitions, canTransition, CUSTOMER_CANCELLABLE_STATUSES } = require('../../src/utils/orderStatus');

test('fluxo completo de ENTREGA', () => {
  const flow = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  for (let i = 0; i < flow.length - 1; i += 1) {
    assert.equal(canTransition(flow[i], flow[i + 1], 'DELIVERY'), true, `${flow[i]} -> ${flow[i + 1]}`);
  }
});

test('fluxo de RETIRADA vai de READY direto para DELIVERED e nunca usa OUT_FOR_DELIVERY', () => {
  assert.equal(canTransition('READY', 'DELIVERED', 'PICKUP'), true);
  assert.equal(canTransition('READY', 'OUT_FOR_DELIVERY', 'PICKUP'), false);
  assert.equal(canTransition('READY', 'DELIVERED', 'DELIVERY'), false);
});

test('transições absurdas são bloqueadas', () => {
  assert.equal(canTransition('PENDING', 'DELIVERED', 'DELIVERY'), false);
  assert.equal(canTransition('PENDING', 'PREPARING', 'DELIVERY'), false);
  assert.equal(canTransition('DELIVERED', 'PENDING', 'DELIVERY'), false);
  assert.equal(canTransition('CANCELLED', 'CONFIRMED', 'DELIVERY'), false);
  assert.equal(canTransition('PREPARING', 'CONFIRMED', 'DELIVERY'), false);
});

test('cancelamento permitido até READY, mas não depois de sair para entrega', () => {
  ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].forEach((status) => {
    assert.equal(canTransition(status, 'CANCELLED', 'DELIVERY'), true, status);
  });
  assert.equal(canTransition('OUT_FOR_DELIVERY', 'CANCELLED', 'DELIVERY'), false);
  assert.deepEqual(getAllowedTransitions('DELIVERED', 'DELIVERY'), []);
});

test('cliente só cancela enquanto PENDING/CONFIRMED', () => {
  assert.deepEqual(CUSTOMER_CANCELLABLE_STATUSES, ['PENDING', 'CONFIRMED']);
});

test('todos os status do enum têm regra de transição', () => {
  ORDER_STATUSES.forEach((status) => assert.ok(Array.isArray(getAllowedTransitions(status, 'DELIVERY'))));
});
