const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');
const { pick } = require('../utils/pick');
const orderService = require('../services/orderService');

const quoteOrder = asyncHandler(async (req, res) => {
  const quote = await orderService.quoteOrder(req.user.id, pick(req.body, ['deliveryType', 'addressId', 'couponCode']));
  return sendSuccess(res, { data: quote, message: 'Simulação do pedido calculada.' });
});

const createOrder = asyncHandler(async (req, res) => {
  const input = pick(req.body, ['deliveryType', 'addressId', 'paymentMethod', 'notes', 'couponCode', 'card']);
  const order = await orderService.createOrder(req.user.id, input);
  return sendCreated(res, order, 'Pedido criado com sucesso.');
});

const listMyOrders = asyncHandler(async (req, res) => {
  const { items, pagination } = await orderService.listUserOrders(req.user.id, req.query);
  return sendPaginated(res, { items, pagination });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user, req.params.id);
  return sendSuccess(res, { data: order });
});

const getOrderTracking = asyncHandler(async (req, res) => {
  const tracking = await orderService.getOrderTracking(req.user, req.params.id);
  return sendSuccess(res, { data: tracking });
});

const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await orderService.changeOrderStatus(req.params.id, 'CANCELLED', { actor: req.user });
  return sendSuccess(res, { data: order, message: 'Pedido cancelado com sucesso.' });
});

// ---------- Admin ----------

const listAllOrders = asyncHandler(async (req, res) => {
  const { items, pagination } = await orderService.listAllOrders(req.query);
  return sendPaginated(res, { items, pagination });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.changeOrderStatus(req.params.id, req.body.status, {
    actor: req.user,
    note: req.body.note,
  });
  return sendSuccess(res, { data: order, message: 'Status do pedido atualizado.' });
});

module.exports = {
  quoteOrder,
  createOrder,
  listMyOrders,
  getOrder,
  getOrderTracking,
  cancelMyOrder,
  listAllOrders,
  updateOrderStatus,
};
