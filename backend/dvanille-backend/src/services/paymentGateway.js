const crypto = require('crypto');
const env = require('../config/env');
const AppError = require('../utils/AppError');

/**
 * Interface de gateway de pagamento.
 *
 * Todo gateway deve expor:
 *   charge({ method, amount, card })  -> { status, transactionId, pixCode?, cardBrand?, cardLast4?, failureReason?, paidAt? }
 *   refund({ transactionId, amount }) -> { status: 'REFUNDED', refundedAt }
 *
 * Para integrar um gateway real (Mercado Pago, Stripe, Pagar.me...), crie um objeto com
 * estes dois métodos, registre-o em GATEWAYS e defina PAYMENT_GATEWAY no .env.
 * O restante do sistema (pedidos, notificações, estoque) não precisa mudar.
 *
 * IMPORTANTE: nunca armazene o número completo do cartão nem o CVV.
 * Aqui apenas a bandeira e os 4 últimos dígitos saem deste módulo.
 */

const TEST_DECLINED_LAST4 = '0002'; // cartão de teste: 4000 0000 0000 0002 é sempre recusado

function detectCardBrand(number) {
  if (/^4/.test(number)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(number)) return 'MASTERCARD';
  if (/^3[47]/.test(number)) return 'AMEX';
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(number)) return 'ELO';
  return 'OUTRO';
}

/** Cartão vale até o último dia do mês de validade. */
function isCardExpired({ expiryMonth, expiryYear } = {}, now = new Date()) {
  if (!expiryMonth || !expiryYear) return false;
  const lastValidMoment = new Date(Number(expiryYear), Number(expiryMonth), 0, 23, 59, 59, 999);
  return lastValidMoment < now;
}

const simulatedGateway = {
  name: 'simulated',

  async charge({ method, amount, card }) {
    const transactionId = `SIM-${method}-${crypto.randomUUID()}`;

    if (method === 'PIX') {
      return {
        status: 'PENDING',
        transactionId,
        pixCode: `00020126DVANILLESIMULADO${crypto.randomBytes(10).toString('hex').toUpperCase()}5204000053039865802BR`,
      };
    }

    if (method === 'CASH') {
      return { status: 'PENDING', transactionId };
    }

    // CREDIT_CARD / DEBIT_CARD
    const digits = String(card?.number || '').replace(/\D/g, '');
    const last4 = digits.slice(-4);
    const base = { transactionId, cardBrand: detectCardBrand(digits), cardLast4: last4 };

    if (isCardExpired(card)) {
      return { ...base, status: 'DECLINED', failureReason: 'Cartão expirado.' };
    }

    if (last4 === TEST_DECLINED_LAST4) {
      return { ...base, status: 'DECLINED', failureReason: 'Cartão recusado pelo emissor (simulação).' };
    }

    return { ...base, status: 'APPROVED', paidAt: new Date() };
  },

  async refund() {
    return { status: 'REFUNDED', refundedAt: new Date() };
  },
};

const GATEWAYS = { simulated: simulatedGateway };

function getGateway() {
  const gateway = GATEWAYS[env.payment.gateway];
  if (!gateway) {
    throw new AppError(`Gateway de pagamento "${env.payment.gateway}" não configurado.`, 500);
  }
  return gateway;
}

module.exports = { getGateway, detectCardBrand, isCardExpired, TEST_DECLINED_LAST4 };
