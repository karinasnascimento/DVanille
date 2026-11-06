const { toCents } = require('./money');

const normalizeCouponCode = (code) => String(code || '').trim().toUpperCase();

/**
 * Regras de validade de um cupom (função pura, fácil de testar).
 * Retorna uma mensagem de erro (string) ou null quando o cupom pode ser usado.
 */
function getPromotionIssue(promotion, { subtotal, userUsageCount = 0, now = new Date() }) {
  if (!promotion) return 'Cupom inexistente.';
  if (!promotion.isActive) return 'Este cupom está inativo.';
  if (now < new Date(promotion.startsAt)) return 'Este cupom ainda não está válido.';
  if (now > new Date(promotion.endsAt)) return 'Este cupom está expirado.';

  if (promotion.usageLimit !== null && promotion.usageLimit !== undefined && promotion.usedCount >= promotion.usageLimit) {
    return 'O limite de usos deste cupom foi atingido.';
  }

  if (userUsageCount >= promotion.perUserLimit) {
    return 'Você já utilizou este cupom.';
  }

  if (promotion.minOrderValue !== null && promotion.minOrderValue !== undefined) {
    if (toCents(subtotal) < toCents(promotion.minOrderValue)) {
      return `Este cupom exige um pedido mínimo de R$ ${Number(promotion.minOrderValue).toFixed(2).replace('.', ',')}.`;
    }
  }

  return null;
}

module.exports = { normalizeCouponCode, getPromotionIssue };
