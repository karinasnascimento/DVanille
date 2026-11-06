# Referência das rotas da API D'Vanille

> Arquivo gerado automaticamente por `npm run docs:generate` (fonte: `src/docs/routes.js`).
> A documentação interativa fica em **/api/docs** (Swagger UI).

## Convenções

- Prefixo de todas as rotas: `/api`.
- Autenticação: `Authorization: Bearer <token>` (token obtido em `POST /api/auth/login`).
- Sucesso: `{ "success": true, "message": "...", "data": ... }`.
- Erro: `{ "success": false, "message": "...", "errors": [] }`.
- Listagens: `?page=1&limit=20` e resposta com `"pagination": {"page":1,"limit":20,"total":100,"totalPages":5}`.

## Rotas (103)

### Saúde

#### `GET /api/health`

Verifica a API e a conexão com o MySQL

- **Autenticação:** Pública

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "D'Vanille API funcionando.",
  "database": "connected"
}
```

### Autenticação

#### `POST /api/auth/register`

Cadastra um cliente e já devolve o JWT

- **Autenticação:** Pública

**Exemplo de request (body):**

```json
{
  "name": "Maria Cliente",
  "email": "cliente@dvanille.com",
  "phone": "(11) 99999-0000",
  "password": "Senha@123"
}
```

**Exemplo de response (201):**

```json
{
  "success": true,
  "message": "Recurso criado com sucesso.",
  "data": {
    "user": {
      "id": 2,
      "name": "Maria Cliente",
      "email": "cliente@dvanille.com",
      "phone": "(11) 99999-0000",
      "role": "CUSTOMER",
      "profileImage": null,
      "isActive": true,
      "loyaltyPoints": 120,
      "createdAt": "2026-10-01T12:00:00.000Z",
      "updatedAt": "2026-10-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "7d"
  }
}
```

**Possíveis erros:** `409` Conflito · `422` Dados inválidos / regra de negócio

#### `POST /api/auth/login`

Login com e-mail e senha

- **Autenticação:** Pública

**Exemplo de request (body):**

```json
{
  "email": "cliente@dvanille.com",
  "password": "Cliente@123456"
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "user": {
      "id": 2,
      "name": "Maria Cliente",
      "email": "cliente@dvanille.com",
      "phone": "(11) 99999-0000",
      "role": "CUSTOMER",
      "profileImage": null,
      "isActive": true,
      "loyaltyPoints": 120,
      "createdAt": "2026-10-01T12:00:00.000Z",
      "updatedAt": "2026-10-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "7d"
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `422` Dados inválidos / regra de negócio

#### `GET /api/auth/me`

Dados do usuário autenticado

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 2,
    "name": "Maria Cliente",
    "email": "cliente@dvanille.com",
    "phone": "(11) 99999-0000",
    "role": "CUSTOMER",
    "profileImage": null,
    "isActive": true,
    "loyaltyPoints": 120,
    "createdAt": "2026-10-01T12:00:00.000Z",
    "updatedAt": "2026-10-01T12:00:00.000Z"
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `POST /api/auth/logout`

Encerra a sessão (invalida o token atual)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": null
}
```

**Possíveis erros:** `401` Não autenticado

### Usuários

#### `GET /api/users/me`

Perfil do usuário

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 2,
    "name": "Maria Cliente",
    "email": "cliente@dvanille.com",
    "phone": "(11) 99999-0000",
    "role": "CUSTOMER",
    "profileImage": null,
    "isActive": true,
    "loyaltyPoints": 120,
    "createdAt": "2026-10-01T12:00:00.000Z",
    "updatedAt": "2026-10-01T12:00:00.000Z"
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `PUT /api/users/me`

Atualiza nome e telefone

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "name": "Maria S. Cliente",
  "phone": "(11) 98888-7777"
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 2,
    "name": "Maria Cliente",
    "email": "cliente@dvanille.com",
    "phone": "(11) 99999-0000",
    "role": "CUSTOMER",
    "profileImage": null,
    "isActive": true,
    "loyaltyPoints": 120,
    "createdAt": "2026-10-01T12:00:00.000Z",
    "updatedAt": "2026-10-01T12:00:00.000Z"
  }
}
```

**Possíveis erros:** `401` Não autenticado · `422` Dados inválidos / regra de negócio

#### `PUT /api/users/me/password`

Altera a senha

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "currentPassword": "Cliente@123456",
  "newPassword": "NovaSenha@789"
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": null
}
```

**Possíveis erros:** `401` Não autenticado · `422` Dados inválidos / regra de negócio

#### `POST /api/users/me/avatar`

Envia a foto de perfil (multipart, campo "image": JPG/PNG/WEBP)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Body:** `multipart/form-data` com o arquivo no campo `image` (JPG, PNG ou WEBP).

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 2,
    "name": "Maria Cliente",
    "email": "cliente@dvanille.com",
    "phone": "(11) 99999-0000",
    "role": "CUSTOMER",
    "profileImage": null,
    "isActive": true,
    "loyaltyPoints": 120,
    "createdAt": "2026-10-01T12:00:00.000Z",
    "updatedAt": "2026-10-01T12:00:00.000Z"
  }
}
```

**Possíveis erros:** `401` Não autenticado · `422` Dados inválidos / regra de negócio

### Endereços

#### `GET /api/addresses`

Lista os endereços do usuário (padrão primeiro)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "label": "Casa",
      "recipientName": "Maria Cliente",
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01001-000",
      "reference": "Próximo à praça",
      "isDefault": true
    }
  ]
}
```

**Possíveis erros:** `401` Não autenticado

#### `POST /api/addresses`

Cadastra um endereço (o primeiro vira padrão)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "label": "Casa",
  "recipientName": "Maria Cliente",
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apto 45",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01001-000",
  "reference": "Próximo à praça",
  "isDefault": true
}
```

**Exemplo de response (201):**

```json
{
  "success": true,
  "message": "Recurso criado com sucesso.",
  "data": {
    "id": 1,
    "label": "Casa",
    "recipientName": "Maria Cliente",
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01001-000",
    "reference": "Próximo à praça",
    "isDefault": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `422` Dados inválidos / regra de negócio

#### `GET /api/addresses/:id`

Detalha um endereço

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "label": "Casa",
    "recipientName": "Maria Cliente",
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01001-000",
    "reference": "Próximo à praça",
    "isDefault": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado

#### `PUT /api/addresses/:id`

Edita um endereço

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de request (body):**

```json
{
  "number": "200",
  "isDefault": true
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "label": "Casa",
    "recipientName": "Maria Cliente",
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01001-000",
    "reference": "Próximo à praça",
    "isDefault": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado · `422` Dados inválidos / regra de negócio

#### `PATCH /api/addresses/:id/default`

Define o endereço padrão

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "label": "Casa",
    "recipientName": "Maria Cliente",
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01001-000",
    "reference": "Próximo à praça",
    "isDefault": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado

#### `DELETE /api/addresses/:id`

Exclui um endereço

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": null
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado

### Categorias

#### `GET /api/categories`

Lista as categorias ativas (com contagem de produtos)

- **Autenticação:** Pública

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "name": "Cafés",
      "slug": "cafes",
      "description": "Cafés especiais",
      "image": null,
      "isActive": true,
      "productCount": 5
    }
  ]
}
```

#### `GET /api/categories/:id`

Detalha uma categoria (id numérico ou slug)

- **Autenticação:** Pública
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "name": "Cafés",
    "slug": "cafes",
    "description": "Cafés especiais",
    "image": null,
    "isActive": true,
    "productCount": 5
  }
}
```

**Possíveis erros:** `404` Não encontrado

#### `POST /api/categories`

