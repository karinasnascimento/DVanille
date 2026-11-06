const { PrismaClient, Prisma } = require('@prisma/client');
const env = require('./env');

// Decimal do Prisma serializa como string no JSON. Para Flutter/Web é mais prático
// receber números (ex.: 12.5). Valores monetários têm no máximo 2 casas decimais.
Prisma.Decimal.prototype.toJSON = function decimalToJSON() {
  return this.toNumber();
};

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__dvanillePrisma ||
  new PrismaClient({
    log: env.isProduction ? ['error'] : env.isTest ? [] : ['warn', 'error'],
  });

if (!env.isProduction) {
  globalForPrisma.__dvanillePrisma = prisma;
}

module.exports = prisma;
