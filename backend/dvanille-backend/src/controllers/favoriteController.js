const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');
const favoriteService = require('../services/favoriteService');

const listFavorites = asyncHandler(async (req, res) => {
  const { items, pagination } = await favoriteService.listFavorites(req.user.id, req.query);
  return sendPaginated(res, { items, pagination });
});

const addFavorite = asyncHandler(async (req, res) => {
  const favorite = await favoriteService.addFavorite(req.user.id, req.body.productId);
  return sendCreated(res, favorite, 'Produto adicionado aos favoritos.');
});

const removeFavorite = asyncHandler(async (req, res) => {
  await favoriteService.removeFavorite(req.user.id, req.params.productId);
  return sendSuccess(res, { message: 'Produto removido dos favoritos.' });
});

const checkFavorite = asyncHandler(async (req, res) => {
  const result = await favoriteService.isFavorite(req.user.id, req.params.productId);
  return sendSuccess(res, { data: result });
});

module.exports = { listFavorites, addFavorite, removeFavorite, checkFavorite };
