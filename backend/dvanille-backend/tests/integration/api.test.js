/**
 * Testes de integração da API D'Vanille.
 *
 * Exigem um MySQL acessível em DATABASE_URL com as migrations aplicadas
 * (use um banco de desenvolvimento/teste, NUNCA o de produção).
 * Sem banco disponível, o teste é marcado como "skipped" com um aviso.
 *
 *   npm run test:integration
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const helpers = require('../helpers/testApp');
const env = require('../../src/config/env');

const { prisma, PREFIX } = helpers;
const EMAIL_DOMAIN = '@teste.dvanille.com';
const CODE_PREFIX = PREFIX.toUpperCase();

const expectStatus = (response, status) =>
  assert.equal(response.status, status, `esperado ${status}, recebido ${response.status}: ${JSON.stringify(response.body)}`);

const futureCard = (number) => ({
  number,
  holderName: 'CLIENTE TESTE',
  expiryMonth: 12,
  expiryYear: new Date().getFullYear() + 3,
  cvv: '123',
});

test("API D'Vanille (integração com MySQL)", async (t) => {
  if (!(await helpers.isDatabaseAvailable())) {
    console.warn('\n[integração] MySQL indisponível em DATABASE_URL. Testes de integração ignorados.\n');
    t.skip('MySQL indisponível');
    await prisma.$disconnect();
    return;
  }

  const { server, baseUrl } = await helpers.startServer();
  const api = helpers.createClient(baseUrl);

  t.after(async () => {
    await helpers.cleanup();
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  });

  const state = {};

  const registerCustomer = async (label) => {
    const email = `${PREFIX}-${label}${EMAIL_DOMAIN}`;
    const response = await api('POST', '/api/auth/register', {
      body: { name: `Cliente ${label}`, email, password: 'Senha@123', phone: '(11) 99999-0000' },
    });
    expectStatus(response, 201);
    return { email, token: response.body.data.token, id: response.body.data.user.id };
  };

  // ------------------------------------------------------------------
  await t.test('health check informa banco conectado', async () => {
    const response = await api('GET', '/api/health');
    expectStatus(response, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.database, 'connected');
  });

  await t.test('rota inexistente devolve 404 no padrão da API; Swagger disponível', async () => {
    const notFound = await api('GET', '/api/nao-existe');
    expectStatus(notFound, 404);
    assert.equal(notFound.body.success, false);
    assert.ok(Array.isArray(notFound.body.errors));

    const docs = await api('GET', '/api/docs.json');
    expectStatus(docs, 200);
    assert.equal(docs.body.openapi, '3.0.3');
  });

  // ------------------------------------------------------------------
  await t.test('cadastro: sucesso, sem vazar senha e sempre como CUSTOMER', async () => {
    const email = `${PREFIX}-c1${EMAIL_DOMAIN}`;
    const response = await api('POST', '/api/auth/register', {
      body: { name: 'Cliente Um', email, password: 'Senha@123', phone: '(11) 99999-0000', role: 'ADMIN' },
    });

    expectStatus(response, 201);
    assert.equal(response.body.success, true);
    assert.ok(response.body.data.token);
    assert.equal(response.body.data.user.email, email);
    assert.equal(response.body.data.user.role, 'CUSTOMER', 'o papel nunca vem do cliente');
    assert.equal(JSON.stringify(response.body).includes('passwordHash'), false);

    const stored = await prisma.user.findUnique({ where: { email } });
    assert.notEqual(stored.passwordHash, 'Senha@123');
    assert.match(stored.passwordHash, /^\$2[aby]\$/);

    state.c1 = { email, token: response.body.data.token, id: response.body.data.user.id };
  });

  await t.test('cadastro: e-mail duplicado (409) e dados inválidos (422)', async () => {
    const duplicate = await api('POST', '/api/auth/register', {
      body: { name: 'Outro', email: state.c1.email, password: 'Senha@123' },
    });
    expectStatus(duplicate, 409);

    const weak = await api('POST', '/api/auth/register', {
      body: { name: 'Fraco', email: `${PREFIX}-fraco${EMAIL_DOMAIN}`, password: 'abc' },
    });
    expectStatus(weak, 422);
    assert.ok(weak.body.errors.length > 0);

    const badEmail = await api('POST', '/api/auth/register', {
      body: { name: 'Email Ruim', email: 'nao-e-email', password: 'Senha@123' },
    });
    expectStatus(badEmail, 422);
  });

  await t.test('login: sucesso e falhas', async () => {
    const ok = await api('POST', '/api/auth/login', { body: { email: state.c1.email, password: 'Senha@123' } });
    expectStatus(ok, 200);
    assert.ok(ok.body.data.token);

    expectStatus(await api('POST', '/api/auth/login', { body: { email: state.c1.email, password: 'errada123' } }), 401);
    expectStatus(await api('POST', '/api/auth/login', { body: { email: `${PREFIX}-x${EMAIL_DOMAIN}`, password: 'Senha@123' } }), 401);
    expectStatus(await api('POST', '/api/auth/login', { body: {} }), 422);
  });

  await t.test('autenticação: /me exige token válido; logout encerra a sessão', async () => {
    expectStatus(await api('GET', '/api/auth/me'), 401);
    expectStatus(await api('GET', '/api/auth/me', { token: 'token.invalido.aqui' }), 401);

    const me = await api('GET', '/api/auth/me', { token: state.c1.token });
    expectStatus(me, 200);
    assert.equal(me.body.data.email, state.c1.email);

    const login = await api('POST', '/api/auth/login', { body: { email: state.c1.email, password: 'Senha@123' } });
    const throwaway = login.body.data.token;
    expectStatus(await api('GET', '/api/auth/me', { token: throwaway }), 200);
    expectStatus(await api('POST', '/api/auth/logout', { token: throwaway }), 200);
    expectStatus(await api('GET', '/api/auth/me', { token: throwaway }), 401);
    // o outro token continua válido
    expectStatus(await api('GET', '/api/auth/me', { token: state.c1.token }), 200);
  });

  // ------------------------------------------------------------------
  await t.test('prepara admin, categoria e produtos (via API administrativa)', async () => {
    const admin = await helpers.createAdminUser('admin');
    const login = await api('POST', '/api/auth/login', { body: { email: admin.email, password: admin.password } });
    expectStatus(login, 200);
    state.adminToken = login.body.data.token;

    const category = await api('POST', '/api/categories', { token: state.adminToken, body: { name: `${PREFIX} Categoria` } });
    expectStatus(category, 201);
    state.categoryId = category.body.data.id;

    const create = async (body) => {
      const response = await api('POST', '/api/products', { token: state.adminToken, body: { categoryId: state.categoryId, ...body } });
      expectStatus(response, 201);
      return response.body.data;
    };

    state.pA = await create({
      name: `${PREFIX} Produto A`, sku: `${PREFIX}-A`, price: 10, stock: 5, isVegan: true, isVegetarian: true, containsSugar: true,
    });
    state.pB = await create({
      name: `${PREFIX} Produto B`, sku: `${PREFIX}-B`, price: 20, promotionalPrice: 15, stock: 10,
      containsLactose: true, containsMilk: true, containsGluten: true, isVegetarian: true,
    });
    state.pC = await create({ name: `${PREFIX} Produto C`, sku: `${PREFIX}-C`, price: 8, stock: 3, isAvailable: false });
    state.pRace = await create({ name: `${PREFIX} Produto Race`, sku: `${PREFIX}-R`, price: 5, stock: 1 });

    const invalidPromo = await api('POST', '/api/products', {
      token: state.adminToken,
      body: { categoryId: state.categoryId, name: `${PREFIX} Invalido`, price: 10, promotionalPrice: 10, stock: 1 },
    });
    expectStatus(invalidPromo, 422);
  });

  await t.test('permissões: usuário comum não acessa rotas administrativas', async () => {
    const productBody = { categoryId: state.categoryId, name: `${PREFIX} Proibido`, price: 1, stock: 1 };

    expectStatus(await api('POST', '/api/products', { body: productBody }), 401);
    expectStatus(await api('POST', '/api/products', { token: state.c1.token, body: productBody }), 403);
    expectStatus(await api('GET', '/api/admin/dashboard', { token: state.c1.token }), 403);
    expectStatus(await api('GET', '/api/admin/users', { token: state.c1.token }), 403);
    expectStatus(await api('GET', '/api/admin/orders', { token: state.c1.token }), 403);
    expectStatus(await api('PATCH', '/api/admin/stock/1', { token: state.c1.token, body: { adjustment: 1 } }), 403);
    expectStatus(await api('GET', '/api/admin/dashboard'), 401);

    const dashboard = await api('GET', '/api/admin/dashboard', { token: state.adminToken });
    expectStatus(dashboard, 200);
    ['users', 'products', 'orders', 'revenue', 'topProducts', 'recentOrders'].forEach((key) => assert.ok(key in dashboard.body.data, key));
  });

  // ------------------------------------------------------------------
  await t.test('produtos: listagem pública, busca, filtros alimentares, preço e paginação', async () => {
    const list = async (query) => {
      const response = await api('GET', `/api/products?limit=100&search=${encodeURIComponent(PREFIX)}${query}`);
      expectStatus(response, 200);
      return response.body.data.map((product) => product.id).sort();
    };
    const ids = (...products) => products.map((product) => product.id).sort();

    assert.deepEqual(await list(''), ids(state.pA, state.pB, state.pC, state.pRace));
    assert.deepEqual(await list('&vegan=true'), ids(state.pA));
    assert.deepEqual(await list('&lactoseFree=true'), ids(state.pA, state.pC, state.pRace));
    assert.deepEqual(await list('&glutenFree=true'), ids(state.pA, state.pC, state.pRace));
    assert.deepEqual(await list('&onPromotion=true'), ids(state.pB));
    assert.deepEqual(await list('&available=true'), ids(state.pA, state.pB, state.pRace));
    assert.deepEqual(await list('&minPrice=12&maxPrice=16'), ids(state.pB), 'usa o preço promocional (15)');
    assert.deepEqual(await list(`&categoryId=${state.categoryId}&vegetarian=true`), ids(state.pA, state.pB));

    const paged = await api('GET', `/api/products?page=1&limit=2&search=${encodeURIComponent(PREFIX)}`);
    expectStatus(paged, 200);
    assert.equal(paged.body.data.length, 2);
    assert.deepEqual(paged.body.pagination, { page: 1, limit: 2, total: 4, totalPages: 2 });
  });

  await t.test('produtos: detalhe (id e slug), preço efetivo e disponibilidade', async () => {
    const byId = await api('GET', `/api/products/${state.pB.id}`);
    expectStatus(byId, 200);
    assert.equal(byId.body.data.effectivePrice, 15);
    assert.equal(byId.body.data.isOnPromotion, true);
    assert.equal(byId.body.data.dietary.lactoseFree, false);

    expectStatus(await api('GET', `/api/products/${state.pB.slug}`), 200);
    expectStatus(await api('GET', '/api/products/999999999'), 404);

    const unavailable = await api('GET', `/api/products/${state.pC.id}/availability`);
    expectStatus(unavailable, 200);
    assert.equal(unavailable.body.data.inStock, false);
  });

  // ------------------------------------------------------------------
  await t.test('carrinho: preço vem do banco, estoque e disponibilidade são respeitados', async () => {
    const empty = await api('GET', '/api/cart', { token: state.c1.token });
    expectStatus(empty, 200);
    assert.equal(empty.body.data.total, 0);

    expectStatus(await api('GET', '/api/cart'), 401);
    expectStatus(await api('POST', '/api/cart/items', { token: state.c1.token, body: { productId: state.pC.id, quantity: 1 } }), 409);
    expectStatus(await api('POST', '/api/cart/items', { token: state.c1.token, body: { productId: 999999999 } }), 404);
    expectStatus(await api('POST', '/api/cart/items', { token: state.c1.token, body: { productId: state.pA.id, quantity: 0 } }), 422);

    // O cliente tenta impor um preço: é ignorado.
    const added = await api('POST', '/api/cart/items', { token: state.c1.token, body: { productId: state.pA.id, quantity: 2, price: 0.01, unitPrice: 0.01 } });
    expectStatus(added, 200);
    assert.equal(added.body.data.items[0].unitPrice, 10);
    assert.equal(added.body.data.items[0].subtotal, 20);

    // 2 + 4 > estoque (5)
    expectStatus(await api('POST', '/api/cart/items', { token: state.c1.token, body: { productId: state.pA.id, quantity: 4 } }), 409);

    const withPromo = await api('POST', '/api/cart/items', { token: state.c1.token, body: { productId: state.pB.id, quantity: 1 } });
    expectStatus(withPromo, 200);
    assert.equal(withPromo.body.data.items.find((item) => item.productId === state.pB.id).unitPrice, 15);
    assert.equal(withPromo.body.data.subtotal, 35);
  });

  await t.test('carrinho: aumentar, diminuir, alterar, remover e limpar', async () => {
    const inc = await api('POST', `/api/cart/items/${state.pA.id}/increment`, { token: state.c1.token });
    expectStatus(inc, 200);
    assert.equal(inc.body.data.items.find((item) => item.productId === state.pA.id).quantity, 3);

    const dec = await api('POST', `/api/cart/items/${state.pA.id}/decrement`, { token: state.c1.token });
    assert.equal(dec.body.data.items.find((item) => item.productId === state.pA.id).quantity, 2);

    const patch = await api('PATCH', `/api/cart/items/${state.pA.id}`, { token: state.c1.token, body: { quantity: 4 } });
    expectStatus(patch, 200);
    expectStatus(await api('PATCH', `/api/cart/items/${state.pA.id}`, { token: state.c1.token, body: { quantity: 6 } }), 409);
    expectStatus(await api('PATCH', `/api/cart/items/${state.pA.id}`, { token: state.c1.token, body: { quantity: 2 } }), 200);

    const removed = await api('DELETE', `/api/cart/items/${state.pB.id}`, { token: state.c1.token });
    expectStatus(removed, 200);
    assert.equal(removed.body.data.items.length, 1);

    expectStatus(await api('DELETE', `/api/cart/items/${state.pB.id}`, { token: state.c1.token }), 404);

    const cleared = await api('DELETE', '/api/cart', { token: state.c1.token });
    expectStatus(cleared, 200);
    assert.equal(cleared.body.data.items.length, 0);

    // Deixa o carrinho pronto para os próximos testes: A x2 + B x1 = 35,00
    await api('POST', '/api/cart/items', { token: state.c1.token, body: { productId: state.pA.id, quantity: 2 } });
    await api('POST', '/api/cart/items', { token: state.c1.token, body: { productId: state.pB.id, quantity: 1 } });
  });

  await t.test('cupons: inexistente, expirado, abaixo do mínimo e válido', async () => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const base = { type: 'PERCENTAGE', value: 10, isActive: true, perUserLimit: 1 };
    state.couponOk = `${CODE_PREFIX}-OK10`;
    state.couponExpired = `${CODE_PREFIX}-EXP`;
    state.couponHigh = `${CODE_PREFIX}-ALTO`;

    await prisma.promotion.createMany({
      data: [
        { ...base, name: 'Teste OK', code: state.couponOk, startsAt: new Date(now - day), endsAt: new Date(now + 30 * day), minOrderValue: 20, usageLimit: 100 },
        { ...base, name: 'Teste Expirado', code: state.couponExpired, startsAt: new Date(now - 10 * day), endsAt: new Date(now - day) },
        { ...base, name: 'Teste Mínimo Alto', code: state.couponHigh, startsAt: new Date(now - day), endsAt: new Date(now + 30 * day), minOrderValue: 500 },
      ],
    });

    expectStatus(await api('POST', '/api/cart/coupon', { token: state.c1.token, body: { code: 'NAOEXISTE999' } }), 404);
    expectStatus(await api('POST', '/api/cart/coupon', { token: state.c1.token, body: { code: state.couponExpired } }), 422);
    expectStatus(await api('POST', '/api/cart/coupon', { token: state.c1.token, body: { code: state.couponHigh } }), 422);

    const applied = await api('POST', '/api/cart/coupon', { token: state.c1.token, body: { code: state.couponOk.toLowerCase() } });
    expectStatus(applied, 200);
    assert.equal(applied.body.data.subtotal, 35);
    assert.equal(applied.body.data.discount, 3.5);
    assert.equal(applied.body.data.total, 31.5);
    assert.equal(applied.body.data.coupon.valid, true);
  });

  // ------------------------------------------------------------------
  await t.test('pedido: validações de carrinho vazio e de entrega', async () => {
    state.c2 = await registerCustomer('c2');
    expectStatus(await api('POST', '/api/orders', { token: state.c2.token, body: { deliveryType: 'PICKUP', paymentMethod: 'CASH' } }), 422);

    // Entrega exige endereço (validação) e o endereço precisa ser do próprio usuário
    expectStatus(await api('POST', '/api/orders', { token: state.c1.token, body: { deliveryType: 'DELIVERY', paymentMethod: 'CASH' } }), 422);
    expectStatus(await api('POST', '/api/orders', { token: state.c1.token, body: { deliveryType: 'DELIVERY', addressId: 999999999, paymentMethod: 'CASH' } }), 422);
    expectStatus(await api('POST', '/api/orders', { token: state.c1.token, body: { deliveryType: 'PICKUP', paymentMethod: 'BITCOIN' } }), 422);

    const address = await api('POST', '/api/addresses', {
      token: state.c1.token,
      body: { label: 'Casa', recipientName: 'Cliente Um', street: 'Rua das Flores', number: '123', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zipCode: '01001-000' },
    });
    expectStatus(address, 201);
    assert.equal(address.body.data.isDefault, true, 'o primeiro endereço é o padrão');
    state.addressId = address.body.data.id;

    // Endereço de outro usuário não pode ser usado
    expectStatus(await api('POST', '/api/orders', { token: state.c2.token, body: { deliveryType: 'DELIVERY', addressId: state.addressId, paymentMethod: 'CASH' } }), 422);

    const quote = await api('POST', '/api/orders/quote', { token: state.c1.token, body: { deliveryType: 'DELIVERY', addressId: state.addressId } });
    expectStatus(quote, 200);
    const freeDelivery = env.delivery.freeAboveOrderValue > 0 && 31.5 >= env.delivery.freeAboveOrderValue;
    const expectedFee = freeDelivery ? 0 : env.delivery.fee;
    assert.equal(quote.body.data.deliveryFee, expectedFee);
    assert.equal(quote.body.data.canCheckout, true);
  });

  await t.test('pedido (retirada + dinheiro): estoque reservado, preço congelado e carrinho esvaziado', async () => {
    const response = await api('POST', '/api/orders', {
      token: state.c1.token,
      body: { deliveryType: 'PICKUP', paymentMethod: 'CASH', notes: 'Sem açúcar' },
    });
    expectStatus(response, 201);

    const order = response.body.data;
    state.order1 = order;
    assert.equal(order.orderStatus, 'PENDING');
    assert.equal(order.paymentStatus, 'PENDING');
    assert.equal(order.subtotal, 35);
    assert.equal(order.discount, 3.5);
    assert.equal(order.deliveryFee, 0, 'retirada não paga entrega');
    assert.equal(order.total, 31.5);
    assert.equal(order.couponCode, state.couponOk);
    assert.equal(order.deliveryAddress, null);
    assert.match(order.orderNumber, /^DV-\d{8}-[A-Z0-9]{6}$/);
    assert.equal(order.items.length, 2);

    const itemA = order.items.find((item) => item.productId === state.pA.id);
    const itemB = order.items.find((item) => item.productId === state.pB.id);
    assert.equal(itemA.unitPrice, 10);
    assert.equal(itemB.unitPrice, 15);

    // Estoque reduzido
    assert.equal((await prisma.product.findUnique({ where: { id: state.pA.id } })).stock, 3);
    assert.equal((await prisma.product.findUnique({ where: { id: state.pB.id } })).stock, 9);

    // Carrinho esvaziado
    const cart = await api('GET', '/api/cart', { token: state.c1.token });
    assert.equal(cart.body.data.items.length, 0);
    assert.equal(cart.body.data.coupon, null);

    // Preço congelado: o admin muda o preço do produto e o pedido antigo permanece igual
    const priceChange = await api('PUT', `/api/products/${state.pB.id}`, { token: state.adminToken, body: { promotionalPrice: null, price: 50 } });
    expectStatus(priceChange, 200);
    const reloaded = await api('GET', `/api/orders/${order.id}`, { token: state.c1.token });
    expectStatus(reloaded, 200);
    assert.equal(reloaded.body.data.items.find((item) => item.productId === state.pB.id).unitPrice, 15);
    assert.equal(reloaded.body.data.total, 31.5);
  });

  await t.test('pedido: isolamento entre usuários e cupom de uso único', async () => {
    expectStatus(await api('GET', `/api/orders/${state.order1.id}`, { token: state.c2.token }), 404);
    expectStatus(await api('POST', `/api/orders/${state.order1.id}/cancel`, { token: state.c2.token }), 404);

    // Mesmo cliente tenta reutilizar o cupom: pedido recusado e NADA é alterado (rollback)
    await api('POST', '/api/cart/items', { token: state.c1.token, body: { productId: state.pA.id, quantity: 1 } });
    const stockBefore = (await prisma.product.findUnique({ where: { id: state.pA.id } })).stock;
    const reuse = await api('POST', '/api/orders', { token: state.c1.token, body: { deliveryType: 'PICKUP', paymentMethod: 'CASH', couponCode: state.couponOk } });
    expectStatus(reuse, 422);
    assert.equal((await prisma.product.findUnique({ where: { id: state.pA.id } })).stock, stockBefore, 'estoque não pode mudar quando o pedido falha');
    const cart = await api('GET', '/api/cart', { token: state.c1.token });
    assert.equal(cart.body.data.items.length, 1, 'carrinho preservado após falha');
    await api('DELETE', '/api/cart', { token: state.c1.token });
  });

  await t.test('cancelamento pelo cliente devolve estoque e libera o cupom', async () => {
    const cancel = await api('POST', `/api/orders/${state.order1.id}/cancel`, { token: state.c1.token });
    expectStatus(cancel, 200);
    assert.equal(cancel.body.data.orderStatus, 'CANCELLED');

    assert.equal((await prisma.product.findUnique({ where: { id: state.pA.id } })).stock, 5);
    assert.equal((await prisma.product.findUnique({ where: { id: state.pB.id } })).stock, 10);
    assert.equal((await prisma.promotion.findUnique({ where: { code: state.couponOk } })).usedCount, 0);

    // Cancelado é estado final
    expectStatus(await api('POST', `/api/orders/${state.order1.id}/cancel`, { token: state.c1.token }), 409);
    expectStatus(await api('PATCH', `/api/admin/orders/${state.order1.id}/status`, { token: state.adminToken, body: { status: 'CONFIRMED' } }), 409);
  });

  await t.test('pagamento com cartão: recusado faz rollback; aprovado confirma o pedido sem expor o cartão', async () => {
    await api('POST', '/api/cart/items', { token: state.c1.token, body: { productId: state.pA.id, quantity: 1 } });
    const stockBefore = (await prisma.product.findUnique({ where: { id: state.pA.id } })).stock;

    const declined = await api('POST', '/api/orders', {
      token: state.c1.token,
      body: { deliveryType: 'PICKUP', paymentMethod: 'CREDIT_CARD', card: futureCard('4000 0000 0000 0002') },
    });
    expectStatus(declined, 422);
    assert.equal((await prisma.product.findUnique({ where: { id: state.pA.id } })).stock, stockBefore);
    assert.equal((await api('GET', '/api/cart', { token: state.c1.token })).body.data.items.length, 1);

    expectStatus(await api('POST', '/api/orders', { token: state.c1.token, body: { deliveryType: 'PICKUP', paymentMethod: 'CREDIT_CARD' } }), 422);

    const approved = await api('POST', '/api/orders', {
      token: state.c1.token,
      body: { deliveryType: 'PICKUP', paymentMethod: 'CREDIT_CARD', card: futureCard('4242 4242 4242 4242') },
    });
    expectStatus(approved, 201);
    assert.equal(approved.body.data.paymentStatus, 'APPROVED');
    assert.equal(approved.body.data.orderStatus, 'CONFIRMED');
    assert.equal(approved.body.data.payment.cardLast4, '4242');
    const raw = JSON.stringify(approved.body);
    assert.equal(raw.includes('4242424242424242'), false);
    assert.equal(raw.includes('"cvv"'), false);
    state.cardOrder = approved.body.data;
  });

  // ------------------------------------------------------------------
  await t.test('pedido (entrega + PIX): fluxo de status do admin, pontos de fidelidade e rastreamento', async () => {
    await api('POST', '/api/cart/items', { token: state.c1.token, body: { productId: state.pA.id, quantity: 1 } });
    const created = await api('POST', '/api/orders', {
      token: state.c1.token,
      body: { deliveryType: 'DELIVERY', addressId: state.addressId, paymentMethod: 'PIX' },
    });
    expectStatus(created, 201);
    const order = created.body.data;
    state.order2 = order;

    assert.equal(order.deliveryType, 'DELIVERY');
    assert.equal(order.paymentStatus, 'PENDING');
    assert.equal(order.orderStatus, 'PENDING');
    assert.ok(order.payment.pixCode);
    assert.equal(order.deliveryAddress.street, 'Rua das Flores', 'endereço usado fica salvo no pedido');
    const expectedFee = env.delivery.freeAboveOrderValue > 0 && 10 >= env.delivery.freeAboveOrderValue ? 0 : env.delivery.fee;
    assert.equal(order.deliveryFee, expectedFee);
    assert.equal(order.total, Math.round((10 + expectedFee) * 100) / 100);

    const patch = (status, token = state.adminToken) =>
      api('PATCH', `/api/admin/orders/${order.id}/status`, { token, body: { status } });

    expectStatus(await patch('CONFIRMED', state.c1.token), 403);
    expectStatus(await patch('DELIVERED'), 409); // transição absurda
    expectStatus(await patch('NAO_EXISTE'), 422);

    expectStatus(await patch('CONFIRMED'), 200);

    // Pedido pago por PIX só entra em preparo depois que o pagamento é aprovado
    expectStatus(await patch('PREPARING'), 409);
    const pix = await api('POST', `/api/payments/order/${order.id}/confirm`, { token: state.c1.token });
    expectStatus(pix, 200); // simulação do webhook do gateway
    assert.equal(pix.body.data.status, 'APPROVED');
    expectStatus(await api('POST', `/api/payments/order/${order.id}/confirm`, { token: state.c1.token }), 409);

    expectStatus(await patch('PREPARING'), 200);
    expectStatus(await patch('DELIVERED'), 409); // entrega precisa passar por READY e OUT_FOR_DELIVERY
    expectStatus(await patch('READY'), 200);
    expectStatus(await patch('OUT_FOR_DELIVERY'), 200);
    const delivered = await patch('DELIVERED');
    expectStatus(delivered, 200);
    assert.equal(delivered.body.data.orderStatus, 'DELIVERED');
    assert.ok(delivered.body.data.deliveredAt);
    assert.equal(delivered.body.data.paymentStatus, 'APPROVED');

    // Cliente não cancela pedido entregue
    expectStatus(await api('POST', `/api/orders/${order.id}/cancel`, { token: state.c1.token }), 409);

    // Fidelidade: R$ 1 = 1 ponto
    const loyalty = await api('GET', '/api/loyalty', { token: state.c1.token });
    expectStatus(loyalty, 200);
    assert.equal(loyalty.body.data.totalEarned, Math.floor(order.total * env.loyalty.pointsPerReal));
    const history = await api('GET', '/api/loyalty/history', { token: state.c1.token });
    assert.equal(history.body.data[0].type, 'EARNED');

    // Rastreamento
    const tracking = await api('GET', `/api/orders/${order.id}/tracking`, { token: state.c1.token });
    expectStatus(tracking, 200);
    assert.ok(tracking.body.data.steps.every((step) => step.reached));

    // Notificações geradas
    const notifications = await api('GET', '/api/notifications?unread=true', { token: state.c1.token });
    expectStatus(notifications, 200);
    assert.ok(notifications.body.data.length > 0);
    const readAll = await api('PATCH', '/api/notifications/read-all', { token: state.c1.token });
    expectStatus(readAll, 200);
    assert.equal((await api('GET', '/api/notifications/unread-count', { token: state.c1.token })).body.data.unreadCount, 0);

    // Admin enxerga o pedido e a listagem
    const adminList = await api('GET', `/api/admin/orders?status=DELIVERED&search=${encodeURIComponent(order.orderNumber)}`, { token: state.adminToken });
    expectStatus(adminList, 200);
    assert.equal(adminList.body.pagination.total, 1);
  });

  await t.test('avaliações: somente quem comprou e recebeu o produto', async () => {
    const body = { productId: state.pA.id, rating: 5, comment: 'Ótimo!' };

    expectStatus(await api('POST', '/api/reviews', { token: state.c2.token, body }), 403);
    expectStatus(await api('POST', '/api/reviews', { token: state.c1.token, body: { ...body, rating: 6 } }), 422);
    expectStatus(await api('POST', '/api/reviews', { token: state.c1.token, body: { ...body, productId: state.pB.id } }), 403); // B só estava no pedido cancelado

    expectStatus(await api('POST', '/api/reviews', { token: state.c1.token, body }), 201);
    expectStatus(await api('POST', '/api/reviews', { token: state.c1.token, body }), 409);

    const reviews = await api('GET', `/api/products/${state.pA.id}/reviews`);
    expectStatus(reviews, 200);
    assert.equal(reviews.body.meta.summary.count, 1);
    assert.equal(reviews.body.meta.summary.average, 5);
  });

  // ------------------------------------------------------------------
  await t.test('favoritos: sem duplicidade', async () => {
    const add = await api('POST', '/api/favorites', { token: state.c1.token, body: { productId: state.pA.id } });
    expectStatus(add, 201);
    expectStatus(await api('POST', '/api/favorites', { token: state.c1.token, body: { productId: state.pA.id } }), 409);
    assert.equal((await api('GET', `/api/favorites/${state.pA.id}/check`, { token: state.c1.token })).body.data.isFavorite, true);
    assert.equal((await api('GET', '/api/favorites', { token: state.c1.token })).body.data.length, 1);
    expectStatus(await api('DELETE', `/api/favorites/${state.pA.id}`, { token: state.c1.token }), 200);
    assert.equal((await api('GET', `/api/favorites/${state.pA.id}/check`, { token: state.c1.token })).body.data.isFavorite, false);
    expectStatus(await api('DELETE', `/api/favorites/${state.pA.id}`, { token: state.c1.token }), 404);
  });

  await t.test('estoque (admin): ajuste, valor absoluto e proteção contra estoque negativo', async () => {
    const before = (await prisma.product.findUnique({ where: { id: state.pA.id } })).stock;

    expectStatus(await api('PATCH', `/api/admin/stock/${state.pA.id}`, { token: state.adminToken, body: { adjustment: -9999 } }), 409);
    expectStatus(await api('PATCH', `/api/admin/stock/${state.pA.id}`, { token: state.adminToken, body: { adjustment: 5, stock: 1 } }), 422);

    const adjusted = await api('PATCH', `/api/admin/stock/${state.pA.id}`, { token: state.adminToken, body: { adjustment: 5 } });
    expectStatus(adjusted, 200);
    assert.equal(adjusted.body.data.stock, before + 5);

    const absolute = await api('PATCH', `/api/admin/stock/${state.pA.id}`, { token: state.adminToken, body: { stock: 7 } });
    assert.equal(absolute.body.data.stock, 7);

    const stockList = await api('GET', `/api/admin/stock?search=${encodeURIComponent(PREFIX)}`, { token: state.adminToken });
    expectStatus(stockList, 200);
    assert.ok(stockList.body.data.length >= 4);
  });

  await t.test('concorrência: dois pedidos disputando a última unidade -> apenas um é aceito', async () => {
    const c3 = await registerCustomer('c3');
    for (const customer of [state.c2, c3]) {
      expectStatus(await api('POST', '/api/cart/items', { token: customer.token, body: { productId: state.pRace.id, quantity: 1 } }), 200);
    }

    const attempt = (customer) =>
      api('POST', '/api/orders', { token: customer.token, body: { deliveryType: 'PICKUP', paymentMethod: 'CASH' } });
    const results = await Promise.all([attempt(state.c2), attempt(c3)]);

    assert.deepEqual(results.map((result) => result.status).sort(), [201, 409], JSON.stringify(results.map((r) => r.body)));
    assert.equal((await prisma.product.findUnique({ where: { id: state.pRace.id } })).stock, 0, 'estoque nunca fica negativo');
  });

  await t.test('administração de usuários: desativar bloqueia o login', async () => {
    const users = await api('GET', `/api/admin/users?search=${encodeURIComponent(PREFIX)}`, { token: state.adminToken });
    expectStatus(users, 200);
    assert.ok(users.body.data.length >= 3);
    assert.equal(JSON.stringify(users.body).includes('passwordHash'), false);

    const toggle = await api('PATCH', `/api/admin/users/${state.c2.id}/status`, { token: state.adminToken, body: { isActive: false } });
    expectStatus(toggle, 200);
    expectStatus(await api('GET', '/api/auth/me', { token: state.c2.token }), 403);
    expectStatus(await api('POST', '/api/auth/login', { body: { email: state.c2.email, password: 'Senha@123' } }), 403);
  });
});
