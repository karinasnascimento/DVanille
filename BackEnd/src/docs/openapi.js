const { routes, pagination } = require('./routes');

const ERROR_DESCRIPTIONS = {
  400: 'Requisição inválida (ex.: JSON malformado)',
  401: 'Não autenticado (token ausente, inválido, expirado ou sessão encerrada)',
  403: 'Sem permissão (ex.: rota restrita a administradores)',
  404: 'Recurso não encontrado',
  409: 'Conflito com o estado atual (duplicidade, estoque, transição inválida...)',
  422: 'Dados inválidos / regra de negócio violada',
  429: 'Muitas requisições (rate limit)',
  500: 'Erro interno do servidor',
};

const errorExample = (status) => ({
  success: false,
  message: ERROR_DESCRIPTIONS[status].split(' (')[0],
  errors: status === 422 ? [{ field: 'campo', message: 'Descrição do problema.', location: 'body' }] : [],
});

const toOpenApiPath = (path) => path.replace(/:(\w+)/g, '{$1}');

function buildSuccessBody(route) {
  if (route.rawResponse) return route.rawResponse;

  const body = {
    success: true,
    message: route.status === 201 ? 'Recurso criado com sucesso.' : 'Operação realizada com sucesso.',
    data: route.response === undefined ? null : route.response,
  };
  if (route.paginated) body.pagination = pagination;
  if (route.meta) body.meta = route.meta;
  return body;
}

function buildParameters(route) {
  const pathParams = [...route.path.matchAll(/:(\w+)/g)].map((match) => ({
    name: match[1],
    in: 'path',
    required: true,
    schema: { type: 'string' },
    description: match[1] === 'id' && route.path.includes('/products/') ? 'Id numérico ou slug' : 'Identificador',
  }));

  const queryParams = (route.query || []).map(([name, description]) => ({
    name,
    in: 'query',
    required: false,
    schema: { type: 'string' },
    description,
  }));

  return [...pathParams, ...queryParams];
}

function buildOperation(route) {
  const operation = {
    tags: [route.tag],
    summary: route.summary,
    description: `Autenticação: ${
      { none: 'pública', user: 'JWT (Authorization: Bearer <token>)', admin: 'JWT + role ADMIN' }[route.auth]
    }.`,
    parameters: buildParameters(route),
    responses: {},
  };

  if (route.auth !== 'none') operation.security = [{ bearerAuth: [] }];

  if (route.multipart) {
    operation.requestBody = {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            required: ['image'],
            properties: { image: { type: 'string', format: 'binary', description: 'JPG, PNG ou WEBP (máx. MAX_UPLOAD_MB)' } },
          },
        },
      },
    };
  } else if (route.body) {
    operation.requestBody = {
      required: true,
      content: { 'application/json': { schema: { type: 'object' }, example: route.body } },
    };
  }

  const successStatus = String(route.status || 200);
  operation.responses[successStatus] = {
    description: 'Sucesso',
    content: { 'application/json': { example: buildSuccessBody(route) } },
  };

  const errorStatuses = new Set(route.errors || []);
  if (route.auth !== 'none') errorStatuses.add(401);
  if (route.auth === 'admin') errorStatuses.add(403);
  if (route.body || route.multipart) errorStatuses.add(422);
  errorStatuses.add(500);

  [...errorStatuses]
    .sort((a, b) => a - b)
    .forEach((status) => {
      operation.responses[String(status)] = {
        description: ERROR_DESCRIPTIONS[status],
        content: { 'application/json': { example: errorExample(status) } },
      };
    });

  return operation;
}

function buildOpenApiSpec() {
  const paths = {};
  routes.forEach((route) => {
    const key = toOpenApiPath(route.path);
    paths[key] = paths[key] || {};
    paths[key][route.method.toLowerCase()] = buildOperation(route);
  });

  const tags = [...new Set(routes.map((route) => route.tag))].map((name) => ({ name }));

  return {
    openapi: '3.0.3',
    info: {
      title: "D'Vanille API",
      version: '1.0.0',
      description:
        "API REST única do D'Vanille (cafeteria e confeitaria), compartilhada pelo app Flutter, pelo website e pela área administrativa.\n\n" +
        '**Como autenticar:** faça `POST /api/auth/login`, copie o `token` e clique em **Authorize** informando apenas o token.\n\n' +
        'Todas as respostas seguem `{ success, message, data }` (sucesso) ou `{ success: false, message, errors }` (erro). ' +
        'Listagens incluem `pagination: { page, limit, total, totalPages }`.',
    },
    servers: [{ url: '/', description: 'Servidor atual' }],
    tags,
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  };
}

module.exports = buildOpenApiSpec;
