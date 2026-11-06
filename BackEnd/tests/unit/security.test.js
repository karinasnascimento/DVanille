process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'segredo-de-teste-com-mais-de-32-caracteres-0123456789';

const test = require('node:test');
const assert = require('node:assert/strict');
const { signToken, verifyToken } = require('../../src/utils/jwt');
const { hashPassword, comparePassword } = require('../../src/utils/password');

test('JWT carrega apenas sub, role e jti (nunca senha)', () => {
  const token = signToken({ id: 7, role: 'ADMIN', passwordHash: 'segredo', email: 'a@a.com' });
  const payload = verifyToken(token);

  assert.equal(payload.sub, '7');
  assert.equal(payload.role, 'ADMIN');
  assert.ok(payload.jti);
  assert.ok(payload.exp);
  assert.equal(JSON.stringify(payload).includes('segredo'), false);
  assert.equal('email' in payload, false);
});

test('token adulterado é rejeitado', () => {
  const token = signToken({ id: 1, role: 'CUSTOMER' });
  assert.throws(() => verifyToken(`${token}x`));
});

test('senha é armazenada com hash e validada', async () => {
  const hash = await hashPassword('Senha@123');
  assert.notEqual(hash, 'Senha@123');
  assert.match(hash, /^\$2[aby]\$/);
  assert.equal(await comparePassword('Senha@123', hash), true);
  assert.equal(await comparePassword('errada', hash), false);
});
