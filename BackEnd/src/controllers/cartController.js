const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const cartService = require('../services/cartService');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  return sendSuccess(res, { data: cart });
});

const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body);
  return sendSuccess(res, { data: cart, message: 'Produto adicionado ao carrinho.' });
});

const updateItemQuantity = asyncHandler(async (req, res) => {
  const cart = await cartService.setItemQuantity(req.user.id, req.params.productId, req.body.quantity);
  return sendSuccess(res, { data: cart, message: 'Quantidade atualizada.' });
});

const incrementItem = asyncHandler(async (req, res) => {
  const cart = await cartService.incrementItem(req.user.id, req.params.productId);
  return sendSuccess(res, { data: cart, message: 'Quantidade aumentada.' });
});

const decrementItem = asyncHandler(async (req, res) => {
  const cart = await cartService.decrementItem(req.user.id, req.params.productId);
  return sendSuccess(res, { data: cart, message: 'Quantidade diminuída.' });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.productId);
  return sendSuccess(res, { data: cart, message: 'Produto removido do carrinho.' });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  return sendSuccess(res, { data: cart, message: 'Carrinho esvaziado.' });
});

const applyCoupon = asyncHandler(async (req, res) => {
  const cart = await cartService.applyCoupon(req.user.id, req.body.code);
  return sendSuccess(res, { data: cart, message: 'Cupom aplicado com sucesso.' });
});

const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await cartService.removeCoupon(req.user.id);
  return sendSuccess(res, { data: cart, message: 'Cupom removido.' });
});

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  incrementItem,
  decrementItem,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
};
