# D'Vanille — Backend (API REST)

Backend **único e compartilhado** do D'Vanille (cafeteria e confeitaria): o mesmo servidor atende o **app Flutter**, o **website** e a futura **área administrativa web**. Não existe lógica duplicada por cliente: todos consomem `/api`.

## 1. Tecnologias

Node.js (JavaScript, sem TypeScript) · Express 4 · MySQL 8 · Prisma ORM · JWT (`jsonwebtoken`) · `bcryptjs` · `helmet` · `cors` · `express-rate-limit` · `express-validator` · `multer` · `swagger-ui-express` · `nodemon` (dev) · testes com `node:test` (`npm test`) · Docker Compose.

## 2. Requisitos

- Node.js **20 ou superior** (`node -v`)
- MySQL **8** (local ou via Docker)
- npm 9+

## 3. Executar do zero em uma máquina limpa

### Opção A — Docker (mais simples; só precisa do Docker)

```bash
unzip dvanille-backend.zip && cd dvanille-backend
docker compose up --build
```

Sobe o MySQL e a API, aplica as migrations e roda o seed. Depois acesse:

- Health: http://localhost:3000/api/health
- Swagger: http://localhost:3000/api/docs

Para parar: `docker compose down` (acrescente `-v` para apagar o banco).

### Opção B — Node + MySQL instalados na máquina

```bash
unzip dvanille-backend.zip && cd dvanille-backend
npm install                       # instala dependências e roda "prisma generate"
cp .env.example .env              # Windows: copy .env.example .env
```

1. Crie o banco no MySQL:
   ```sql
   CREATE DATABASE dvanille CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Edite o `.env`: ajuste `DATABASE_URL` (usuário/senha do seu MySQL) e troque `JWT_SECRET`
   (gere um com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
3. Aplique as migrations e popule o banco:
   ```bash
   npx prisma migrate deploy     # aplica as migrations versionadas
   npm run db:seed               # cria admin, cliente, categorias, produtos, cupons...
   ```
4. Inicie:
   ```bash
   npm run dev                   # desenvolvimento (nodemon)
   # ou
   npm start                     # produção
   ```
5. Teste: `curl http://localhost:3000/api/health`

> `npm install` gera o `package-lock.json` na primeira execução; versione-o depois.

## 4. Variáveis de ambiente (`.env`)

| Variável | Descrição |
|---|---|
| `NODE_ENV` | `development` ou `production` |
| `PORT` | Porta da API (padrão 3000) |
| `DATABASE_URL` | `mysql://USUARIO:SENHA@HOST:3306/dvanille` |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Segredo e validade do token. Em produção a API **recusa** iniciar com o segredo de exemplo |
| `CORS_ORIGIN` | Origens permitidas, separadas por vírgula (site, painel admin, Flutter Web). **Nunca usa `*`**. O app mobile não envia `Origin` e não depende desta lista |
| `UPLOAD_DIR` / `MAX_UPLOAD_MB` | Pasta e tamanho máximo dos uploads |
| `BCRYPT_ROUNDS` | Custo do hash de senha |
| `TRUST_PROXY` | Nº de proxies à frente da API (para o rate limit ler o IP correto) |
| `RATE_LIMIT_*`, `AUTH_RATE_LIMIT_MAX` | Limites de requisições (geral e login/cadastro) |
| `DELIVERY_FEE`, `FREE_DELIVERY_MIN_ORDER` | Taxa de entrega e valor mínimo para entrega grátis |
| `LOYALTY_POINTS_PER_REAL` | Pontos por R$ 1 gasto (padrão 1) |
| `PAYMENT_GATEWAY`, `ALLOW_PAYMENT_SIMULATION` | Gateway de pagamento (`simulated` no TCC) |
| `SEED_ADMIN_PASSWORD`, `SEED_CUSTOMER_PASSWORD` | Senhas usadas só pelo seed |

## 5. Banco de dados, Prisma, migrations e seed

- Schema: `prisma/schema.prisma`. Migration inicial: `prisma/migrations/20261009000000_init`.
- Aplicar migrations (produção/Docker): `npx prisma migrate deploy`
- Criar nova migration após alterar o schema (dev): `npx prisma migrate dev --name minha_mudanca`
- Resetar o banco (apaga tudo e refaz o seed): `npm run db:reset`
- Explorar os dados: `npm run prisma:studio`
- Seed: `npm run db:seed` (idempotente: pode rodar mais de uma vez)

### Dados criados pelo seed (somente desenvolvimento)

| Perfil | E-mail | Senha |
|---|---|---|
| **ADMIN** | `admin@dvanille.com` | `Admin@123456` |
| **CUSTOMER** | `cliente@dvanille.com` | `Cliente@123456` |

