const test = require('node:test');
const assert = require('node:assert/strict');
const { getGateway, detectCardBrand, isCardExpired } = require('../../src/services/paymentGateway');

const gateway = getGateway();
const futureCard = (number) => ({ number, holderName: 'TESTE', expiryMonth: 12, expiryYear: new Date().getFullYear() + 2, cvv: '123' });

test('gateway padrão é o simulado', () => assert.equal(gateway.name, 'simulated'));

test('cartão aprovado devolve somente bandeira e 4 últimos dígitos', async () => {
  const result = await gateway.charge({ method: 'CREDIT_CARD', amount: 30, card: futureCard('4242424242424242') });
  assert.equal(result.status, 'APPROVED');
  assert.equal(result.cardBrand, 'VISA');
  assert.equal(result.cardLast4, '4242');
  assert.ok(result.paidAt instanceof Date);

  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes('4242424242424242'), false, 'número completo não pode vazar');
  assert.equal('cvv' in result, false, 'cvv não deve existir no resultado');
});

test('cartão terminado em 0002 é recusado', async () => {
  const result = await gateway.charge({ method: 'DEBIT_CARD', amount: 30, card: futureCard('4000000000000002') });
  assert.equal(result.status, 'DECLINED');
  assert.ok(result.failureReason);
});

test('cartão vencido é recusado', async () => {
  const card = { ...futureCard('4242424242424242'), expiryMonth: 1, expiryYear: 2020 };
  const result = await gateway.charge({ method: 'CREDIT_CARD', amount: 30, card });
  assert.equal(result.status, 'DECLINED');
  assert.match(result.failureReason, /expirado/i);
});

test('PIX e dinheiro iniciam PENDING; PIX gera código', async () => {
  const pix = await gateway.charge({ method: 'PIX', amount: 20 });
  assert.equal(pix.status, 'PENDING');
  assert.ok(pix.pixCode);
  const cash = await gateway.charge({ method: 'CASH', amount: 20 });
  assert.equal(cash.status, 'PENDING');
});

test('estorno', async () => {
  const refund = await gateway.refund({ transactionId: 'x', amount: 10 });
  assert.equal(refund.status, 'REFUNDED');
});

test('detectCardBrand / isCardExpired', () => {
  assert.equal(detectCardBrand('5555555555554444'), 'MASTERCARD');
  assert.equal(detectCardBrand('378282246310005'), 'AMEX');
  assert.equal(isCardExpired({ expiryMonth: 10, expiryYear: 2026 }, new Date('2026-10-15T00:00:00')), false);
  assert.equal(isCardExpired({ expiryMonth: 9, expiryYear: 2026 }, new Date('2026-10-15T00:00:00')), true);
});