Cria uma categoria

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "name": "Sobremesas",
  "description": "Doces da casa"
}
```

**Exemplo de response (201):**

```json
{
  "success": true,
  "message": "Recurso criado com sucesso.",
  "data": {
    "id": 1,
    "name": "Cafés",
    "slug": "cafes",
    "description": "Cafés especiais",
    "image": null,
    "isActive": true,
    "productCount": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `PUT /api/categories/:id`

Edita uma categoria

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de request (body):**

```json
{
  "description": "Nova descrição",
  "isActive": true
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "name": "Cafés",
    "slug": "cafes",
    "description": "Cafés especiais",
    "image": null,
    "isActive": true,
    "productCount": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `DELETE /api/categories/:id`

Exclui a categoria (ou apenas desativa se tiver produtos)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "deleted": false,
    "deactivated": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado

#### `POST /api/categories/:id/image`

Envia a imagem da categoria (multipart, campo "image")

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`
- **Body:** `multipart/form-data` com o arquivo no campo `image` (JPG, PNG ou WEBP).

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "name": "Cafés",
    "slug": "cafes",
    "description": "Cafés especiais",
    "image": null,
    "isActive": true,
    "productCount": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `422` Dados inválidos / regra de negócio

### Produtos

#### `GET /api/products`

Lista/busca produtos com filtros, filtros alimentares e paginação

- **Autenticação:** Pública
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)
  - `search`: Busca por nome/descrição
  - `categoryId`: Filtra por id da categoria
  - `category`: Filtra por slug da categoria
  - `minPrice / maxPrice`: Faixa de preço (considera o preço promocional quando existir)
  - `featured / available / onPromotion`: true para filtrar destaques, disponíveis ou em promoção
  - `glutenFree, lactoseFree, milkFree, eggFree, soyFree, peanutFree, nutFree, sugarFree`: true para somente produtos SEM o ingrediente
  - `vegetarian / vegan`: true para somente produtos vegetarianos/veganos
  - `sort / order`: sort: name | price | newest | featured; order: asc | desc

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 5,
      "categoryId": 1,
      "name": "Cappuccino Cremoso",
      "slug": "cappuccino-cremoso",
      "description": "Espresso, leite vaporizado e espuma cremosa.",
      "price": 14.9,
      "promotionalPrice": 12.9,
      "effectivePrice": 12.9,
      "isOnPromotion": true,
      "image": "/uploads/products/exemplo.jpg",
      "sku": "CAF-002",
      "stock": 40,
      "isAvailable": true,
      "inStock": true,
      "isFeatured": true,
      "preparationTime": 6,
      "calories": 120,
      "containsGluten": false,
      "containsLactose": true,
      "containsMilk": true,
      "isVegetarian": true,
      "isVegan": false,
      "dietary": {
        "glutenFree": true,
        "lactoseFree": false,
        "vegetarian": true,
        "vegan": false
      },
      "category": {
        "id": 1,
        "name": "Cafés",
        "slug": "cafes"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### `GET /api/products/featured`

Produtos em destaque disponíveis

- **Autenticação:** Pública
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 5,
      "categoryId": 1,
      "name": "Cappuccino Cremoso",
      "slug": "cappuccino-cremoso",
      "description": "Espresso, leite vaporizado e espuma cremosa.",
      "price": 14.9,
      "promotionalPrice": 12.9,
      "effectivePrice": 12.9,
      "isOnPromotion": true,
      "image": "/uploads/products/exemplo.jpg",
      "sku": "CAF-002",
      "stock": 40,
      "isAvailable": true,
      "inStock": true,
      "isFeatured": true,
      "preparationTime": 6,
      "calories": 120,
      "containsGluten": false,
      "containsLactose": true,
      "containsMilk": true,
      "isVegetarian": true,
      "isVegan": false,
      "dietary": {
        "glutenFree": true,
        "lactoseFree": false,
        "vegetarian": true,
        "vegan": false
      },
      "category": {
        "id": 1,
        "name": "Cafés",
        "slug": "cafes"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### `GET /api/products/promotions`

Produtos em promoção disponíveis

- **Autenticação:** Pública
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 5,
      "categoryId": 1,
      "name": "Cappuccino Cremoso",
      "slug": "cappuccino-cremoso",
      "description": "Espresso, leite vaporizado e espuma cremosa.",
      "price": 14.9,
      "promotionalPrice": 12.9,
      "effectivePrice": 12.9,
      "isOnPromotion": true,
      "image": "/uploads/products/exemplo.jpg",
      "sku": "CAF-002",
      "stock": 40,
      "isAvailable": true,
      "inStock": true,
      "isFeatured": true,
      "preparationTime": 6,
      "calories": 120,
      "containsGluten": false,
      "containsLactose": true,
      "containsMilk": true,
      "isVegetarian": true,
      "isVegan": false,
      "dietary": {
        "glutenFree": true,
        "lactoseFree": false,
        "vegetarian": true,
        "vegan": false
      },
      "category": {
        "id": 1,
        "name": "Cafés",
        "slug": "cafes"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### `GET /api/products/:id`

Detalhes do produto (id ou slug), com nota média

- **Autenticação:** Pública
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 5,
    "categoryId": 1,
    "name": "Cappuccino Cremoso",
    "slug": "cappuccino-cremoso",
    "description": "Espresso, leite vaporizado e espuma cremosa.",
    "price": 14.9,
    "promotionalPrice": 12.9,
    "effectivePrice": 12.9,
    "isOnPromotion": true,
    "image": "/uploads/products/exemplo.jpg",
    "sku": "CAF-002",
    "stock": 40,
    "isAvailable": true,
    "inStock": true,
    "isFeatured": true,
    "preparationTime": 6,
    "calories": 120,
    "containsGluten": false,
    "containsLactose": true,
    "containsMilk": true,
    "isVegetarian": true,
    "isVegan": false,
    "dietary": {
      "glutenFree": true,
      "lactoseFree": false,
      "vegetarian": true,
      "vegan": false
    },
    "category": {
      "id": 1,
      "name": "Cafés",
      "slug": "cafes"
    },
    "rating": {
      "average": 4.7,
      "count": 12
    }
  }
}
```

**Possíveis erros:** `404` Não encontrado

#### `GET /api/products/:id/availability`

Verifica disponibilidade e estoque

- **Autenticação:** Pública
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "productId": 5,
    "name": "Cappuccino Cremoso",
    "isAvailable": true,
    "stock": 40,
    "inStock": true,
    "maxQuantity": 40
  }
}
```

**Possíveis erros:** `404` Não encontrado

#### `GET /api/products/:id/reviews`

Avaliações do produto + resumo (média e distribuição)

- **Autenticação:** Pública
- **Parâmetros de rota:** `id`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Delicioso!",
      "user": {
        "id": 2,
        "name": "Maria Cliente"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "meta": {
    "summary": {
      "average": 4.7,
      "count": 12,
      "distribution": {
        "1": 0,
        "2": 0,
        "3": 1,
        "4": 2,
        "5": 9
      }
    }
  }
}
```

#### `POST /api/products`

Cria um produto

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "categoryId": 1,
  "name": "Brownie Vegano",
  "description": "Brownie de cacau 70% sem leite e sem ovos.",
  "price": 11.5,
  "promotionalPrice": null,
  "sku": "DOC-010",
  "stock": 25,
  "isAvailable": true,
  "isFeatured": false,
  "preparationTime": 2,
  "calories": 310,
  "containsGluten": true,
  "containsLactose": false,
  "containsMilk": false,
  "containsEggs": false,
  "containsSoy": false,
  "containsPeanuts": false,
  "containsNuts": false,
  "containsSugar": true,
  "isVegetarian": true,
  "isVegan": true,
  "ingredients": "Farinha, cacau, açúcar, óleo de coco",
  "allergens": "Contém glúten"
}
```

**Exemplo de response (201):**

```json
{
  "success": true,
  "message": "Recurso criado com sucesso.",
  "data": {
    "id": 5,
    "categoryId": 1,
    "name": "Cappuccino Cremoso",
    "slug": "cappuccino-cremoso",
    "description": "Espresso, leite vaporizado e espuma cremosa.",
    "price": 14.9,
    "promotionalPrice": 12.9,
    "effectivePrice": 12.9,
    "isOnPromotion": true,
    "image": "/uploads/products/exemplo.jpg",
    "sku": "CAF-002",
    "stock": 40,
    "isAvailable": true,
    "inStock": true,
    "isFeatured": true,
    "preparationTime": 6,
    "calories": 120,
    "containsGluten": false,
    "containsLactose": true,
    "containsMilk": true,
    "isVegetarian": true,
    "isVegan": false,
    "dietary": {
      "glutenFree": true,
      "lactoseFree": false,
      "vegetarian": true,
      "vegan": false
    },
    "category": {
      "id": 1,
      "name": "Cafés",
      "slug": "cafes"
    }
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `PUT /api/products/:id`

Edita um produto (campos opcionais)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de request (body):**

```json
{
  "price": 12,
  "promotionalPrice": 10
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 5,
    "categoryId": 1,
    "name": "Cappuccino Cremoso",
    "slug": "cappuccino-cremoso",
    "description": "Espresso, leite vaporizado e espuma cremosa.",
    "price": 14.9,
    "promotionalPrice": 12.9,
    "effectivePrice": 12.9,
    "isOnPromotion": true,
    "image": "/uploads/products/exemplo.jpg",
    "sku": "CAF-002",
    "stock": 40,
    "isAvailable": true,
    "inStock": true,
    "isFeatured": true,
    "preparationTime": 6,
    "calories": 120,
    "containsGluten": false,
    "containsLactose": true,
    "containsMilk": true,
    "isVegetarian": true,
    "isVegan": false,
    "dietary": {
      "glutenFree": true,
      "lactoseFree": false,
      "vegetarian": true,
      "vegan": false
    },
    "category": {
      "id": 1,
      "name": "Cafés",
      "slug": "cafes"
    }
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `DELETE /api/products/:id`

Exclui (ou desativa, se já foi vendido)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "deleted": false,
    "deactivated": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado

#### `POST /api/products/:id/image`

Envia a imagem do produto (multipart, campo "image")

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`
- **Body:** `multipart/form-data` com o arquivo no campo `image` (JPG, PNG ou WEBP).

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 5,
    "categoryId": 1,
    "name": "Cappuccino Cremoso",
    "slug": "cappuccino-cremoso",
    "description": "Espresso, leite vaporizado e espuma cremosa.",
    "price": 14.9,
    "promotionalPrice": 12.9,
    "effectivePrice": 12.9,
    "isOnPromotion": true,
    "image": "/uploads/products/exemplo.jpg",
    "sku": "CAF-002",
    "stock": 40,
    "isAvailable": true,
    "inStock": true,
    "isFeatured": true,
    "preparationTime": 6,
    "calories": 120,
    "containsGluten": false,
    "containsLactose": true,
    "containsMilk": true,
    "isVegetarian": true,
    "isVegan": false,
    "dietary": {
      "glutenFree": true,
      "lactoseFree": false,
      "vegetarian": true,
      "vegan": false
    },
    "category": {
      "id": 1,
      "name": "Cafés",
      "slug": "cafes"
    }
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `422` Dados inválidos / regra de negócio

### Favoritos

#### `GET /api/favorites`

Lista os favoritos

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "productId": 5,
      "product": {
        "id": 5,
        "categoryId": 1,
        "name": "Cappuccino Cremoso",
        "slug": "cappuccino-cremoso",
        "description": "Espresso, leite vaporizado e espuma cremosa.",
        "price": 14.9,
        "promotionalPrice": 12.9,
        "effectivePrice": 12.9,
        "isOnPromotion": true,
        "image": "/uploads/products/exemplo.jpg",
        "sku": "CAF-002",
        "stock": 40,
        "isAvailable": true,
        "inStock": true,
        "isFeatured": true,
        "preparationTime": 6,
        "calories": 120,
        "containsGluten": false,
        "containsLactose": true,
        "containsMilk": true,
        "isVegetarian": true,
        "isVegan": false,
        "dietary": {
          "glutenFree": true,
          "lactoseFree": false,
          "vegetarian": true,
          "vegan": false
        },
        "category": {
          "id": 1,
          "name": "Cafés",
          "slug": "cafes"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `POST /api/favorites`

Favorita um produto (sem duplicar)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "productId": 5
}
```

**Exemplo de response (201):**

```json
{
  "success": true,
  "message": "Recurso criado com sucesso.",
  "data": {
    "id": 1,
    "productId": 5,
    "product": {
      "id": 5,
      "categoryId": 1,
      "name": "Cappuccino Cremoso",
      "slug": "cappuccino-cremoso",
      "description": "Espresso, leite vaporizado e espuma cremosa.",
      "price": 14.9,
      "promotionalPrice": 12.9,
      "effectivePrice": 12.9,
      "isOnPromotion": true,
      "image": "/uploads/products/exemplo.jpg",
      "sku": "CAF-002",
      "stock": 40,
      "isAvailable": true,
      "inStock": true,
      "isFeatured": true,
      "preparationTime": 6,
      "calories": 120,
      "containsGluten": false,
      "containsLactose": true,
      "containsMilk": true,
      "isVegetarian": true,
      "isVegan": false,
      "dietary": {
        "glutenFree": true,
        "lactoseFree": false,
        "vegetarian": true,
        "vegan": false
      },
      "category": {
        "id": 1,
        "name": "Cafés",
        "slug": "cafes"
      }
    }
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `GET /api/favorites/:productId/check`

O produto está favoritado?

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `productId`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "productId": 5,
    "isFavorite": true
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `DELETE /api/favorites/:productId`

Remove dos favoritos

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `productId`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": null
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado

### Carrinho

#### `GET /api/cart`

Carrinho com preços reais do banco, subtotal, desconto e total

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "items": [
      {
        "productId": 5,
        "name": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "originalPrice": 14.9,
        "subtotal": 25.8,
        "isAvailable": true,
        "availabilityIssue": null
      }
    ],
    "itemCount": 2,
    "hasUnavailableItems": false,
    "coupon": {
      "code": "BEMVINDO10",
      "name": "Bem-vindo",
      "type": "PERCENTAGE",
      "value": 10,
      "valid": true,
      "message": null
    },
    "subtotal": 25.8,
    "discount": 2.58,
    "total": 23.22
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `DELETE /api/cart`

Limpa o carrinho (e remove o cupom)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "items": [],
    "itemCount": 0,
    "hasUnavailableItems": false,
    "coupon": null,
    "subtotal": 0,
    "discount": 0,
    "total": 0
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `POST /api/cart/items`

Adiciona produto (preço NUNCA vem do cliente)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "productId": 5,
  "quantity": 2
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "items": [
      {
        "productId": 5,
        "name": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "originalPrice": 14.9,
        "subtotal": 25.8,
        "isAvailable": true,
        "availabilityIssue": null
      }
    ],
    "itemCount": 2,
    "hasUnavailableItems": false,
    "coupon": {
      "code": "BEMVINDO10",
      "name": "Bem-vindo",
      "type": "PERCENTAGE",
      "value": 10,
      "valid": true,
      "message": null
    },
    "subtotal": 25.8,
    "discount": 2.58,
    "total": 23.22
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `PATCH /api/cart/items/:productId`

Altera a quantidade

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `productId`

**Exemplo de request (body):**

```json
{
  "quantity": 3
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "items": [
      {
        "productId": 5,
        "name": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "originalPrice": 14.9,
        "subtotal": 25.8,
        "isAvailable": true,
        "availabilityIssue": null
      }
    ],
    "itemCount": 2,
    "hasUnavailableItems": false,
    "coupon": {
      "code": "BEMVINDO10",
      "name": "Bem-vindo",
      "type": "PERCENTAGE",
      "value": 10,
      "valid": true,
      "message": null
    },
    "subtotal": 25.8,
    "discount": 2.58,
    "total": 23.22
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `POST /api/cart/items/:productId/increment`

Aumenta a quantidade em 1

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `productId`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "items": [
      {
        "productId": 5,
        "name": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "originalPrice": 14.9,
        "subtotal": 25.8,
        "isAvailable": true,
        "availabilityIssue": null
      }
    ],
    "itemCount": 2,
    "hasUnavailableItems": false,
    "coupon": {
      "code": "BEMVINDO10",
      "name": "Bem-vindo",
      "type": "PERCENTAGE",
      "value": 10,
      "valid": true,
      "message": null
    },
    "subtotal": 25.8,
    "discount": 2.58,
    "total": 23.22
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado · `409` Conflito

#### `POST /api/cart/items/:productId/decrement`

Diminui em 1 (remove ao chegar em zero)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `productId`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "items": [
      {
        "productId": 5,
        "name": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "originalPrice": 14.9,
        "subtotal": 25.8,
        "isAvailable": true,
        "availabilityIssue": null
      }
    ],
    "itemCount": 2,
    "hasUnavailableItems": false,
    "coupon": {
      "code": "BEMVINDO10",
      "name": "Bem-vindo",
      "type": "PERCENTAGE",
      "value": 10,
      "valid": true,
      "message": null
    },
    "subtotal": 25.8,
    "discount": 2.58,
    "total": 23.22
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado

#### `DELETE /api/cart/items/:productId`

Remove o produto do carrinho

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `productId`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "items": [
      {
        "productId": 5,
        "name": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "originalPrice": 14.9,
        "subtotal": 25.8,
        "isAvailable": true,
        "availabilityIssue": null
      }
    ],
    "itemCount": 2,
    "hasUnavailableItems": false,
    "coupon": {
      "code": "BEMVINDO10",
      "name": "Bem-vindo",
      "type": "PERCENTAGE",
      "value": 10,
      "valid": true,
      "message": null
    },
    "subtotal": 25.8,
    "discount": 2.58,
    "total": 23.22
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado

#### `POST /api/cart/coupon`

Aplica um cupom ao carrinho

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "code": "BEMVINDO10"
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "items": [
      {
        "productId": 5,
        "name": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "originalPrice": 14.9,
        "subtotal": 25.8,
        "isAvailable": true,
        "availabilityIssue": null
      }
    ],
    "itemCount": 2,
    "hasUnavailableItems": false,
    "coupon": {
      "code": "BEMVINDO10",
      "name": "Bem-vindo",
      "type": "PERCENTAGE",
      "value": 10,
      "valid": true,
      "message": null
    },
    "subtotal": 25.8,
    "discount": 2.58,
    "total": 23.22
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado · `422` Dados inválidos / regra de negócio

#### `DELETE /api/cart/coupon`

Remove o cupom do carrinho

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "items": [
      {
        "productId": 5,
        "name": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "originalPrice": 14.9,
        "subtotal": 25.8,
        "isAvailable": true,
        "availabilityIssue": null
      }
    ],
    "itemCount": 2,
    "hasUnavailableItems": false,
    "coupon": {
      "code": "BEMVINDO10",
      "name": "Bem-vindo",
      "type": "PERCENTAGE",
      "value": 10,
      "valid": true,
      "message": null
    },
    "subtotal": 25.8,
    "discount": 2.58,
    "total": 23.22
  }
}
```

**Possíveis erros:** `401` Não autenticado

### Pedidos

#### `POST /api/orders/quote`

Simula o checkout (totais, taxa de entrega, cupom) sem criar pedido

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "deliveryType": "DELIVERY",
  "addressId": 1,
  "couponCode": "BEMVINDO10"
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "subtotal": 25.8,
    "discount": 2.58,
    "deliveryFee": 8,
    "total": 31.22,
    "deliveryType": "DELIVERY",
    "couponCode": "BEMVINDO10",
    "canCheckout": true,
    "unavailableItems": []
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado · `422` Dados inválidos / regra de negócio

#### `POST /api/orders`

Cria o pedido a partir do carrinho (transação: estoque, cupom, pagamento, pontos)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "deliveryType": "DELIVERY",
  "addressId": 1,
  "paymentMethod": "CREDIT_CARD",
  "couponCode": "BEMVINDO10",
  "notes": "Sem açúcar, por favor.",
  "card": {
    "number": "4242 4242 4242 4242",
    "holderName": "MARIA CLIENTE",
    "expiryMonth": 12,
    "expiryYear": 2030,
    "cvv": "123"
  }
}
```

**Exemplo de response (201):**

```json
{
  "success": true,
  "message": "Recurso criado com sucesso.",
  "data": {
    "id": 10,
    "orderNumber": "DV-20261009-K3M7QA",
    "userId": 2,
    "deliveryType": "DELIVERY",
    "subtotal": 25.8,
    "discount": 2.58,
    "deliveryFee": 8,
    "total": 31.22,
    "paymentMethod": "PIX",
    "paymentStatus": "PENDING",
    "orderStatus": "PENDING",
    "notes": "Sem açúcar, por favor.",
    "deliveryAddress": {
      "id": 1,
      "label": "Casa",
      "recipientName": "Maria Cliente",
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01001-000",
      "reference": "Próximo à praça",
      "isDefault": true
    },
    "items": [
      {
        "productId": 5,
        "productName": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "subtotal": 25.8
      }
    ],
    "payment": {
      "method": "PIX",
      "status": "PENDING",
      "amount": 31.22,
      "pixCode": "00020126DVANILLESIMULADO..."
    },
    "statusHistory": [
      {
        "status": "PENDING",
        "note": "Pedido criado.",
        "createdAt": "2026-10-09T12:00:00.000Z"
      }
    ],
    "canCancel": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `GET /api/orders`

Meus pedidos

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)
  - `status`: Filtra pelo status do pedido

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 10,
      "orderNumber": "DV-20261009-K3M7QA",
      "userId": 2,
      "deliveryType": "DELIVERY",
      "subtotal": 25.8,
      "discount": 2.58,
      "deliveryFee": 8,
      "total": 31.22,
      "paymentMethod": "PIX",
      "paymentStatus": "PENDING",
      "orderStatus": "PENDING",
      "notes": "Sem açúcar, por favor.",
      "deliveryAddress": {
        "id": 1,
        "label": "Casa",
        "recipientName": "Maria Cliente",
        "street": "Rua das Flores",
        "number": "123",
        "complement": "Apto 45",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01001-000",
        "reference": "Próximo à praça",
        "isDefault": true
      },
      "items": [
        {
          "productId": 5,
          "productName": "Cappuccino Cremoso",
          "quantity": 2,
          "unitPrice": 12.9,
          "subtotal": 25.8
        }
      ],
      "payment": {
        "method": "PIX",
        "status": "PENDING",
        "amount": 31.22,
        "pixCode": "00020126DVANILLESIMULADO..."
      },
      "statusHistory": [
        {
          "status": "PENDING",
          "note": "Pedido criado.",
          "createdAt": "2026-10-09T12:00:00.000Z"
        }
      ],
      "canCancel": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `GET /api/orders/:id`

Detalhes do meu pedido

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 10,
    "orderNumber": "DV-20261009-K3M7QA",
    "userId": 2,
    "deliveryType": "DELIVERY",
    "subtotal": 25.8,
    "discount": 2.58,
    "deliveryFee": 8,
    "total": 31.22,
    "paymentMethod": "PIX",
    "paymentStatus": "PENDING",
    "orderStatus": "PENDING",
    "notes": "Sem açúcar, por favor.",
    "deliveryAddress": {
      "id": 1,
      "label": "Casa",
      "recipientName": "Maria Cliente",
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01001-000",
      "reference": "Próximo à praça",
      "isDefault": true
    },
    "items": [
      {
        "productId": 5,
        "productName": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "subtotal": 25.8
      }
    ],
    "payment": {
      "method": "PIX",
      "status": "PENDING",
      "amount": 31.22,
      "pixCode": "00020126DVANILLESIMULADO..."
    },
    "statusHistory": [
      {
        "status": "PENDING",
        "note": "Pedido criado.",
        "createdAt": "2026-10-09T12:00:00.000Z"
      }
    ],
    "canCancel": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado

#### `GET /api/orders/:id/tracking`

Linha do tempo para acompanhar o status

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "orderId": 10,
    "orderNumber": "DV-20261009-K3M7QA",
    "orderStatus": "PREPARING",
    "steps": [
      {
        "status": "PENDING",
        "reached": true,
        "reachedAt": "2026-10-09T12:00:00.000Z"
      },
      {
        "status": "CONFIRMED",
        "reached": true,
        "reachedAt": "2026-10-09T12:01:00.000Z"
      },
      {
        "status": "PREPARING",
        "reached": true,
        "reachedAt": "2026-10-09T12:05:00.000Z"
      },
      {
        "status": "READY",
        "reached": false,
        "reachedAt": null
      }
    ]
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado

#### `POST /api/orders/:id/cancel`

Cancela o meu pedido (somente PENDING/CONFIRMED); devolve estoque, cupom e estorna

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 10,
    "orderNumber": "DV-20261009-K3M7QA",
    "userId": 2,
    "deliveryType": "DELIVERY",
    "subtotal": 25.8,
    "discount": 2.58,
    "deliveryFee": 8,
    "total": 31.22,
    "paymentMethod": "PIX",
    "paymentStatus": "PENDING",
    "orderStatus": "PENDING",
    "notes": "Sem açúcar, por favor.",
    "deliveryAddress": {
      "id": 1,
      "label": "Casa",
      "recipientName": "Maria Cliente",
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01001-000",
      "reference": "Próximo à praça",
      "isDefault": true
    },
    "items": [
      {
        "productId": 5,
        "productName": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "subtotal": 25.8
      }
    ],
    "payment": {
      "method": "PIX",
      "status": "PENDING",
      "amount": 31.22,
      "pixCode": "00020126DVANILLESIMULADO..."
    },
    "statusHistory": [
      {
        "status": "PENDING",
        "note": "Pedido criado.",
        "createdAt": "2026-10-09T12:00:00.000Z"
      }
    ],
    "canCancel": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado · `409` Conflito

### Pagamentos

#### `GET /api/payments/methods`

Métodos de pagamento aceitos

- **Autenticação:** Pública

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "method": "PIX",
      "label": "PIX",
      "online": true
    },
    {
      "method": "CASH",
      "label": "Dinheiro",
      "online": false
    }
  ]
}
```

#### `GET /api/payments/order/:orderId`

Pagamento de um pedido

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `orderId`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "orderId": 10,
    "orderStatus": "PENDING",
    "payment": {
      "method": "PIX",
      "status": "PENDING",
      "amount": 31.22,
      "pixCode": "00020126DVANILLESIMULADO..."
    }
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado

#### `POST /api/payments/order/:orderId/confirm`

SIMULA a confirmação do PIX (equivale ao webhook do gateway)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `orderId`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "method": "PIX",
    "status": "APPROVED",
    "amount": 31.22
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `POST /api/payments/order/:orderId/refund`

Estorna um pagamento aprovado

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `orderId`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "method": "PIX",
    "status": "REFUNDED",
    "amount": 31.22
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `409` Conflito

### Promoções

#### `GET /api/promotions`

Cupons vigentes (vitrine)

- **Autenticação:** Pública

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "name": "Bem-vindo",
      "description": "10% na primeira compra",
      "code": "BEMVINDO10",
      "type": "PERCENTAGE",
      "value": 10,
      "startsAt": "2026-01-01T00:00:00.000Z",
      "endsAt": "2027-12-31T23:59:59.000Z",
      "usageLimit": 1000,
      "usedCount": 12,
      "perUserLimit": 1,
      "minOrderValue": 20,
      "isActive": true
    }
  ]
}
```

#### `POST /api/promotions/validate`

Valida um cupom contra o carrinho atual

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "code": "BEMVINDO10"
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "valid": true,
    "discount": 2.58
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado · `422` Dados inválidos / regra de negócio

#### `GET /api/promotions/admin/all`

Lista todas as promoções

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "name": "Bem-vindo",
      "description": "10% na primeira compra",
      "code": "BEMVINDO10",
      "type": "PERCENTAGE",
      "value": 10,
      "startsAt": "2026-01-01T00:00:00.000Z",
      "endsAt": "2027-12-31T23:59:59.000Z",
      "usageLimit": 1000,
      "usedCount": 12,
      "perUserLimit": 1,
      "minOrderValue": 20,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão

#### `GET /api/promotions/admin/:id`

Detalha uma promoção

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "name": "Bem-vindo",
    "description": "10% na primeira compra",
    "code": "BEMVINDO10",
    "type": "PERCENTAGE",
    "value": 10,
    "startsAt": "2026-01-01T00:00:00.000Z",
    "endsAt": "2027-12-31T23:59:59.000Z",
    "usageLimit": 1000,
    "usedCount": 12,
    "perUserLimit": 1,
    "minOrderValue": 20,
    "isActive": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado

#### `POST /api/promotions`

Cria uma promoção/cupom

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "name": "Semana do Café",
  "description": "R$ 5 de desconto",
  "code": "CAFE5",
  "type": "FIXED",
  "value": 5,
  "startsAt": "2026-10-01T00:00:00.000Z",
  "endsAt": "2026-12-31T23:59:59.000Z",
  "usageLimit": 200,
  "perUserLimit": 1,
  "minOrderValue": 25,
  "isActive": true
}
```

