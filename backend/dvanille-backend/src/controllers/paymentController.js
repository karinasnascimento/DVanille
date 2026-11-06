const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const paymentService = require('../services/paymentService');

const listPaymentMethods = asyncHandler(async (req, res) => {
  return sendSuccess(res, { data: paymentService.listPaymentMethods() });
});

const getPaymentByOrder = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentByOrder(req.user, req.params.orderId);
  return sendSuccess(res, { data: payment });
});

const confirmPixPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.confirmPixPayment(req.user, req.params.orderId);
  return sendSuccess(res, { data: payment, message: 'Pagamento confirmado com sucesso.' });
});

const refundPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.refundPayment(req.params.orderId);
  return sendSuccess(res, { data: payment, message: 'Pagamento estornado com sucesso.' });
});

module.exports = { listPaymentMethods, getPaymentByOrder, confirmPixPayment, refundPayment };
