const test = require('node:test');
const assert = require('node:assert/strict');
const { parsePagination, buildPagination, MAX_LIMIT } = require('../../src/utils/pagination');
const { generateOrderNumber } = require('../../src/utils/orderNumber');
const { slugify } = require('../../src/utils/slug');
const AppError = require('../../src/utils/AppError');
const { pick } = require('../../src/utils/pick');

test('parsePagination aplica padrões e limites', () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 20, skip: 0, take: 20 });
  assert.deepEqual(parsePagination({ page: '3', limit: '10' }), { page: 3, limit: 10, skip: 20, take: 10 });
  assert.equal(parsePagination({ limit: '9999' }).limit, MAX_LIMIT);
  assert.equal(parsePagination({ page: '-4' }).page, 1);
});

test('buildPagination calcula totalPages', () => {
  assert.deepEqual(buildPagination({ page: 1, limit: 20, total: 100 }), { page: 1, limit: 20, total: 100, totalPages: 5 });
  assert.equal(buildPagination({ page: 1, limit: 20, total: 101 }).totalPages, 6);
  assert.equal(buildPagination({ page: 1, limit: 20, total: 0 }).totalPages, 0);
});

test('generateOrderNumber segue o formato DV-AAAAMMDD-XXXXXX', () => {
  const number = generateOrderNumber(new Date(2026, 9, 9));
  assert.match(number, /^DV-20261009-[A-HJ-NP-Z2-9]{6}$/);
  assert.notEqual(generateOrderNumber(), generateOrderNumber());
});

test('slugify remove acentos e símbolos', () => {
  assert.equal(slugify('Bolo de Cenoura com Cobertura!'), 'bolo-de-cenoura-com-cobertura');
  assert.equal(slugify('Cafés'), 'cafes');
  assert.equal(slugify('  Pão de Queijo  '), 'pao-de-queijo');
});

test('AppError carrega status e detalhes', () => {
  const error = AppError.conflict('duplicado', [{ field: 'email' }]);
  assert.equal(error.statusCode, 409);
  assert.equal(error.isOperational, true);
  assert.deepEqual(error.errors, [{ field: 'email' }]);
  assert.equal(AppError.unauthorized().statusCode, 401);
  assert.equal(AppError.forbidden().statusCode, 403);
  assert.equal(AppError.notFound().statusCode, 404);
  assert.equal(AppError.unprocessable().statusCode, 422);
});

test('pick copia somente chaves permitidas (anti mass assignment)', () => {
  assert.deepEqual(pick({ name: 'A', role: 'ADMIN', price: 1 }, ['name', 'price']), { name: 'A', price: 1 });
});