**Exemplo de response (201):**

```json
{
  "success": true,
  "message": "Recurso criado com sucesso.",
  "data": {
    "id": 1,
    "name": "Bem-vindo",
    "description": "10% na primeira compra",
    "code": "BEMVINDO10",
    "type": "PERCENTAGE",
    "value": 10,
    "startsAt": "2026-01-01T00:00:00.000Z",
    "endsAt": "2027-12-31T23:59:59.000Z",
    "usageLimit": 1000,
    "usedCount": 12,
    "perUserLimit": 1,
    "minOrderValue": 20,
    "isActive": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `PUT /api/promotions/:id`

Edita uma promoção

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de request (body):**

```json
{
  "isActive": false
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "name": "Bem-vindo",
    "description": "10% na primeira compra",
    "code": "BEMVINDO10",
    "type": "PERCENTAGE",
    "value": 10,
    "startsAt": "2026-01-01T00:00:00.000Z",
    "endsAt": "2027-12-31T23:59:59.000Z",
    "usageLimit": 1000,
    "usedCount": 12,
    "perUserLimit": 1,
    "minOrderValue": 20,
    "isActive": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `DELETE /api/promotions/:id`

Exclui (ou desativa, se já foi usada)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "deleted": false,
    "deactivated": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado

### Avaliações

#### `GET /api/reviews/me`

Minhas avaliações

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "productId": 5,
      "rating": 5,
      "comment": "Delicioso!"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `POST /api/reviews`

Avalia um produto comprado e entregue (nota 1 a 5)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "productId": 5,
  "rating": 5,
  "comment": "Delicioso!"
}
```

**Exemplo de response (201):**

```json
{
  "success": true,
  "message": "Recurso criado com sucesso.",
  "data": {
    "id": 1,
    "productId": 5,
    "orderId": 10,
    "rating": 5,
    "comment": "Delicioso!"
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `PUT /api/reviews/:id`

Edita minha avaliação

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de request (body):**

```json
{
  "rating": 4
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "rating": 4
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado · `422` Dados inválidos / regra de negócio

#### `DELETE /api/reviews/:id`

Apaga minha avaliação

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": null
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado

### Notificações

#### `GET /api/notifications`

Lista notificações (?unread=true para só não lidas)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)
  - `unread`: true para somente não lidas

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "title": "Pedido confirmado",
      "message": "Seu pedido DV-... foi confirmado.",
      "type": "ORDER_CONFIRMED",
      "isRead": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `GET /api/notifications/unread-count`

Quantidade de não lidas

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "unreadCount": 3
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `PATCH /api/notifications/read-all`

Marca todas como lidas

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "updated": 3
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `PATCH /api/notifications/:id/read`

Marca uma como lida

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "isRead": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado

### Fidelidade

#### `GET /api/loyalty`

Saldo e totais de pontos (R$ 1 = 1 ponto)

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "balance": 120,
    "totalEarned": 150,
    "totalRedeemed": 30,
    "pointsPerReal": 1
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `GET /api/loyalty/history`

Histórico de pontos

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "type": "EARNED",
      "points": 31,
      "balanceAfter": 151,
      "description": "Pontos do pedido DV-..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado

#### `GET /api/loyalty/rewards`

Recompensas disponíveis

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "name": "Café grátis",
      "pointsCost": 100,
      "isActive": true
    }
  ]
}
```

**Possíveis erros:** `401` Não autenticado

#### `POST /api/loyalty/rewards/:id/redeem`

Troca pontos por uma recompensa

- **Autenticação:** JWT (usuário logado)
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "balance": 20,
    "reward": {
      "id": 1,
      "name": "Café grátis"
    }
  }
}
```

**Possíveis erros:** `401` Não autenticado · `404` Não encontrado · `422` Dados inválidos / regra de negócio

### Admin - Painel

#### `GET /api/admin/dashboard`

Estatísticas: usuários, produtos, pedidos, faturamento, mais vendidos, pedidos recentes

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "users": {
      "total": 42
    },
    "products": {
      "total": 30,
      "lowStock": 2
    },
    "orders": {
      "total": 120,
      "pending": 4,
      "inProgress": 6,
      "completed": 100,
      "cancelled": 10
    },
    "revenue": 5432.1,
    "topProducts": [
      {
        "productId": 5,
        "name": "Cappuccino Cremoso",
        "quantitySold": 80,
        "revenue": 1032
      }
    ],
    "recentOrders": []
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão

### Admin - Usuários

#### `GET /api/admin/users`

Lista usuários (filtros: search, role, isActive)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)
  - `search`: Nome, e-mail ou telefone
  - `role`: CUSTOMER | ADMIN
  - `isActive`: true | false

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 2,
      "name": "Maria Cliente",
      "email": "cliente@dvanille.com",
      "phone": "(11) 99999-0000",
      "role": "CUSTOMER",
      "profileImage": null,
      "isActive": true,
      "loyaltyPoints": 120,
      "createdAt": "2026-10-01T12:00:00.000Z",
      "updatedAt": "2026-10-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão

#### `GET /api/admin/users/:id`

Detalha um usuário

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 2,
    "name": "Maria Cliente",
    "email": "cliente@dvanille.com",
    "phone": "(11) 99999-0000",
    "role": "CUSTOMER",
    "profileImage": null,
    "isActive": true,
    "loyaltyPoints": 120,
    "createdAt": "2026-10-01T12:00:00.000Z",
    "updatedAt": "2026-10-01T12:00:00.000Z"
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado

#### `PATCH /api/admin/users/:id/status`

Ativa/desativa um usuário

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de request (body):**

```json
{
  "isActive": false
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 2,
    "name": "Maria Cliente",
    "email": "cliente@dvanille.com",
    "phone": "(11) 99999-0000",
    "role": "CUSTOMER",
    "profileImage": null,
    "isActive": true,
    "loyaltyPoints": 120,
    "createdAt": "2026-10-01T12:00:00.000Z",
    "updatedAt": "2026-10-01T12:00:00.000Z"
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `422` Dados inválidos / regra de negócio

### Admin - Produtos

#### `GET /api/admin/products`

Lista TODOS os produtos (inclui inativos)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)
  - `search`: Busca por nome/descrição
  - `categoryId`: Filtra por id da categoria
  - `category`: Filtra por slug da categoria
  - `minPrice / maxPrice`: Faixa de preço (considera o preço promocional quando existir)
  - `featured / available / onPromotion`: true para filtrar destaques, disponíveis ou em promoção
  - `glutenFree, lactoseFree, milkFree, eggFree, soyFree, peanutFree, nutFree, sugarFree`: true para somente produtos SEM o ingrediente
  - `vegetarian / vegan`: true para somente produtos vegetarianos/veganos
  - `sort / order`: sort: name | price | newest | featured; order: asc | desc

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 5,
      "categoryId": 1,
      "name": "Cappuccino Cremoso",
      "slug": "cappuccino-cremoso",
      "description": "Espresso, leite vaporizado e espuma cremosa.",
      "price": 14.9,
      "promotionalPrice": 12.9,
      "effectivePrice": 12.9,
      "isOnPromotion": true,
      "image": "/uploads/products/exemplo.jpg",
      "sku": "CAF-002",
      "stock": 40,
      "isAvailable": true,
      "inStock": true,
      "isFeatured": true,
      "preparationTime": 6,
      "calories": 120,
      "containsGluten": false,
      "containsLactose": true,
      "containsMilk": true,
      "isVegetarian": true,
      "isVegan": false,
      "dietary": {
        "glutenFree": true,
        "lactoseFree": false,
        "vegetarian": true,
        "vegan": false
      },
      "category": {
        "id": 1,
        "name": "Cafés",
        "slug": "cafes"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão

#### `POST /api/admin/products`

Cria produto

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "categoryId": 1,
  "name": "Brownie Vegano",
  "description": "Brownie de cacau 70% sem leite e sem ovos.",
  "price": 11.5,
  "promotionalPrice": null,
  "sku": "DOC-010",
  "stock": 25,
  "isAvailable": true,
  "isFeatured": false,
  "preparationTime": 2,
  "calories": 310,
  "containsGluten": true,
  "containsLactose": false,
  "containsMilk": false,
  "containsEggs": false,
  "containsSoy": false,
  "containsPeanuts": false,
  "containsNuts": false,
  "containsSugar": true,
  "isVegetarian": true,
  "isVegan": true,
  "ingredients": "Farinha, cacau, açúcar, óleo de coco",
  "allergens": "Contém glúten"
}
```

**Exemplo de response (201):**

```json
{
  "success": true,
  "message": "Recurso criado com sucesso.",
  "data": {
    "id": 5,
    "categoryId": 1,
    "name": "Cappuccino Cremoso",
    "slug": "cappuccino-cremoso",
    "description": "Espresso, leite vaporizado e espuma cremosa.",
    "price": 14.9,
    "promotionalPrice": 12.9,
    "effectivePrice": 12.9,
    "isOnPromotion": true,
    "image": "/uploads/products/exemplo.jpg",
    "sku": "CAF-002",
    "stock": 40,
    "isAvailable": true,
    "inStock": true,
    "isFeatured": true,
    "preparationTime": 6,
    "calories": 120,
    "containsGluten": false,
    "containsLactose": true,
    "containsMilk": true,
    "isVegetarian": true,
    "isVegan": false,
    "dietary": {
      "glutenFree": true,
      "lactoseFree": false,
      "vegetarian": true,
      "vegan": false
    },
    "category": {
      "id": 1,
      "name": "Cafés",
      "slug": "cafes"
    }
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `PUT /api/admin/products/:id`

Edita produto

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de request (body):**

```json
{
  "stock": 50,
  "isFeatured": true
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 5,
    "categoryId": 1,
    "name": "Cappuccino Cremoso",
    "slug": "cappuccino-cremoso",
    "description": "Espresso, leite vaporizado e espuma cremosa.",
    "price": 14.9,
    "promotionalPrice": 12.9,
    "effectivePrice": 12.9,
    "isOnPromotion": true,
    "image": "/uploads/products/exemplo.jpg",
    "sku": "CAF-002",
    "stock": 40,
    "isAvailable": true,
    "inStock": true,
    "isFeatured": true,
    "preparationTime": 6,
    "calories": 120,
    "containsGluten": false,
    "containsLactose": true,
    "containsMilk": true,
    "isVegetarian": true,
    "isVegan": false,
    "dietary": {
      "glutenFree": true,
      "lactoseFree": false,
      "vegetarian": true,
      "vegan": false
    },
    "category": {
      "id": 1,
      "name": "Cafés",
      "slug": "cafes"
    }
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `DELETE /api/admin/products/:id`

Exclui/desativa produto

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "deleted": false,
    "deactivated": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado

#### `POST /api/admin/products/:id/image`

Upload da imagem do produto (multipart, campo "image")

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`
- **Body:** `multipart/form-data` com o arquivo no campo `image` (JPG, PNG ou WEBP).

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 5,
    "categoryId": 1,
    "name": "Cappuccino Cremoso",
    "slug": "cappuccino-cremoso",
    "description": "Espresso, leite vaporizado e espuma cremosa.",
    "price": 14.9,
    "promotionalPrice": 12.9,
    "effectivePrice": 12.9,
    "isOnPromotion": true,
    "image": "/uploads/products/exemplo.jpg",
    "sku": "CAF-002",
    "stock": 40,
    "isAvailable": true,
    "inStock": true,
    "isFeatured": true,
    "preparationTime": 6,
    "calories": 120,
    "containsGluten": false,
    "containsLactose": true,
    "containsMilk": true,
    "isVegetarian": true,
    "isVegan": false,
    "dietary": {
      "glutenFree": true,
      "lactoseFree": false,
      "vegetarian": true,
      "vegan": false
    },
    "category": {
      "id": 1,
      "name": "Cafés",
      "slug": "cafes"
    }
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `422` Dados inválidos / regra de negócio

### Admin - Categorias

#### `GET /api/admin/categories`

Lista todas as categorias (inclui inativas)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "name": "Cafés",
      "slug": "cafes",
      "description": "Cafés especiais",
      "image": null,
      "isActive": true,
      "productCount": 5
    }
  ]
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão

