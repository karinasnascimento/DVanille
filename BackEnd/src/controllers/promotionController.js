const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');
const { pick } = require('../utils/pick');
const { PROMOTION_FIELDS } = require('../validators/promotionValidator');
const promotionService = require('../services/promotionService');
const cartService = require('../services/cartService');

const listActivePromotions = asyncHandler(async (req, res) => {
  const promotions = await promotionService.listActivePromotions();
  return sendSuccess(res, { data: promotions });
});

/** Verifica se um cupom serve para o carrinho atual do usuário, sem aplicá-lo. */
const validateCoupon = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  const { promotion, discount } = await promotionService.validateCoupon(req.body.code, {
    userId: req.user.id,
    subtotal: cart.subtotal,
  });

  return sendSuccess(res, {
    data: {
      code: promotion.code,
      name: promotion.name,
      type: promotion.type,
      value: Number(promotion.value),
      discount,
      cartSubtotal: cart.subtotal,
    },
    message: 'Cupom válido.',
  });
});

// ---------- Admin ----------

const listPromotions = asyncHandler(async (req, res) => {
  const { items, pagination } = await promotionService.listPromotions(req.query);
  return sendPaginated(res, { items, pagination });
});

const getPromotion = asyncHandler(async (req, res) => {
  const promotion = await promotionService.getPromotion(req.params.id);
  return sendSuccess(res, { data: promotion });
});

const createPromotion = asyncHandler(async (req, res) => {
  const promotion = await promotionService.createPromotion(pick(req.body, PROMOTION_FIELDS));
  return sendCreated(res, promotion, 'Promoção criada com sucesso.');
});

const updatePromotion = asyncHandler(async (req, res) => {
  const promotion = await promotionService.updatePromotion(req.params.id, pick(req.body, PROMOTION_FIELDS));
  return sendSuccess(res, { data: promotion, message: 'Promoção atualizada com sucesso.' });
});

const deletePromotion = asyncHandler(async (req, res) => {
  const result = await promotionService.deletePromotion(req.params.id);
  const message = result.deleted ? 'Promoção excluída com sucesso.' : 'Promoção já foi utilizada e foi apenas desativada.';
  return sendSuccess(res, { data: result, message });
});

module.exports = {
  listActivePromotions,
  validateCoupon,
  listPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
};