Altere as senhas via `SEED_ADMIN_PASSWORD` / `SEED_CUSTOMER_PASSWORD`. Em produção o seed exige que elas sejam definidas.

Também cria categorias (Cafés, Doces, Bolos, Milkshakes, Bebidas, Salgados, Combos, Ofertas), produtos variados (com/sem lactose, com/sem glúten, veganos, vegetarianos, em promoção, em destaque), recompensas de fidelidade, pedidos de exemplo e os cupons:

| Cupom | Regra |
|---|---|
| `BEMVINDO10` | 10% a partir de R$ 20 |
| `CAFE5` | R$ 5 a partir de R$ 25 |
| `DOCE15` | 15% a partir de R$ 40 |
| `EXPIRADO10`, `FUTURO20`, `INATIVO30` | Existem só para testar cupom expirado / ainda não iniciado / inativo |

## 6. Arquitetura

```
src/
  config/        env.js (validação do .env), database.js (PrismaClient)
  routes/        definição das rotas por módulo
  controllers/   camada HTTP (lê request, chama service, responde)
  services/      regras de negócio (carrinho, pedidos, pagamentos, fidelidade...)
  validators/    validações com express-validator
  middlewares/   auth (JWT), admin, erros, validação, upload, rate limit
  utils/         jwt, senha, paginação, resposta padrão, status do pedido, dinheiro...
  docs/          especificação OpenAPI (Swagger) gerada das rotas
prisma/          schema, migrations, seed
tests/           unit/ e integration/
```

`paymentGateway.js` isola o provedor de pagamento: para integrar um gateway real basta registrar um novo adaptador com `createPayment` e `confirmPayment`.

## 7. Padrão de respostas

Sucesso:
```json
{ "success": true, "message": "Operação realizada com sucesso.", "data": {} }
```
Listas paginadas (`?page=1&limit=20`):
```json
{ "success": true, "data": [], "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }
```
Erro (sem stack trace em produção):
```json
{ "success": false, "message": "Mensagem do erro.", "errors": [] }
```

| HTTP | Quando |
|---|---|
| 200 / 201 | Sucesso / criado |
| 400 | Requisição malformada |
| 401 | Token ausente, inválido ou expirado; credenciais erradas |
| 403 | Sem permissão (cliente tentando acessar `/api/admin`), conta desativada |
| 404 | Recurso inexistente |
| 409 | Conflito (e-mail já cadastrado, favorito duplicado, estoque insuficiente...) |
| 422 | Falha de validação ou regra de negócio |
| 429 | Rate limit excedido |
| 500 | Erro inesperado |

## 8. Autenticação e autorização

1. `POST /api/auth/register` → cria o usuário (senha com hash bcrypt) e devolve o JWT.
2. `POST /api/auth/login` → devolve o JWT.
3. Envie `Authorization: Bearer <token>` nas rotas protegidas.
4. `POST /api/auth/logout` invalida o token atual.

O JWT carrega apenas o mínimo (id e papel), nunca a senha. Rotas `/api/admin/*` exigem token válido **e** `role = ADMIN`; clientes recebem 403.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@dvanille.com","password":"Cliente@123456"}'
```
```json
{ "success": true, "message": "Login realizado com sucesso.",
  "data": { "token": "eyJhbGciOi...", "user": { "id": 2, "name": "Maria Cliente", "email": "cliente@dvanille.com", "role": "CUSTOMER" } } }