#### `POST /api/admin/categories`

Cria categoria

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "name": "Sobremesas"
}
```

**Exemplo de response (201):**

```json
{
  "success": true,
  "message": "Recurso criado com sucesso.",
  "data": {
    "id": 1,
    "name": "Cafés",
    "slug": "cafes",
    "description": "Cafés especiais",
    "image": null,
    "isActive": true,
    "productCount": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `PUT /api/admin/categories/:id`

Edita categoria

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de request (body):**

```json
{
  "isActive": true
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "name": "Cafés",
    "slug": "cafes",
    "description": "Cafés especiais",
    "image": null,
    "isActive": true,
    "productCount": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `DELETE /api/admin/categories/:id`

Exclui/desativa categoria

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "deleted": true,
    "deactivated": false
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado

#### `POST /api/admin/categories/:id/image`

Upload da imagem da categoria (multipart, campo "image")

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`
- **Body:** `multipart/form-data` com o arquivo no campo `image` (JPG, PNG ou WEBP).

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "name": "Cafés",
    "slug": "cafes",
    "description": "Cafés especiais",
    "image": null,
    "isActive": true,
    "productCount": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `422` Dados inválidos / regra de negócio

### Admin - Pedidos

#### `GET /api/admin/orders`

Lista pedidos (filtros: status, paymentStatus, deliveryType, userId, search, dateFrom, dateTo)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)
  - `status`: Status do pedido
  - `paymentStatus`: PENDING | APPROVED | DECLINED | REFUNDED
  - `deliveryType`: DELIVERY | PICKUP
  - `search`: Nº do pedido, nome ou e-mail
  - `dateFrom / dateTo`: Datas ISO 8601

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 10,
      "orderNumber": "DV-20261009-K3M7QA",
      "userId": 2,
      "deliveryType": "DELIVERY",
      "subtotal": 25.8,
      "discount": 2.58,
      "deliveryFee": 8,
      "total": 31.22,
      "paymentMethod": "PIX",
      "paymentStatus": "PENDING",
      "orderStatus": "PENDING",
      "notes": "Sem açúcar, por favor.",
      "deliveryAddress": {
        "id": 1,
        "label": "Casa",
        "recipientName": "Maria Cliente",
        "street": "Rua das Flores",
        "number": "123",
        "complement": "Apto 45",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01001-000",
        "reference": "Próximo à praça",
        "isDefault": true
      },
      "items": [
        {
          "productId": 5,
          "productName": "Cappuccino Cremoso",
          "quantity": 2,
          "unitPrice": 12.9,
          "subtotal": 25.8
        }
      ],
      "payment": {
        "method": "PIX",
        "status": "PENDING",
        "amount": 31.22,
        "pixCode": "00020126DVANILLESIMULADO..."
      },
      "statusHistory": [
        {
          "status": "PENDING",
          "note": "Pedido criado.",
          "createdAt": "2026-10-09T12:00:00.000Z"
        }
      ],
      "canCancel": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão

#### `GET /api/admin/orders/:id`

Detalha um pedido (com cliente e próximos status permitidos)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 10,
    "orderNumber": "DV-20261009-K3M7QA",
    "userId": 2,
    "deliveryType": "DELIVERY",
    "subtotal": 25.8,
    "discount": 2.58,
    "deliveryFee": 8,
    "total": 31.22,
    "paymentMethod": "PIX",
    "paymentStatus": "PENDING",
    "orderStatus": "PENDING",
    "notes": "Sem açúcar, por favor.",
    "deliveryAddress": {
      "id": 1,
      "label": "Casa",
      "recipientName": "Maria Cliente",
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01001-000",
      "reference": "Próximo à praça",
      "isDefault": true
    },
    "items": [
      {
        "productId": 5,
        "productName": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "subtotal": 25.8
      }
    ],
    "payment": {
      "method": "PIX",
      "status": "PENDING",
      "amount": 31.22,
      "pixCode": "00020126DVANILLESIMULADO..."
    },
    "statusHistory": [
      {
        "status": "PENDING",
        "note": "Pedido criado.",
        "createdAt": "2026-10-09T12:00:00.000Z"
      }
    ],
    "canCancel": true,
    "allowedNextStatuses": [
      "CONFIRMED",
      "CANCELLED"
    ]
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado

#### `PATCH /api/admin/orders/:id/status`

Altera o status respeitando as transições válidas

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de request (body):**

```json
{
  "status": "CONFIRMED",
  "note": "Pagamento conferido"
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 10,
    "orderNumber": "DV-20261009-K3M7QA",
    "userId": 2,
    "deliveryType": "DELIVERY",
    "subtotal": 25.8,
    "discount": 2.58,
    "deliveryFee": 8,
    "total": 31.22,
    "paymentMethod": "PIX",
    "paymentStatus": "PENDING",
    "orderStatus": "CONFIRMED",
    "notes": "Sem açúcar, por favor.",
    "deliveryAddress": {
      "id": 1,
      "label": "Casa",
      "recipientName": "Maria Cliente",
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01001-000",
      "reference": "Próximo à praça",
      "isDefault": true
    },
    "items": [
      {
        "productId": 5,
        "productName": "Cappuccino Cremoso",
        "quantity": 2,
        "unitPrice": 12.9,
        "subtotal": 25.8
      }
    ],
    "payment": {
      "method": "PIX",
      "status": "PENDING",
      "amount": 31.22,
      "pixCode": "00020126DVANILLESIMULADO..."
    },
    "statusHistory": [
      {
        "status": "PENDING",
        "note": "Pedido criado.",
        "createdAt": "2026-10-09T12:00:00.000Z"
      }
    ],
    "canCancel": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

### Admin - Estoque

#### `GET /api/admin/stock`

Visualiza o estoque (lowStock=true&threshold=10 para estoque baixo)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)
  - `lowStock`: true para somente estoque baixo
  - `threshold`: Limite de estoque baixo (padrão 10)
  - `search`: Nome ou SKU

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 5,
      "name": "Cappuccino Cremoso",
      "sku": "CAF-002",
      "stock": 40,
      "isAvailable": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "meta": {
    "lowStockThreshold": 10
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão

#### `PATCH /api/admin/stock/:id`

Atualiza o estoque: "stock" (absoluto) OU "adjustment" (variação)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de request (body):**

```json
{
  "adjustment": 10
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 5,
    "categoryId": 1,
    "name": "Cappuccino Cremoso",
    "slug": "cappuccino-cremoso",
    "description": "Espresso, leite vaporizado e espuma cremosa.",
    "price": 14.9,
    "promotionalPrice": 12.9,
    "effectivePrice": 12.9,
    "isOnPromotion": true,
    "image": "/uploads/products/exemplo.jpg",
    "sku": "CAF-002",
    "stock": 40,
    "isAvailable": true,
    "inStock": true,
    "isFeatured": true,
    "preparationTime": 6,
    "calories": 120,
    "containsGluten": false,
    "containsLactose": true,
    "containsMilk": true,
    "isVegetarian": true,
    "isVegan": false,
    "dietary": {
      "glutenFree": true,
      "lactoseFree": false,
      "vegetarian": true,
      "vegan": false
    },
    "category": {
      "id": 1,
      "name": "Cafés",
      "slug": "cafes"
    }
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

### Admin - Promoções

#### `GET /api/admin/promotions`

Lista promoções

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "name": "Bem-vindo",
      "description": "10% na primeira compra",
      "code": "BEMVINDO10",
      "type": "PERCENTAGE",
      "value": 10,
      "startsAt": "2026-01-01T00:00:00.000Z",
      "endsAt": "2027-12-31T23:59:59.000Z",
      "usageLimit": 1000,
      "usedCount": 12,
      "perUserLimit": 1,
      "minOrderValue": 20,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão

#### `GET /api/admin/promotions/:id`

Detalha promoção

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "name": "Bem-vindo",
    "description": "10% na primeira compra",
    "code": "BEMVINDO10",
    "type": "PERCENTAGE",
    "value": 10,
    "startsAt": "2026-01-01T00:00:00.000Z",
    "endsAt": "2027-12-31T23:59:59.000Z",
    "usageLimit": 1000,
    "usedCount": 12,
    "perUserLimit": 1,
    "minOrderValue": 20,
    "isActive": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado

#### `POST /api/admin/promotions`

Cria promoção

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "name": "Semana do Café",
  "description": "R$ 5 de desconto",
  "code": "CAFE5",
  "type": "FIXED",
  "value": 5,
  "startsAt": "2026-10-01T00:00:00.000Z",
  "endsAt": "2026-12-31T23:59:59.000Z",
  "usageLimit": 200,
  "perUserLimit": 1,
  "minOrderValue": 25,
  "isActive": true
}
```

**Exemplo de response (201):**

```json
{
  "success": true,
  "message": "Recurso criado com sucesso.",
  "data": {
    "id": 1,
    "name": "Bem-vindo",
    "description": "10% na primeira compra",
    "code": "BEMVINDO10",
    "type": "PERCENTAGE",
    "value": 10,
    "startsAt": "2026-01-01T00:00:00.000Z",
    "endsAt": "2027-12-31T23:59:59.000Z",
    "usageLimit": 1000,
    "usedCount": 12,
    "perUserLimit": 1,
    "minOrderValue": 20,
    "isActive": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `PUT /api/admin/promotions/:id`

Edita promoção

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de request (body):**

```json
{
  "usageLimit": 500
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 1,
    "name": "Bem-vindo",
    "description": "10% na primeira compra",
    "code": "BEMVINDO10",
    "type": "PERCENTAGE",
    "value": 10,
    "startsAt": "2026-01-01T00:00:00.000Z",
    "endsAt": "2027-12-31T23:59:59.000Z",
    "usageLimit": 1000,
    "usedCount": 12,
    "perUserLimit": 1,
    "minOrderValue": 20,
    "isActive": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `409` Conflito · `422` Dados inválidos / regra de negócio

#### `DELETE /api/admin/promotions/:id`

Exclui/desativa promoção

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "deleted": false,
    "deactivated": true
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado

### Admin - Avaliações

#### `GET /api/admin/reviews`

Lista avaliações (filtros: productId, userId, rating)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Query string:**
  - `page`: Página (padrão 1)
  - `limit`: Itens por página (1-100, padrão 20)
  - `productId`: Id do produto
  - `rating`: 1 a 5

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Delicioso!"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão

#### `DELETE /api/admin/reviews/:id`

Remove uma avaliação (moderação)

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": null
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado

### Admin - Notificações

#### `POST /api/admin/notifications/broadcast`

Envia um aviso a todos os clientes ativos

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "title": "Promoção do dia",
  "message": "Cappuccino com 20% OFF hoje!",
  "type": "PROMOTION"
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "sent": 42
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `422` Dados inválidos / regra de negócio

### Admin - Fidelidade

#### `GET /api/admin/loyalty/rewards`

Lista todas as recompensas

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": [
    {
      "id": 1,
      "name": "Café grátis",
      "pointsCost": 100,
      "isActive": true
    }
  ]
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão

#### `POST /api/admin/loyalty/rewards`

Cria recompensa

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`

**Exemplo de request (body):**

```json
{
  "name": "Fatia de bolo grátis",
  "pointsCost": 150
}
```

**Exemplo de response (201):**

```json
{
  "success": true,
  "message": "Recurso criado com sucesso.",
  "data": {
    "id": 2,
    "name": "Fatia de bolo grátis",
    "pointsCost": 150
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `422` Dados inválidos / regra de negócio

#### `PUT /api/admin/loyalty/rewards/:id`

Edita recompensa

- **Autenticação:** JWT + role ADMIN
- **Header:** `Authorization: Bearer <token>`
- **Parâmetros de rota:** `id`

**Exemplo de request (body):**

```json
{
  "pointsCost": 120
}
```

**Exemplo de response (200):**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {
    "id": 2,
    "pointsCost": 120
  }
}
```

**Possíveis erros:** `401` Não autenticado · `403` Sem permissão · `404` Não encontrado · `422` Dados inválidos / regra de negócio

