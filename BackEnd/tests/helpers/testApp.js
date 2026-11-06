/**
 * Utilitários dos testes de integração.
 * Sobe a API real em uma porta efêmera e usa o MySQL configurado em DATABASE_URL.
 * ATENÇÃO: os testes criam dados com o prefixo "itest-" e os removem ao final.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-de-teste-com-mais-de-32-caracteres-0123456789';

const http = require('http');
const app = require('../../src/app');
const prisma = require('../../src/config/database');
const { hashPassword } = require('../../src/utils/password');

const RUN_ID = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const PREFIX = `itest-${RUN_ID}`;

async function isDatabaseAvailable() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

async function startServer() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

function createClient(baseUrl) {
  return async function request(method, path, { token, body } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const json = await response.json().catch(() => null);
    return { status: response.status, body: json };
  };
}

async function createAdminUser(label = 'admin') {
  const email = `${PREFIX}-${label}@teste.dvanille.com`;
  const password = 'Admin@12345';
  const user = await prisma.user.create({
    data: { name: `Admin ${label}`, email, passwordHash: await hashPassword(password), role: 'ADMIN' },
  });
  return { user, email, password };
}

/** Remove tudo que os testes criaram (ordem respeita as chaves estrangeiras). */
async function cleanup() {
  const users = await prisma.user.findMany({ where: { email: { startsWith: PREFIX } }, select: { id: true } });
  const userIds = users.map((user) => user.id);

  await prisma.order.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.product.deleteMany({ where: { slug: { startsWith: PREFIX } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: PREFIX } } });
  await prisma.promotion.deleteMany({ where: { code: { startsWith: PREFIX.toUpperCase() } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

module.exports = { prisma, PREFIX, isDatabaseAvailable, startServer, createClient, createAdminUser, cleanup };
