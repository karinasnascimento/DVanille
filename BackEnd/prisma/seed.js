/**
 * Seed de DESENVOLVIMENTO do D'Vanille.
 * Idempotente: pode ser executado várias vezes (usa upsert / verificações de existência).
 *
 *   npx prisma db seed        (ou: npm run db:seed)
 *
 * Credenciais criadas (ver README):
 *   admin@dvanille.com    / SEED_ADMIN_PASSWORD    (padrão: Admin@123456)
 *   cliente@dvanille.com  / SEED_CUSTOMER_PASSWORD (padrão: Cliente@123456)
 */
const env = require('../src/config/env');
const prisma = require('../src/config/database');
const { hashPassword } = require('../src/utils/password');
const { slugify } = require('../src/utils/slug');

const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
const CUSTOMER_PASSWORD = process.env.SEED_CUSTOMER_PASSWORD || 'Cliente@123456';

const { CATEGORIES, PRODUCTS, PROMOTIONS, REWARDS, buildProductData } = require('./seedData');

// ---------------------------------------------------------------
// Funções auxiliares
// ---------------------------------------------------------------

async function seedUsers() {
  const [adminHash, customerHash] = await Promise.all([hashPassword(ADMIN_PASSWORD), hashPassword(CUSTOMER_PASSWORD)]);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dvanille.com' },
    update: { role: 'ADMIN', isActive: true },
    create: { name: "Administrador D'Vanille", email: 'admin@dvanille.com', passwordHash: adminHash, phone: '(11) 4000-0000', role: 'ADMIN' },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'cliente@dvanille.com' },
    update: {},
    create: { name: 'Maria Cliente', email: 'cliente@dvanille.com', passwordHash: customerHash, phone: '(11) 99999-0000', role: 'CUSTOMER' },
  });

  return { admin, customer };
}

async function seedCatalog() {
  const categoryIds = {};
  for (const category of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { name: category.name },
      update: { description: category.description },
      create: { ...category, slug: slugify(category.name) },
    });
    categoryIds[category.name] = record.id;
  }

  const products = {};
  for (const row of PRODUCTS) {
    const data = buildProductData(row, categoryIds);
    const { slug, sku, ...mutable } = data;
    // eslint-disable-next-line no-await-in-loop
    products[data.name] = await prisma.product.upsert({
      where: { sku },
      update: mutable,
      create: { ...mutable, slug, sku },
    });
  }

  return { categoryIds, products };
}

async function seedPromotionsAndRewards() {
  for (const promotion of PROMOTIONS) {
    const { code, ...rest } = promotion;
    // eslint-disable-next-line no-await-in-loop
    await prisma.promotion.upsert({ where: { code }, update: rest, create: { code, ...rest } });
  }

  for (const reward of REWARDS) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await prisma.loyaltyReward.findFirst({ where: { name: reward.name }, select: { id: true } });
    if (!existing) await prisma.loyaltyReward.create({ data: reward });
  }
}

