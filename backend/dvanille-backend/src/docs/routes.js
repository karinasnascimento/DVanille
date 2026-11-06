/**
 * Fonte única da documentação das rotas.
 * Alimenta o Swagger (/api/docs) e o arquivo docs/API.md (npm run docs:generate).
 *
 * auth: 'none' (público) | 'user' (JWT) | 'admin' (JWT + role ADMIN)
 */

const user = {
  id: 2,
  name: 'Maria Cliente',
  email: 'cliente@dvanille.com',
  phone: '(11) 99999-0000',
  role: 'CUSTOMER',
  profileImage: null,
  isActive: true,
  loyaltyPoints: 120,
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-01T12:00:00.000Z',
};

const authResult = { user, token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', tokenType: 'Bearer', expiresIn: '7d' };

const category = { id: 1, name: 'Cafés', slug: 'cafes', description: 'Cafés especiais', image: null, isActive: true, productCount: 5 };

const product = {
  id: 5,
  categoryId: 1,
  name: 'Cappuccino Cremoso',
  slug: 'cappuccino-cremoso',
  description: 'Espresso, leite vaporizado e espuma cremosa.',
  price: 14.9,
  promotionalPrice: 12.9,
  effectivePrice: 12.9,
  isOnPromotion: true,
  image: '/uploads/products/exemplo.jpg',
  sku: 'CAF-002',
  stock: 40,
  isAvailable: true,
  inStock: true,
  isFeatured: true,
  preparationTime: 6,
  calories: 120,
  containsGluten: false,
  containsLactose: true,
  containsMilk: true,
  isVegetarian: true,
  isVegan: false,
  dietary: { glutenFree: true, lactoseFree: false, vegetarian: true, vegan: false },
  category: { id: 1, name: 'Cafés', slug: 'cafes' },
};

const address = {
  id: 1,
  label: 'Casa',
  recipientName: 'Maria Cliente',
  street: 'Rua das Flores',
  number: '123',
  complement: 'Apto 45',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01001-000',
  reference: 'Próximo à praça',
  isDefault: true,
};

const cart = {
  id: 1,
  items: [
    {
      productId: 5,
      name: 'Cappuccino Cremoso',
      quantity: 2,
      unitPrice: 12.9,
      originalPrice: 14.9,
      subtotal: 25.8,
      isAvailable: true,
      availabilityIssue: null,
    },
  ],
  itemCount: 2,
  hasUnavailableItems: false,
  coupon: { code: 'BEMVINDO10', name: 'Bem-vindo', type: 'PERCENTAGE', value: 10, valid: true, message: null },
  subtotal: 25.8,
  discount: 2.58,
  total: 23.22,
};

const order = {
  id: 10,
  orderNumber: 'DV-20261009-K3M7QA',
  userId: 2,
  deliveryType: 'DELIVERY',
  subtotal: 25.8,
  discount: 2.58,
  deliveryFee: 8,
  total: 31.22,
  paymentMethod: 'PIX',
  paymentStatus: 'PENDING',
  orderStatus: 'PENDING',
  notes: 'Sem açúcar, por favor.',
  deliveryAddress: address,
  items: [{ productId: 5, productName: 'Cappuccino Cremoso', quantity: 2, unitPrice: 12.9, subtotal: 25.8 }],
  payment: { method: 'PIX', status: 'PENDING', amount: 31.22, pixCode: '00020126DVANILLESIMULADO...' },
  statusHistory: [{ status: 'PENDING', note: 'Pedido criado.', createdAt: '2026-10-09T12:00:00.000Z' }],
  canCancel: true,
};

const promotion = {
  id: 1,
  name: 'Bem-vindo',
  description: '10% na primeira compra',
  code: 'BEMVINDO10',
  type: 'PERCENTAGE',
  value: 10,
  startsAt: '2026-01-01T00:00:00.000Z',
  endsAt: '2027-12-31T23:59:59.000Z',
  usageLimit: 1000,
  usedCount: 12,
  perUserLimit: 1,
  minOrderValue: 20,
  isActive: true,
};

const pagination = { page: 1, limit: 20, total: 100, totalPages: 5 };

const productBody = {
  categoryId: 1,
  name: 'Brownie Vegano',
  description: 'Brownie de cacau 70% sem leite e sem ovos.',
  price: 11.5,
  promotionalPrice: null,
  sku: 'DOC-010',
  stock: 25,
  isAvailable: true,
  isFeatured: false,
  preparationTime: 2,
  calories: 310,
  containsGluten: true,
  containsLactose: false,
  containsMilk: false,
  containsEggs: false,
  containsSoy: false,
  containsPeanuts: false,
  containsNuts: false,
  containsSugar: true,
  isVegetarian: true,
  isVegan: true,
  ingredients: 'Farinha, cacau, açúcar, óleo de coco',
  allergens: 'Contém glúten',
};

const addressBody = {
  label: 'Casa',
  recipientName: 'Maria Cliente',
  street: 'Rua das Flores',
  number: '123',
  complement: 'Apto 45',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01001-000',
  reference: 'Próximo à praça',
  isDefault: true,
};

const promotionBody = {
  name: 'Semana do Café',
  description: 'R$ 5 de desconto',
  code: 'CAFE5',
  type: 'FIXED',
  value: 5,
  startsAt: '2026-10-01T00:00:00.000Z',
  endsAt: '2026-12-31T23:59:59.000Z',
  usageLimit: 200,
  perUserLimit: 1,
  minOrderValue: 25,
  isActive: true,
};

const productListQuery = [
  ['page', 'Página (padrão 1)'],
  ['limit', 'Itens por página (1-100, padrão 20)'],
  ['search', 'Busca por nome/descrição'],
  ['categoryId', 'Filtra por id da categoria'],
  ['category', 'Filtra por slug da categoria'],
  ['minPrice / maxPrice', 'Faixa de preço (considera o preço promocional quando existir)'],
  ['featured / available / onPromotion', 'true para filtrar destaques, disponíveis ou em promoção'],
  ['glutenFree, lactoseFree, milkFree, eggFree, soyFree, peanutFree, nutFree, sugarFree', 'true para somente produtos SEM o ingrediente'],
  ['vegetarian / vegan', 'true para somente produtos vegetarianos/veganos'],
  ['sort / order', 'sort: name | price | newest | featured; order: asc | desc'],
];

const pageQuery = [
  ['page', 'Página (padrão 1)'],
  ['limit', 'Itens por página (1-100, padrão 20)'],
];

const checkoutBody = {
  deliveryType: 'DELIVERY',
  addressId: 1,
  paymentMethod: 'CREDIT_CARD',
  couponCode: 'BEMVINDO10',
  notes: 'Sem açúcar, por favor.',
  card: { number: '4242 4242 4242 4242', holderName: 'MARIA CLIENTE', expiryMonth: 12, expiryYear: 2030, cvv: '123' },
};

const routes = [
  // ---------- Saúde ----------
  { tag: 'Saúde', method: 'GET', path: '/api/health', auth: 'none', summary: 'Verifica a API e a conexão com o MySQL', response: { database: 'connected' }, rawResponse: { success: true, message: "D'Vanille API funcionando.", database: 'connected' } },

  // ---------- Autenticação ----------
  { tag: 'Autenticação', method: 'POST', path: '/api/auth/register', auth: 'none', summary: 'Cadastra um cliente e já devolve o JWT', body: { name: 'Maria Cliente', email: 'cliente@dvanille.com', phone: '(11) 99999-0000', password: 'Senha@123' }, response: authResult, status: 201, errors: [409, 422] },
  { tag: 'Autenticação', method: 'POST', path: '/api/auth/login', auth: 'none', summary: 'Login com e-mail e senha', body: { email: 'cliente@dvanille.com', password: 'Cliente@123456' }, response: authResult, errors: [401, 403, 422] },
  { tag: 'Autenticação', method: 'GET', path: '/api/auth/me', auth: 'user', summary: 'Dados do usuário autenticado', response: user },
  { tag: 'Autenticação', method: 'POST', path: '/api/auth/logout', auth: 'user', summary: 'Encerra a sessão (invalida o token atual)', response: null },

  // ---------- Usuários ----------
  { tag: 'Usuários', method: 'GET', path: '/api/users/me', auth: 'user', summary: 'Perfil do usuário', response: user },
  { tag: 'Usuários', method: 'PUT', path: '/api/users/me', auth: 'user', summary: 'Atualiza nome e telefone', body: { name: 'Maria S. Cliente', phone: '(11) 98888-7777' }, response: user, errors: [422] },
  { tag: 'Usuários', method: 'PUT', path: '/api/users/me/password', auth: 'user', summary: 'Altera a senha', body: { currentPassword: 'Cliente@123456', newPassword: 'NovaSenha@789' }, response: null, errors: [422] },
  { tag: 'Usuários', method: 'POST', path: '/api/users/me/avatar', auth: 'user', summary: 'Envia a foto de perfil (multipart, campo "image": JPG/PNG/WEBP)', multipart: true, response: user, errors: [422] },

  // ---------- Endereços ----------
  { tag: 'Endereços', method: 'GET', path: '/api/addresses', auth: 'user', summary: 'Lista os endereços do usuário (padrão primeiro)', response: [address] },
  { tag: 'Endereços', method: 'POST', path: '/api/addresses', auth: 'user', summary: 'Cadastra um endereço (o primeiro vira padrão)', body: addressBody, response: address, status: 201, errors: [422] },
  { tag: 'Endereços', method: 'GET', path: '/api/addresses/:id', auth: 'user', summary: 'Detalha um endereço', response: address, errors: [404] },
  { tag: 'Endereços', method: 'PUT', path: '/api/addresses/:id', auth: 'user', summary: 'Edita um endereço', body: { number: '200', isDefault: true }, response: address, errors: [404, 422] },
  { tag: 'Endereços', method: 'PATCH', path: '/api/addresses/:id/default', auth: 'user', summary: 'Define o endereço padrão', response: address, errors: [404] },
  { tag: 'Endereços', method: 'DELETE', path: '/api/addresses/:id', auth: 'user', summary: 'Exclui um endereço', response: null, errors: [404] },

  // ---------- Categorias ----------
  { tag: 'Categorias', method: 'GET', path: '/api/categories', auth: 'none', summary: 'Lista as categorias ativas (com contagem de produtos)', response: [category] },
  { tag: 'Categorias', method: 'GET', path: '/api/categories/:id', auth: 'none', summary: 'Detalha uma categoria (id numérico ou slug)', response: category, errors: [404] },
  { tag: 'Categorias', method: 'POST', path: '/api/categories', auth: 'admin', summary: 'Cria uma categoria', body: { name: 'Sobremesas', description: 'Doces da casa' }, response: category, status: 201, errors: [409, 422] },
  { tag: 'Categorias', method: 'PUT', path: '/api/categories/:id', auth: 'admin', summary: 'Edita uma categoria', body: { description: 'Nova descrição', isActive: true }, response: category, errors: [404, 409, 422] },
  { tag: 'Categorias', method: 'DELETE', path: '/api/categories/:id', auth: 'admin', summary: 'Exclui a categoria (ou apenas desativa se tiver produtos)', response: { deleted: false, deactivated: true }, errors: [404] },
  { tag: 'Categorias', method: 'POST', path: '/api/categories/:id/image', auth: 'admin', summary: 'Envia a imagem da categoria (multipart, campo "image")', multipart: true, response: category, errors: [404, 422] },

  // ---------- Produtos ----------
  { tag: 'Produtos', method: 'GET', path: '/api/products', auth: 'none', summary: 'Lista/busca produtos com filtros, filtros alimentares e paginação', query: productListQuery, response: [product], paginated: true },
  { tag: 'Produtos', method: 'GET', path: '/api/products/featured', auth: 'none', summary: 'Produtos em destaque disponíveis', query: pageQuery, response: [product], paginated: true },
  { tag: 'Produtos', method: 'GET', path: '/api/products/promotions', auth: 'none', summary: 'Produtos em promoção disponíveis', query: pageQuery, response: [product], paginated: true },
  { tag: 'Produtos', method: 'GET', path: '/api/products/:id', auth: 'none', summary: 'Detalhes do produto (id ou slug), com nota média', response: { ...product, rating: { average: 4.7, count: 12 } }, errors: [404] },
  { tag: 'Produtos', method: 'GET', path: '/api/products/:id/availability', auth: 'none', summary: 'Verifica disponibilidade e estoque', response: { productId: 5, name: 'Cappuccino Cremoso', isAvailable: true, stock: 40, inStock: true, maxQuantity: 40 }, errors: [404] },
  { tag: 'Produtos', method: 'GET', path: '/api/products/:id/reviews', auth: 'none', summary: 'Avaliações do produto + resumo (média e distribuição)', query: pageQuery, response: [{ id: 1, rating: 5, comment: 'Delicioso!', user: { id: 2, name: 'Maria Cliente' } }], paginated: true, meta: { summary: { average: 4.7, count: 12, distribution: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 9 } } } },
  { tag: 'Produtos', method: 'POST', path: '/api/products', auth: 'admin', summary: 'Cria um produto', body: productBody, response: product, status: 201, errors: [409, 422] },
  { tag: 'Produtos', method: 'PUT', path: '/api/products/:id', auth: 'admin', summary: 'Edita um produto (campos opcionais)', body: { price: 12, promotionalPrice: 10 }, response: product, errors: [404, 409, 422] },
  { tag: 'Produtos', method: 'DELETE', path: '/api/products/:id', auth: 'admin', summary: 'Exclui (ou desativa, se já foi vendido)', response: { deleted: false, deactivated: true }, errors: [404] },
  { tag: 'Produtos', method: 'POST', path: '/api/products/:id/image', auth: 'admin', summary: 'Envia a imagem do produto (multipart, campo "image")', multipart: true, response: product, errors: [404, 422] },

  // ---------- Favoritos ----------
  { tag: 'Favoritos', method: 'GET', path: '/api/favorites', auth: 'user', summary: 'Lista os favoritos', query: pageQuery, response: [{ id: 1, productId: 5, product }], paginated: true },
  { tag: 'Favoritos', method: 'POST', path: '/api/favorites', auth: 'user', summary: 'Favorita um produto (sem duplicar)', body: { productId: 5 }, response: { id: 1, productId: 5, product }, status: 201, errors: [404, 409] },
  { tag: 'Favoritos', method: 'GET', path: '/api/favorites/:productId/check', auth: 'user', summary: 'O produto está favoritado?', response: { productId: 5, isFavorite: true } },
  { tag: 'Favoritos', method: 'DELETE', path: '/api/favorites/:productId', auth: 'user', summary: 'Remove dos favoritos', response: null, errors: [404] },

  // ---------- Carrinho ----------
  { tag: 'Carrinho', method: 'GET', path: '/api/cart', auth: 'user', summary: 'Carrinho com preços reais do banco, subtotal, desconto e total', response: cart },
  { tag: 'Carrinho', method: 'DELETE', path: '/api/cart', auth: 'user', summary: 'Limpa o carrinho (e remove o cupom)', response: { ...cart, items: [], itemCount: 0, coupon: null, subtotal: 0, discount: 0, total: 0 } },
  { tag: 'Carrinho', method: 'POST', path: '/api/cart/items', auth: 'user', summary: 'Adiciona produto (preço NUNCA vem do cliente)', body: { productId: 5, quantity: 2 }, response: cart, errors: [404, 409, 422] },
  { tag: 'Carrinho', method: 'PATCH', path: '/api/cart/items/:productId', auth: 'user', summary: 'Altera a quantidade', body: { quantity: 3 }, response: cart, errors: [404, 409, 422] },
  { tag: 'Carrinho', method: 'POST', path: '/api/cart/items/:productId/increment', auth: 'user', summary: 'Aumenta a quantidade em 1', response: cart, errors: [404, 409] },
  { tag: 'Carrinho', method: 'POST', path: '/api/cart/items/:productId/decrement', auth: 'user', summary: 'Diminui em 1 (remove ao chegar em zero)', response: cart, errors: [404] },
  { tag: 'Carrinho', method: 'DELETE', path: '/api/cart/items/:productId', auth: 'user', summary: 'Remove o produto do carrinho', response: cart, errors: [404] },
  { tag: 'Carrinho', method: 'POST', path: '/api/cart/coupon', auth: 'user', summary: 'Aplica um cupom ao carrinho', body: { code: 'BEMVINDO10' }, response: cart, errors: [404, 422] },
  { tag: 'Carrinho', method: 'DELETE', path: '/api/cart/coupon', auth: 'user', summary: 'Remove o cupom do carrinho', response: cart },

  // ---------- Pedidos ----------
  { tag: 'Pedidos', method: 'POST', path: '/api/orders/quote', auth: 'user', summary: 'Simula o checkout (totais, taxa de entrega, cupom) sem criar pedido', body: { deliveryType: 'DELIVERY', addressId: 1, couponCode: 'BEMVINDO10' }, response: { subtotal: 25.8, discount: 2.58, deliveryFee: 8, total: 31.22, deliveryType: 'DELIVERY', couponCode: 'BEMVINDO10', canCheckout: true, unavailableItems: [] }, errors: [404, 422] },
  { tag: 'Pedidos', method: 'POST', path: '/api/orders', auth: 'user', summary: 'Cria o pedido a partir do carrinho (transação: estoque, cupom, pagamento, pontos)', body: checkoutBody, response: order, status: 201, errors: [404, 409, 422] },
  { tag: 'Pedidos', method: 'GET', path: '/api/orders', auth: 'user', summary: 'Meus pedidos', query: [...pageQuery, ['status', 'Filtra pelo status do pedido']], response: [order], paginated: true },
  { tag: 'Pedidos', method: 'GET', path: '/api/orders/:id', auth: 'user', summary: 'Detalhes do meu pedido', response: order, errors: [404] },
  { tag: 'Pedidos', method: 'GET', path: '/api/orders/:id/tracking', auth: 'user', summary: 'Linha do tempo para acompanhar o status', response: { orderId: 10, orderNumber: 'DV-20261009-K3M7QA', orderStatus: 'PREPARING', steps: [{ status: 'PENDING', reached: true, reachedAt: '2026-10-09T12:00:00.000Z' }, { status: 'CONFIRMED', reached: true, reachedAt: '2026-10-09T12:01:00.000Z' }, { status: 'PREPARING', reached: true, reachedAt: '2026-10-09T12:05:00.000Z' }, { status: 'READY', reached: false, reachedAt: null }] }, errors: [404] },
  { tag: 'Pedidos', method: 'POST', path: '/api/orders/:id/cancel', auth: 'user', summary: 'Cancela o meu pedido (somente PENDING/CONFIRMED); devolve estoque, cupom e estorna', response: order, errors: [404, 409] },

  // ---------- Pagamentos ----------
  { tag: 'Pagamentos', method: 'GET', path: '/api/payments/methods', auth: 'none', summary: 'Métodos de pagamento aceitos', response: [{ method: 'PIX', label: 'PIX', online: true }, { method: 'CASH', label: 'Dinheiro', online: false }] },
  { tag: 'Pagamentos', method: 'GET', path: '/api/payments/order/:orderId', auth: 'user', summary: 'Pagamento de um pedido', response: { orderId: 10, orderStatus: 'PENDING', payment: order.payment }, errors: [404] },
  { tag: 'Pagamentos', method: 'POST', path: '/api/payments/order/:orderId/confirm', auth: 'user', summary: 'SIMULA a confirmação do PIX (equivale ao webhook do gateway)', response: { method: 'PIX', status: 'APPROVED', amount: 31.22 }, errors: [403, 404, 409, 422] },
  { tag: 'Pagamentos', method: 'POST', path: '/api/payments/order/:orderId/refund', auth: 'admin', summary: 'Estorna um pagamento aprovado', response: { method: 'PIX', status: 'REFUNDED', amount: 31.22 }, errors: [404, 409] },

  // ---------- Promoções ----------
  { tag: 'Promoções', method: 'GET', path: '/api/promotions', auth: 'none', summary: 'Cupons vigentes (vitrine)', response: [promotion] },
  { tag: 'Promoções', method: 'POST', path: '/api/promotions/validate', auth: 'user', summary: 'Valida um cupom contra o carrinho atual', body: { code: 'BEMVINDO10' }, response: { valid: true, discount: 2.58 }, errors: [404, 422] },
  { tag: 'Promoções', method: 'GET', path: '/api/promotions/admin/all', auth: 'admin', summary: 'Lista todas as promoções', query: pageQuery, response: [promotion], paginated: true },
  { tag: 'Promoções', method: 'GET', path: '/api/promotions/admin/:id', auth: 'admin', summary: 'Detalha uma promoção', response: promotion, errors: [404] },
  { tag: 'Promoções', method: 'POST', path: '/api/promotions', auth: 'admin', summary: 'Cria uma promoção/cupom', body: promotionBody, response: promotion, status: 201, errors: [409, 422] },
  { tag: 'Promoções', method: 'PUT', path: '/api/promotions/:id', auth: 'admin', summary: 'Edita uma promoção', body: { isActive: false }, response: promotion, errors: [404, 409, 422] },
  { tag: 'Promoções', method: 'DELETE', path: '/api/promotions/:id', auth: 'admin', summary: 'Exclui (ou desativa, se já foi usada)', response: { deleted: false, deactivated: true }, errors: [404] },

  // ---------- Avaliações ----------
  { tag: 'Avaliações', method: 'GET', path: '/api/reviews/me', auth: 'user', summary: 'Minhas avaliações', query: pageQuery, response: [{ id: 1, productId: 5, rating: 5, comment: 'Delicioso!' }], paginated: true },
  { tag: 'Avaliações', method: 'POST', path: '/api/reviews', auth: 'user', summary: 'Avalia um produto comprado e entregue (nota 1 a 5)', body: { productId: 5, rating: 5, comment: 'Delicioso!' }, response: { id: 1, productId: 5, orderId: 10, rating: 5, comment: 'Delicioso!' }, status: 201, errors: [403, 404, 409, 422] },
  { tag: 'Avaliações', method: 'PUT', path: '/api/reviews/:id', auth: 'user', summary: 'Edita minha avaliação', body: { rating: 4 }, response: { id: 1, rating: 4 }, errors: [404, 422] },
  { tag: 'Avaliações', method: 'DELETE', path: '/api/reviews/:id', auth: 'user', summary: 'Apaga minha avaliação', response: null, errors: [404] },

  // ---------- Notificações ----------
  { tag: 'Notificações', method: 'GET', path: '/api/notifications', auth: 'user', summary: 'Lista notificações (?unread=true para só não lidas)', query: [...pageQuery, ['unread', 'true para somente não lidas']], response: [{ id: 1, title: 'Pedido confirmado', message: 'Seu pedido DV-... foi confirmado.', type: 'ORDER_CONFIRMED', isRead: false }], paginated: true },
  { tag: 'Notificações', method: 'GET', path: '/api/notifications/unread-count', auth: 'user', summary: 'Quantidade de não lidas', response: { unreadCount: 3 } },
  { tag: 'Notificações', method: 'PATCH', path: '/api/notifications/read-all', auth: 'user', summary: 'Marca todas como lidas', response: { updated: 3 } },
  { tag: 'Notificações', method: 'PATCH', path: '/api/notifications/:id/read', auth: 'user', summary: 'Marca uma como lida', response: { id: 1, isRead: true }, errors: [404] },

  // ---------- Fidelidade ----------
  { tag: 'Fidelidade', method: 'GET', path: '/api/loyalty', auth: 'user', summary: 'Saldo e totais de pontos (R$ 1 = 1 ponto)', response: { balance: 120, totalEarned: 150, totalRedeemed: 30, pointsPerReal: 1 } },
  { tag: 'Fidelidade', method: 'GET', path: '/api/loyalty/history', auth: 'user', summary: 'Histórico de pontos', query: pageQuery, response: [{ id: 1, type: 'EARNED', points: 31, balanceAfter: 151, description: 'Pontos do pedido DV-...' }], paginated: true },
  { tag: 'Fidelidade', method: 'GET', path: '/api/loyalty/rewards', auth: 'user', summary: 'Recompensas disponíveis', response: [{ id: 1, name: 'Café grátis', pointsCost: 100, isActive: true }] },
  { tag: 'Fidelidade', method: 'POST', path: '/api/loyalty/rewards/:id/redeem', auth: 'user', summary: 'Troca pontos por uma recompensa', response: { balance: 20, reward: { id: 1, name: 'Café grátis' } }, errors: [404, 422] },

  // ---------- Admin ----------
  { tag: 'Admin - Painel', method: 'GET', path: '/api/admin/dashboard', auth: 'admin', summary: 'Estatísticas: usuários, produtos, pedidos, faturamento, mais vendidos, pedidos recentes', response: { users: { total: 42 }, products: { total: 30, lowStock: 2 }, orders: { total: 120, pending: 4, inProgress: 6, completed: 100, cancelled: 10 }, revenue: 5432.1, topProducts: [{ productId: 5, name: 'Cappuccino Cremoso', quantitySold: 80, revenue: 1032 }], recentOrders: [] } },

  { tag: 'Admin - Usuários', method: 'GET', path: '/api/admin/users', auth: 'admin', summary: 'Lista usuários (filtros: search, role, isActive)', query: [...pageQuery, ['search', 'Nome, e-mail ou telefone'], ['role', 'CUSTOMER | ADMIN'], ['isActive', 'true | false']], response: [user], paginated: true },
  { tag: 'Admin - Usuários', method: 'GET', path: '/api/admin/users/:id', auth: 'admin', summary: 'Detalha um usuário', response: user, errors: [404] },
  { tag: 'Admin - Usuários', method: 'PATCH', path: '/api/admin/users/:id/status', auth: 'admin', summary: 'Ativa/desativa um usuário', body: { isActive: false }, response: user, errors: [404, 422] },

  { tag: 'Admin - Produtos', method: 'GET', path: '/api/admin/products', auth: 'admin', summary: 'Lista TODOS os produtos (inclui inativos)', query: productListQuery, response: [product], paginated: true },
  { tag: 'Admin - Produtos', method: 'POST', path: '/api/admin/products', auth: 'admin', summary: 'Cria produto', body: productBody, response: product, status: 201, errors: [409, 422] },
  { tag: 'Admin - Produtos', method: 'PUT', path: '/api/admin/products/:id', auth: 'admin', summary: 'Edita produto', body: { stock: 50, isFeatured: true }, response: product, errors: [404, 409, 422] },
  { tag: 'Admin - Produtos', method: 'DELETE', path: '/api/admin/products/:id', auth: 'admin', summary: 'Exclui/desativa produto', response: { deleted: false, deactivated: true }, errors: [404] },
  { tag: 'Admin - Produtos', method: 'POST', path: '/api/admin/products/:id/image', auth: 'admin', summary: 'Upload da imagem do produto (multipart, campo "image")', multipart: true, response: product, errors: [404, 422] },

  { tag: 'Admin - Categorias', method: 'GET', path: '/api/admin/categories', auth: 'admin', summary: 'Lista todas as categorias (inclui inativas)', response: [category] },
  { tag: 'Admin - Categorias', method: 'POST', path: '/api/admin/categories', auth: 'admin', summary: 'Cria categoria', body: { name: 'Sobremesas' }, response: category, status: 201, errors: [409, 422] },
  { tag: 'Admin - Categorias', method: 'PUT', path: '/api/admin/categories/:id', auth: 'admin', summary: 'Edita categoria', body: { isActive: true }, response: category, errors: [404, 409, 422] },
  { tag: 'Admin - Categorias', method: 'DELETE', path: '/api/admin/categories/:id', auth: 'admin', summary: 'Exclui/desativa categoria', response: { deleted: true, deactivated: false }, errors: [404] },
  { tag: 'Admin - Categorias', method: 'POST', path: '/api/admin/categories/:id/image', auth: 'admin', summary: 'Upload da imagem da categoria (multipart, campo "image")', multipart: true, response: category, errors: [404, 422] },

  { tag: 'Admin - Pedidos', method: 'GET', path: '/api/admin/orders', auth: 'admin', summary: 'Lista pedidos (filtros: status, paymentStatus, deliveryType, userId, search, dateFrom, dateTo)', query: [...pageQuery, ['status', 'Status do pedido'], ['paymentStatus', 'PENDING | APPROVED | DECLINED | REFUNDED'], ['deliveryType', 'DELIVERY | PICKUP'], ['search', 'Nº do pedido, nome ou e-mail'], ['dateFrom / dateTo', 'Datas ISO 8601']], response: [order], paginated: true },
  { tag: 'Admin - Pedidos', method: 'GET', path: '/api/admin/orders/:id', auth: 'admin', summary: 'Detalha um pedido (com cliente e próximos status permitidos)', response: { ...order, allowedNextStatuses: ['CONFIRMED', 'CANCELLED'] }, errors: [404] },
  { tag: 'Admin - Pedidos', method: 'PATCH', path: '/api/admin/orders/:id/status', auth: 'admin', summary: 'Altera o status respeitando as transições válidas', body: { status: 'CONFIRMED', note: 'Pagamento conferido' }, response: { ...order, orderStatus: 'CONFIRMED' }, errors: [404, 409, 422] },

  { tag: 'Admin - Estoque', method: 'GET', path: '/api/admin/stock', auth: 'admin', summary: 'Visualiza o estoque (lowStock=true&threshold=10 para estoque baixo)', query: [...pageQuery, ['lowStock', 'true para somente estoque baixo'], ['threshold', 'Limite de estoque baixo (padrão 10)'], ['search', 'Nome ou SKU']], response: [{ id: 5, name: 'Cappuccino Cremoso', sku: 'CAF-002', stock: 40, isAvailable: true }], paginated: true, meta: { lowStockThreshold: 10 } },
  { tag: 'Admin - Estoque', method: 'PATCH', path: '/api/admin/stock/:id', auth: 'admin', summary: 'Atualiza o estoque: "stock" (absoluto) OU "adjustment" (variação)', body: { adjustment: 10 }, response: product, errors: [404, 409, 422] },

  { tag: 'Admin - Promoções', method: 'GET', path: '/api/admin/promotions', auth: 'admin', summary: 'Lista promoções', query: pageQuery, response: [promotion], paginated: true },
  { tag: 'Admin - Promoções', method: 'GET', path: '/api/admin/promotions/:id', auth: 'admin', summary: 'Detalha promoção', response: promotion, errors: [404] },
  { tag: 'Admin - Promoções', method: 'POST', path: '/api/admin/promotions', auth: 'admin', summary: 'Cria promoção', body: promotionBody, response: promotion, status: 201, errors: [409, 422] },
  { tag: 'Admin - Promoções', method: 'PUT', path: '/api/admin/promotions/:id', auth: 'admin', summary: 'Edita promoção', body: { usageLimit: 500 }, response: promotion, errors: [404, 409, 422] },
  { tag: 'Admin - Promoções', method: 'DELETE', path: '/api/admin/promotions/:id', auth: 'admin', summary: 'Exclui/desativa promoção', response: { deleted: false, deactivated: true }, errors: [404] },

  { tag: 'Admin - Avaliações', method: 'GET', path: '/api/admin/reviews', auth: 'admin', summary: 'Lista avaliações (filtros: productId, userId, rating)', query: [...pageQuery, ['productId', 'Id do produto'], ['rating', '1 a 5']], response: [{ id: 1, rating: 5, comment: 'Delicioso!' }], paginated: true },
  { tag: 'Admin - Avaliações', method: 'DELETE', path: '/api/admin/reviews/:id', auth: 'admin', summary: 'Remove uma avaliação (moderação)', response: null, errors: [404] },

  { tag: 'Admin - Notificações', method: 'POST', path: '/api/admin/notifications/broadcast', auth: 'admin', summary: 'Envia um aviso a todos os clientes ativos', body: { title: 'Promoção do dia', message: 'Cappuccino com 20% OFF hoje!', type: 'PROMOTION' }, response: { sent: 42 }, errors: [422] },

  { tag: 'Admin - Fidelidade', method: 'GET', path: '/api/admin/loyalty/rewards', auth: 'admin', summary: 'Lista todas as recompensas', response: [{ id: 1, name: 'Café grátis', pointsCost: 100, isActive: true }] },
  { tag: 'Admin - Fidelidade', method: 'POST', path: '/api/admin/loyalty/rewards', auth: 'admin', summary: 'Cria recompensa', body: { name: 'Fatia de bolo grátis', pointsCost: 150 }, response: { id: 2, name: 'Fatia de bolo grátis', pointsCost: 150 }, status: 201, errors: [422] },
  { tag: 'Admin - Fidelidade', method: 'PUT', path: '/api/admin/loyalty/rewards/:id', auth: 'admin', summary: 'Edita recompensa', body: { pointsCost: 120 }, response: { id: 2, pointsCost: 120 }, errors: [404, 422] },
];

const pagedExample = (data) => ({ success: true, message: 'Listagem realizada com sucesso.', data, pagination });

module.exports = { routes, pagination, pagedExample };