```

## 9. Principais fluxos

**Produtos** — `GET /api/products?search=cafe&categoryId=1&minPrice=5&maxPrice=30&lactoseFree=true&vegan=true&glutenFree=true&onPromotion=true&featured=true&page=1&limit=20`. As restrições alimentares são campos booleanos estruturados (`containsGluten`, `containsLactose`, `containsMilk`, `containsEggs`, `containsSoy`, `containsPeanuts`, `containsNuts`, `containsSugar`, `isVegetarian`, `isVegan`), por isso os filtros funcionam no banco.

**Carrinho** — o cliente envia só `productId` e `quantity`; o preço **sempre** vem do banco.
```bash
curl -X POST http://localhost:3000/api/cart/items -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"productId":5,"quantity":2}'
curl -X POST http://localhost:3000/api/cart/coupon -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"code":"BEMVINDO10"}'
```
Produto indisponível ou quantidade acima do estoque é recusado.

**Pedidos** — `POST /api/orders` com `deliveryType` (`DELIVERY` exige `addressId` e cobra taxa; `PICKUP` não exige endereço), `paymentMethod` (`PIX`, `CREDIT_CARD`, `DEBIT_CARD`, `CASH`) e `notes`. Em **uma transação** o backend: confere o estoque, baixa o estoque, grava os itens com o **preço do momento** (congelado), consome o cupom, registra o pagamento e os pontos. Se algo falhar, tudo é desfeito (rollback). `POST /api/orders/quote` simula os totais sem criar pedido.

Status: `PENDING → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED` (retirada pode ir de `READY` direto a `DELIVERED`). Cancelamento só até `READY` (o cliente cancela em `PENDING`/`CONFIRMED`); ao cancelar, estoque e cupom voltam e o pagamento é estornado. Transições inválidas retornam 422. O cliente acompanha em `GET /api/orders/:id/tracking`.

**Pagamentos (simulados)** — nunca guarda número de cartão. PIX fica `PENDING` até `POST /api/payments/order/:orderId/confirm` (simula o webhook do gateway); cartão é aprovado na criação; dinheiro é recebido na entrega/retirada. Estorno pelo admin: `POST /api/payments/order/:orderId/refund`.

**Promoções** — validação de existência, ativo, vigência, limite total e por usuário, valor mínimo e tipo `PERCENTAGE`/`FIXED`.

**Avaliações** — só quem comprou **e recebeu** o produto pode avaliar (nota 1 a 5), uma avaliação por produto/pedido.

**Fidelidade** — R$ 1 = 1 ponto quando o pedido é marcado como entregue (`DELIVERED`); saldo, histórico e troca por recompensas em `/api/loyalty`.

**Notificações** — geradas automaticamente a cada mudança de status do pedido; `PATCH /api/notifications/read-all` marca todas como lidas.

**Upload de imagens** — `POST /api/products/:id/image` (admin, `multipart/form-data`, campo `image`). Aceita JPG/PNG/WEBP até `MAX_UPLOAD_MB`, valida tipo, extensão e assinatura do arquivo e salva em `uploads/products`, servido em `/uploads/...`. O módulo `utils/storage.js` isola o armazenamento para trocar por nuvem no futuro.

**Admin** — dashboard (`/api/admin/dashboard`), usuários (listar/ativar/desativar), CRUD de produtos, categorias e promoções, pedidos e mudança de status, estoque (`PATCH /api/admin/stock/:id` com `stock` absoluto ou `adjustment`), avaliações, aviso em massa e recompensas.

## 10. Documentação das rotas

- **Swagger interativo:** `GET /api/docs` (JSON em `/api/docs.json`)
- **Referência completa em Markdown** (método, URL, autenticação, parâmetros, body, exemplo de request/response e erros de cada uma das 103 rotas): [`docs/API.md`](docs/API.md). Regenere com `npm run docs:generate`.

## 11. Testes

```bash
npm test                  # todos
npm run test:unit         # sem banco
npm run test:integration  # requer MySQL configurado no .env
```

Cobrem cadastro, login, autenticação JWT, produtos, carrinho, criação de pedido, estoque, cupons, máquina de status e permissões administrativas.

## 12. Segurança

Helmet · CORS por lista de origens (configurável, sem `*`) · rate limit geral e mais rígido em login/cadastro · validação e sanitização de entrada · senhas com bcrypt · JWT com expiração · rotas protegidas por papel · upload validado · erros sem stack trace em produção · senha e hash nunca aparecem nas respostas.

## 13. Integração com Flutter

```dart
// Emulador Android: http://10.0.2.2:3000 | iOS/desktop: http://localhost:3000 | celular físico: IP da máquina
final res = await http.post(Uri.parse('$baseUrl/api/auth/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email, 'password': password}));
final token = jsonDecode(res.body)['data']['token']; // guarde com flutter_secure_storage

final products = await http.get(Uri.parse('$baseUrl/api/products?page=1&limit=20'),
    headers: {'Authorization': 'Bearer $token'});
```

Imagens: `data.image` vem como caminho relativo (`/uploads/products/arquivo.jpg`); prefixe com a URL base. Em Android 9+ com `http://` (sem HTTPS) é preciso habilitar `usesCleartextTraffic` durante o desenvolvimento.

## 14. Integração com o website / painel admin

```js
const API = 'http://localhost:3000/api';
const { data } = await (await fetch(`${API}/products?vegan=true`)).json();
```

Adicione a origem do site em `CORS_ORIGIN` (ex.: `https://www.dvanille.com.br,https://admin.dvanille.com.br`). O painel admin usa os mesmos endpoints com o token de um usuário `ADMIN`.

## 15. Produção

1. `NODE_ENV=production`, `JWT_SECRET` forte, `CORS_ORIGIN` com os domínios reais, `TRUST_PROXY=1` atrás de proxy/HTTPS.
2. `npx prisma migrate deploy` e então `npm start` (use PM2/systemd/Docker).
3. Rode o seed apenas se precisar do admin inicial, definindo `SEED_ADMIN_PASSWORD`.
