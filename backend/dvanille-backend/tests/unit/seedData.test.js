const test = require('node:test');
const assert = require('node:assert/strict');
const { CATEGORIES, PRODUCTS, PROMOTIONS, buildProductData } = require('../../prisma/seedData');

const categoryIds = Object.fromEntries(CATEGORIES.map((category, index) => [category.name, index + 1]));
const products = PRODUCTS.map((row) => buildProductData(row, categoryIds));

test('todo produto do seed aponta para uma categoria existente e tem SKU único', () => {
  products.forEach((product) => assert.ok(product.categoryId, product.name));
  const skus = products.map((product) => product.sku);
  assert.equal(new Set(skus).size, skus.length);
});

test('regras de coerência alimentar (vegano, lactose, promoção)', () => {
  products.forEach((product) => {
    if (product.isVegan) {
      assert.equal(product.isVegetarian, true, `${product.name}: vegano deve ser vegetariano`);
      assert.equal(product.containsMilk || product.containsLactose || product.containsEggs, false, product.name);
    }
    if (product.containsLactose) assert.equal(product.containsMilk, true, product.name);
    if (product.promotionalPrice !== null) assert.ok(product.promotionalPrice < product.price, product.name);
  });
});

test('o seed cobre os cenários pedidos (lactose, glúten, vegano, vegetariano, promoção)', () => {
  assert.ok(products.some((p) => p.containsLactose));
  assert.ok(products.some((p) => !p.containsLactose));
  assert.ok(products.some((p) => p.containsGluten));
  assert.ok(products.some((p) => !p.containsGluten));
  assert.ok(products.some((p) => p.isVegan));
  assert.ok(products.some((p) => p.isVegetarian));
  assert.ok(products.some((p) => p.promotionalPrice !== null));
  assert.ok(products.some((p) => p.stock === 0 && !p.isAvailable), 'um produto indisponível para testes');
});

test('cupons do seed: códigos únicos e um de cada cenário de validação', () => {
  const codes = PROMOTIONS.map((promotion) => promotion.code);
  assert.equal(new Set(codes).size, codes.length);
  const now = Date.now();
  assert.ok(PROMOTIONS.some((p) => p.endsAt.getTime() < now), 'expirado');
  assert.ok(PROMOTIONS.some((p) => p.startsAt.getTime() > now), 'futuro');
  assert.ok(PROMOTIONS.some((p) => p.isActive === false), 'inativo');
});
