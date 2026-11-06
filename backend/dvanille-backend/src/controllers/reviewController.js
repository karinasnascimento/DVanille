const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');
const reviewService = require('../services/reviewService');

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user.id, req.body);
  return sendCreated(res, review, 'Avaliação registrada. Obrigado!');
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(req.user.id, req.params.id, req.body);
  return sendSuccess(res, { data: review, message: 'Avaliação atualizada com sucesso.' });
});

const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.user, req.params.id);
  return sendSuccess(res, { message: 'Avaliação excluída com sucesso.' });
});

/** Público: avaliações de um produto com média e distribuição. */
const listProductReviews = asyncHandler(async (req, res) => {
  const { items, pagination, summary } = await reviewService.listProductReviews(req.params.id, req.query);
  return sendPaginated(res, { items, pagination, meta: { summary } });
});

const listMyReviews = asyncHandler(async (req, res) => {
  const { items, pagination } = await reviewService.listUserReviews(req.user.id, req.query);
  return sendPaginated(res, { items, pagination });
});

const listAllReviews = asyncHandler(async (req, res) => {
  const { items, pagination } = await reviewService.listAllReviews(req.query);
  return sendPaginated(res, { items, pagination });
});

module.exports = { createReview, updateReview, deleteReview, listProductReviews, listMyReviews, listAllReviews };
