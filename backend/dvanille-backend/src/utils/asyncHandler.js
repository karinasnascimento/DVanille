/** Encaminha erros de handlers assíncronos para o middleware global de erros. */
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

module.exports = asyncHandler;
