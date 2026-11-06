const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { parsePagination, buildPagination } = require('../utils/pagination');
const { toCents, fromCents, calculateDiscountCents } = require('../utils/money');
const { normalizeCouponCode, getPromotionIssue } = require('../utils/promotionRules');

async function countUserUsages(client, promotionId, userId) {
  return client.promotionUsage.count({ where: { promotionId, userId } });
}

/**
 * Valida um cupom para um usuário e subtotal. Lança 404 (inexistente) ou 422 (regra violada).
 * Retorna { promotion, discount }.
 */
async function validateCoupon(code, { userId, subtotal }, client = prisma) {
  const normalized = normalizeCouponCode(code);
  const promotion = normalized ? await client.promotion.findUnique({ where: { code: normalized } }) : null;
  if (!promotion) throw AppError.notFound('Cupom inexistente.');

  const issue = getPromotionIssue(promotion, {
    subtotal,
    userUsageCount: await countUserUsages(client, promotion.id, userId),
  });
  if (issue) throw AppError.unprocessable(issue, [{ field: 'couponCode', message: issue }]);

  return { promotion, discount: fromCents(calculateDiscountCents(promotion, toCents(subtotal))) };
}

/** Versão que não lança erro: usada para exibir o carrinho com cupom já aplicado. */
async function previewCoupon(promotion, { userId, subtotal }, client = prisma) {
  const issue = getPromotionIssue(promotion, {
    subtotal,
    userUsageCount: await countUserUsages(client, promotion.id, userId),
  });

  return {
    valid: !issue,
    message: issue,
    discount: issue ? 0 : fromCents(calculateDiscountCents(promotion, toCents(subtotal))),
  };
}

/** Cupons ativos e dentro da validade (vitrine pública). */
async function listActivePromotions() {
  const now = new Date();
  return prisma.promotion.findMany({
    where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
    select: {
      id: true,
      name: true,
      description: true,
      code: true,
      type: true,
      value: true,
      startsAt: true,
      endsAt: true,
      minOrderValue: true,
    },
    orderBy: { endsAt: 'asc' },
  });
}

// ---------- Administração ----------

function assertPromotionRules({ type, value, startsAt, endsAt }) {
  const errors = [];
  if (type === 'PERCENTAGE' && (Number(value) <= 0 || Number(value) > 100)) {
    errors.push({ field: 'value', message: 'Para PERCENTAGE, o valor deve estar entre 0 e 100.' });
  }
  if (type === 'FIXED' && Number(value) <= 0) {
    errors.push({ field: 'value', message: 'Para FIXED, o valor deve ser maior que zero.' });
  }
  if (new Date(endsAt) <= new Date(startsAt)) {
    errors.push({ field: 'endsAt', message: 'A data final deve ser posterior à data inicial.' });
  }
  if (errors.length > 0) throw AppError.unprocessable('Dados da promoção inválidos.', errors);
}

async function listPromotions(query = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = {};
  if (query.isActive !== undefined && query.isActive !== '') where.isActive = query.isActive === true || query.isActive === 'true';
  if (query.search) where.OR = [{ name: { contains: query.search } }, { code: { contains: query.search } }];

  const [items, total] = await Promise.all([
    prisma.promotion.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.promotion.count({ where }),
  ]);
  return { items, pagination: buildPagination({ page, limit, total }) };
}

async function getPromotion(id) {
  const promotion = await prisma.promotion.findUnique({ where: { id } });
  if (!promotion) throw AppError.notFound('Promoção não encontrada.');
  return promotion;
}

async function createPromotion(data) {
  const code = normalizeCouponCode(data.code);
  assertPromotionRules(data);

  const existing = await prisma.promotion.findUnique({ where: { code }, select: { id: true } });
  if (existing) throw AppError.conflict('Já existe uma promoção com este código.', [{ field: 'code', message: 'Código já utilizado.' }]);

  return prisma.promotion.create({ data: { ...data, code } });
}

async function updatePromotion(id, data) {
  const current = await getPromotion(id);
  const payload = { ...data };

  if (payload.code !== undefined) {
    payload.code = normalizeCouponCode(payload.code);
    const existing = await prisma.promotion.findUnique({ where: { code: payload.code }, select: { id: true } });
    if (existing && existing.id !== id) {
      throw AppError.conflict('Já existe uma promoção com este código.', [{ field: 'code', message: 'Código já utilizado.' }]);
    }
  }

  assertPromotionRules({
    type: payload.type ?? current.type,
    value: payload.value ?? current.value,
    startsAt: payload.startsAt ?? current.startsAt,
    endsAt: payload.endsAt ?? current.endsAt,
  });

  return prisma.promotion.update({ where: { id }, data: payload });
}

/** Exclui se nunca foi usada; senão apenas desativa (preserva histórico de pedidos). */
async function deletePromotion(id) {
  const promotion = await getPromotion(id);
  const usages = await prisma.promotionUsage.count({ where: { promotionId: id } });

  if (usages === 0 && promotion.usedCount === 0) {
    await prisma.promotion.delete({ where: { id } });
    return { deleted: true, deactivated: false };
  }

  await prisma.promotion.update({ where: { id }, data: { isActive: false } });
  return { deleted: false, deactivated: true };
}

module.exports = {
  validateCoupon,
  previewCoupon,
  listActivePromotions,
  listPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
};
