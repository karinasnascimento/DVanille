/**
 * Erro operacional da aplicação: possui status HTTP e lista opcional de detalhes.
 * O middleware global de erros converte instâncias desta classe na resposta padrão.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message = 'Requisição inválida.', errors = []) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = 'Não autenticado.', errors = []) {
    return new AppError(message, 401, errors);
  }

  static forbidden(message = 'Acesso negado.', errors = []) {
    return new AppError(message, 403, errors);
  }

  static notFound(message = 'Recurso não encontrado.', errors = []) {
    return new AppError(message, 404, errors);
  }

  static conflict(message = 'Conflito com o estado atual do recurso.', errors = []) {
    return new AppError(message, 409, errors);
  }

  static unprocessable(message = 'Não foi possível processar os dados enviados.', errors = []) {
    return new AppError(message, 422, errors);
  }
}

module.exports = AppError;