async function seedCustomerData(customer, products) {
  const addressCount = await prisma.address.count({ where: { userId: customer.id } });
  let address;
  if (addressCount === 0) {
    address = await prisma.address.create({
      data: {
        userId: customer.id,
        label: 'Casa',
        recipientName: customer.name,
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01001-000',
        reference: 'Próximo à praça',
        isDefault: true,
      },
    });
    await prisma.address.create({
      data: {
        userId: customer.id,
        label: 'Trabalho',
        recipientName: customer.name,
        street: 'Avenida Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        isDefault: false,
      },
    });
  } else {
    address = await prisma.address.findFirst({ where: { userId: customer.id, isDefault: true } });
  }

  // Pedidos de exemplo: um ENTREGUE (permite testar avaliação e fidelidade) e um EM PREPARO (retirada, dinheiro).
  const samples = [
    {
      orderNumber: 'DV-SEED-ENTREGUE',
      deliveryType: 'DELIVERY',
      paymentMethod: 'PIX',
      orderStatus: 'DELIVERED',
      lines: [['Cappuccino Cremoso', 2], ['Brownie Vegano', 1]],
    },
    {
      orderNumber: 'DV-SEED-PREPARO',
      deliveryType: 'PICKUP',
      paymentMethod: 'CASH',
      orderStatus: 'PREPARING',
      lines: [['Pão de Queijo', 3], ['Suco de Laranja Natural', 1]],
    },
  ];

  for (const sample of samples) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await prisma.order.findUnique({ where: { orderNumber: sample.orderNumber }, select: { id: true } });
    if (exists) continue;

    const items = sample.lines.map(([name, quantity]) => {
      const product = products[name];
      const unitPrice = Number(product.promotionalPrice ?? product.price);
      return { productId: product.id, productName: product.name, quantity, unitPrice, subtotal: Math.round(unitPrice * quantity * 100) / 100 };
    });
    const subtotal = Math.round(items.reduce((sum, item) => sum + item.subtotal * 100, 0)) / 100;
    const deliveryFee = sample.deliveryType === 'DELIVERY' ? env.delivery.fee : 0;
    const total = Math.round((subtotal + deliveryFee) * 100) / 100;
    const delivered = sample.orderStatus === 'DELIVERED';
    const paid = sample.paymentMethod !== 'CASH';
    const statuses = ['PENDING', 'CONFIRMED', 'PREPARING', ...(delivered ? ['READY', 'OUT_FOR_DELIVERY', 'DELIVERED'] : [])];

    // eslint-disable-next-line no-await-in-loop
    const order = await prisma.order.create({
      data: {
        orderNumber: sample.orderNumber,
        userId: customer.id,
        addressId: sample.deliveryType === 'DELIVERY' ? address.id : null,
        deliveryAddress:
          sample.deliveryType === 'DELIVERY'
            ? { label: address.label, recipientName: address.recipientName, street: address.street, number: address.number, complement: address.complement, neighborhood: address.neighborhood, city: address.city, state: address.state, zipCode: address.zipCode, reference: address.reference }
            : undefined,
        subtotal,
        discount: 0,
        deliveryFee,
        total,
        paymentMethod: sample.paymentMethod,
        paymentStatus: paid ? 'APPROVED' : 'PENDING',
        orderStatus: sample.orderStatus,
        deliveryType: sample.deliveryType,
        notes: 'Pedido de exemplo gerado pelo seed.',
        deliveredAt: delivered ? new Date() : null,
        items: { create: items },
        payment: {
          create: {
            method: sample.paymentMethod,
            status: paid ? 'APPROVED' : 'PENDING',
            amount: total,
            provider: 'simulated',
            transactionId: `SIM-SEED-${sample.orderNumber}`,
            paidAt: paid ? new Date() : null,
          },
        },
        statusHistory: { create: statuses.map((status) => ({ status, note: 'Gerado pelo seed.' })) },
      },
    });

    if (delivered) {
      const points = Math.floor(total * env.loyalty.pointsPerReal);
      // eslint-disable-next-line no-await-in-loop
      const updated = await prisma.user.update({
        where: { id: customer.id },
        data: { loyaltyPoints: { increment: points } },
        select: { loyaltyPoints: true },
      });
      // eslint-disable-next-line no-await-in-loop
      await prisma.loyaltyTransaction.create({
        data: { userId: customer.id, orderId: order.id, type: 'EARNED', points, balanceAfter: updated.loyaltyPoints, description: `Pontos do pedido ${order.orderNumber}` },
      });
    }
  }

  const notifications = await prisma.notification.count({ where: { userId: customer.id } });
  if (notifications === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: customer.id, title: "Bem-vinda ao D'Vanille!", message: 'Use o cupom BEMVINDO10 e ganhe 10% no primeiro pedido.', type: 'PROMOTION' },
        { userId: customer.id, title: 'Pedido entregue', message: 'Pedido DV-SEED-ENTREGUE concluído. Que tal avaliar os produtos?', type: 'ORDER_DELIVERED' },
      ],
    });
  }
}

async function main() {
  if (env.isProduction && !process.env.SEED_ADMIN_PASSWORD) {
    throw new Error('Em produção defina SEED_ADMIN_PASSWORD (e SEED_CUSTOMER_PASSWORD) antes de rodar o seed.');
  }

  const { customer } = await seedUsers();
  const { products } = await seedCatalog();
  await seedPromotionsAndRewards();
  await seedCustomerData(customer, products);

  console.log('[seed] Concluído.');
  console.log(`[seed] Categorias: ${CATEGORIES.length} | Produtos: ${PRODUCTS.length} | Cupons: ${PROMOTIONS.length}`);
  console.log('[seed] Admin:   admin@dvanille.com   (senha: variável SEED_ADMIN_PASSWORD, padrão Admin@123456)');
  console.log('[seed] Cliente: cliente@dvanille.com (senha: variável SEED_CUSTOMER_PASSWORD, padrão Cliente@123456)');
}

main()
  .catch((error) => {
    console.error('[seed] Falhou:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
