/**
 * Padrão de resposta da API.
 *
 * Sucesso: { success: true, message, data, pagination?, meta? }
 * Erro:    { success: false, message, errors: [] }  (montado em errorMiddleware)
 */
function sendSuccess(res, { data = null, message = 'Operação realizada com sucesso.', statusCode = 200, pagination, meta } = {}) {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

function sendCreated(res, data, message = 'Recurso criado com sucesso.') {
  return sendSuccess(res, { data, message, statusCode: 201 });
}

function sendPaginated(res, { items, pagination, message = 'Listagem realizada com sucesso.', meta }) {
  return sendSuccess(res, { data: items, pagination, message, meta });
}

module.exports = { sendSuccess, sendCreated, sendPaginated };
