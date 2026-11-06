/**
 * Gera docs/API.md a partir de src/docs/routes.js (mesma fonte do Swagger).
 * Uso: npm run docs:generate
 */
const fs = require('fs');
const path = require('path');
const { routes, pagination } = require('../src/docs/routes');

const AUTH_LABEL = { none: 'Pública', user: 'JWT (usuário logado)', admin: 'JWT + role ADMIN' };
const ERROR_LABEL = {
  400: 'Requisição inválida',
  401: 'Não autenticado',
  403: 'Sem permissão',
  404: 'Não encontrado',
  409: 'Conflito',
  422: 'Dados inválidos / regra de negócio',
};

const json = (value) => `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;

function successBody(route) {
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

function describe(route) {
  const errors = new Set(route.errors || []);
  if (route.auth !== 'none') errors.add(401);
  if (route.auth === 'admin') errors.add(403);
  if (route.body || route.multipart) errors.add(422);

  const pathParams = [...route.path.matchAll(/:(\w+)/g)].map((m) => m[1]);
  const lines = [`#### \`${route.method} ${route.path}\``, '', route.summary, ''];
  lines.push(`- **Autenticação:** ${AUTH_LABEL[route.auth]}`);
  if (route.auth !== 'none') lines.push('- **Header:** `Authorization: Bearer <token>`');
  if (pathParams.length) lines.push(`- **Parâmetros de rota:** ${pathParams.map((p) => `\`${p}\``).join(', ')}`);
  if (route.query && route.query.length) {
    lines.push('- **Query string:**');
    route.query.forEach(([name, desc]) => lines.push(`  - \`${name}\`: ${desc}`));
  }
  if (route.multipart) lines.push('- **Body:** `multipart/form-data` com o arquivo no campo `image` (JPG, PNG ou WEBP).');
  lines.push('');

  if (route.body) lines.push('**Exemplo de request (body):**', '', json(route.body), '');
  lines.push(`**Exemplo de response (${route.status || 200}):**`, '', json(successBody(route)), '');

  const sorted = [...errors].sort((a, b) => a - b);
  if (sorted.length) {
    lines.push('**Possíveis erros:** ' + sorted.map((code) => `\`${code}\` ${ERROR_LABEL[code] || ''}`.trim()).join(' · '), '');
  }
  return lines.join('\n');
}

const sections = [];
[...new Set(routes.map((route) => route.tag))].forEach((tag) => {
  sections.push(`### ${tag}\n`);
  routes.filter((route) => route.tag === tag).forEach((route) => sections.push(describe(route)));
});

const content = `# Referência das rotas da API D'Vanille

> Arquivo gerado automaticamente por \`npm run docs:generate\` (fonte: \`src/docs/routes.js\`).
> A documentação interativa fica em **/api/docs** (Swagger UI).

## Convenções

- Prefixo de todas as rotas: \`/api\`.
- Autenticação: \`Authorization: Bearer <token>\` (token obtido em \`POST /api/auth/login\`).
- Sucesso: \`{ "success": true, "message": "...", "data": ... }\`.
- Erro: \`{ "success": false, "message": "...", "errors": [] }\`.
- Listagens: \`?page=1&limit=20\` e resposta com \`"pagination": ${JSON.stringify(pagination)}\`.

## Rotas (${routes.length})

${sections.join('\n')}
`;

fs.mkdirSync(path.join(__dirname, '..', 'docs'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'docs', 'API.md'), content);
console.log(`docs/API.md gerado com ${routes.length} rotas.`);
