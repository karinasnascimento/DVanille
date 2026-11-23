# D'Vanille — Reservas no backend PostgreSQL / Supabase

**Base:** `DVanille_Backend_Reservas_Base.zip` enviado em 22/11/2026.

Este pacote contém **8 arquivos completos** (2 alterações + 6 arquivos novos):

```
prisma/schema_supabase_confirmado.prisma         (atualizado)
src/routes/index.js                             (atualizado)
src/controllers/reservationController.js        (novo)
src/middlewares/optionalReservationAuth.js      (novo)
src/routes/reservationRoutes.js                 (novo)
src/routes/reservationAdminRoutes.js            (novo)
src/services/reservationService.js              (novo)
src/validators/reservationValidator.js          (novo)
```

## 1. Instalar sem perder integrações anteriores

No PowerShell:

```powershell
cd C:\Users\Administrador\TCC_DVanille\DVanille\BackEnd
git switch -c integracao-reservas-api
```

Extraia este ZIP e **copie as pastas `prisma` e `src` para a pasta `BackEnd`**,
substituindo apenas os arquivos de mesmo caminho. Não substitua o projeto inteiro.

```powershell
git status
git diff --check
```

**Não execute `docker compose up`, `prisma db push`, `prisma migrate` ou novos
scripts de criação de tabela.** Você já criou `public.reservations` no Supabase.
O `schema.prisma` original MySQL não foi alterado.

## 2. Depois da instalação: validar código e Prisma

```powershell
docker compose build api

docker run --rm `
  --env-file "$HOME\.dvanille-supabase.env" `
  --entrypoint sh backend-api `
  -c 'npx prisma validate --schema=prisma/schema_supabase_confirmado.prisma && npx prisma generate --schema=prisma/schema_supabase_confirmado.prisma && node --check src/controllers/reservationController.js && node --check src/services/reservationService.js && node --check src/validators/reservationValidator.js && node --check src/routes/reservationRoutes.js && node --check src/routes/reservationAdminRoutes.js && node --check src/middlewares/optionalReservationAuth.js && node --check src/routes/index.js && echo RESERVAS_BACKEND_OK'
```

Se for exibido `RESERVAS_BACKEND_OK`, reinicie somente a API de teste, usando
as mesmas variáveis já estabelecidas nas etapas anteriores. Não altere senhas nem
publique `.env` ou JWT em arquivos Git.

## 3. Rotas criadas

| Método | Caminho | Acesso | O que faz |
|---|---|---|---|
| POST | `/api/reservations` | Público ou autenticado | Solicita reserva (`solicitada`) |
| POST | `/api/reservations/guest/lookup` | Visitante com segredo | Consulta uma reserva de visitante |
| POST | `/api/reservations/guest/cancel` | Visitante com segredo | Cancela a própria reserva |
| GET | `/api/reservations/me?page=1&limit=20` | Cliente autenticado | Lista somente suas reservas |
| GET | `/api/reservations/:id` | Cliente autenticado | Consulta somente sua reserva |
| PATCH | `/api/reservations/:id/cancel` | Cliente autenticado | Cancela sua reserva ativa |
| GET | `/api/admin/reservations` | Somente ADMIN | Lista reservas, com paginação e filtros |
| GET | `/api/admin/reservations/:id` | Somente ADMIN | Detalha uma reserva |
| PATCH | `/api/admin/reservations/:id/status` | Somente ADMIN | Confirma, cancela ou finaliza |

A rota administrativa aceita `status`, `dateFrom`, `dateTo`, `search`, `page`, `limit`.

### Corpo da criação (`POST /api/reservations`)

```json
{
  "name": "Pessoa de teste",
  "email": "exemplo@example.com",
  "phone": "11912345678",
  "reservationDate": "2027-01-10",
  "reservationTime": "14:00",
  "guests": 2,
  "preferences": "",
  "notes": ""
}
```

`reservationDate` deve ser `AAAA-MM-DD`; `reservationTime` aceita os 8 horários
que já existem no formulário Flutter: 09:00, 10:30, 12:00, 14:00, 15:30,
17:00, 18:30, 20:00. O servidor valida data futura no horário de São Paulo.

A API retorna ID **numérico** (`id: 1`, por exemplo). O modelo Flutter atual
possui `Reserva.id` do tipo `String`; na etapa da integração Web converteremos
`id.toString()`. A confirmação será uma **solicitação**, não vaga confirmada.

Se a criação ocorrer **sem login**, o JSON de criação também devolve
`guestAccessToken` (segredo de alta entropia, somente uma vez). O banco guarda
apenas SHA-256 desse token. Visitantes devem informar `id` e `guestAccessToken`
em JSON para consulta ou cancelamento; nunca buscar reservas só por e-mail.
Proteja o segredo e **não envie token de teste, cookie ou senha ao chat**.

### Status

- `solicitada` → `confirmada` ou `cancelada`
- `confirmada` → `finalizada` ou `cancelada`
- `cancelada` e `finalizada` são terminais.

Duplicidades: o banco impede duas reservas **ativas da mesma conta** na mesma
data e horário. **Não existe cálculo de lotação ainda:** várias pessoas podem
solicitar o mesmo horário, e o administrador decide após verificar a capacidade.
Os horários do formulário são apenas possibilidades de solicitação.

## 4. Testes de segurança e integração

Após validar e reiniciar a API:

- `GET http://localhost:3001/api/health` deve indicar `database: connected`.
- `GET http://localhost:3001/api/reservations/me` **sem cookie** deve responder HTTP 401.
- `GET http://localhost:3001/api/admin/reservations` **sem ADMIN** deve responder 401/403.
- Antes de inserir dados, conferir acesso às rotas e verificar novamente schema
  e banco real. Usar somente contas e reservas fictícias nos testes.

## 5. O que este pacote NÃO faz

- Não altera a interface Flutter Web, que continuará usando reservas locais até
  a próxima etapa. Não declare que as reservas do site estão sincronizadas antes
  de integrar e testar as telas.
- Não cria capacidade por mesa, nem confirma automaticamente reserva.
- Não altera tabela SQL existente, nem autenticação, usuários, produtos e preferências.
- Não publica dados de contato de visitantes por URL ou listagem pública.
- Não atualiza a documentação OpenAPI/Swagger ainda.

Os arquivos foram verificados com `node --check` e testes simulados sem Supabase;
**a validação Prisma e os testes reais de banco só ocorrerão no seu Docker**.
