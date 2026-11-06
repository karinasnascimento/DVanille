const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');
const { pick } = require('../utils/pick');
const loyaltyService = require('../services/loyaltyService');

const REWARD_FIELDS = ['name', 'description', 'pointsCost', 'isActive'];

const getSummary = asyncHandler(async (req, res) => {
  const summary = await loyaltyService.getSummary(req.user.id);
  return sendSuccess(res, { data: summary });
});

const listHistory = asyncHandler(async (req, res) => {
  const { items, pagination } = await loyaltyService.listHistory(req.user.id, req.query);
  return sendPaginated(res, { items, pagination });
});

const listRewards = asyncHandler(async (req, res) => {
  const rewards = await loyaltyService.listRewards();
  return sendSuccess(res, { data: rewards });
});

const redeemReward = asyncHandler(async (req, res) => {
  const result = await loyaltyService.redeemReward(req.user.id, req.params.id);
  return sendSuccess(res, { data: result, message: 'Recompensa resgatada com sucesso.' });
});

// ---------- Admin ----------

const listAllRewards = asyncHandler(async (req, res) => {
  const rewards = await loyaltyService.listRewards({ includeInactive: true });
  return sendSuccess(res, { data: rewards });
});

const createReward = asyncHandler(async (req, res) => {
  const reward = await loyaltyService.createReward(pick(req.body, REWARD_FIELDS));
  return sendCreated(res, reward, 'Recompensa criada com sucesso.');
});

const updateReward = asyncHandler(async (req, res) => {
  const reward = await loyaltyService.updateReward(req.params.id, pick(req.body, REWARD_FIELDS));
  return sendSuccess(res, { data: reward, message: 'Recompensa atualizada com sucesso.' });
});

module.exports = {
  getSummary,
  listHistory,
  listRewards,
  redeemReward,
  listAllRewards,
  createReward,
  updateReward,
};
