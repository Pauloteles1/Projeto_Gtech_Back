# Digital Store - API (Back-end)

API REST em **Node.js + Express + Sequelize** para o projeto Digital Store, com autenticação JWT, CRUD completo, migrations, seeders e documentação Swagger.

## Requisitos

- Node.js 18+ e npm
- Nenhum banco instalado: o padrão é SQLite (arquivo local). MySQL/PostgreSQL são opcionais.

## Como rodar

```bash
npm install
cp .env.example .env     # ajuste JWT_SECRET e demais variáveis
npm run db:migrate       # cria as tabelas
npm run db:seed          # cria admin, categorias e produtos de exemplo
npm run dev              # http://localhost:3001  (ou: npm start)
```

- API: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api-docs`
- Admin de exemplo: `admin@digitalstore.com` / `Admin@123` (altere em `.env` antes do seed)
- Recomeçar o banco do zero: `npm run db:reset`

### Usar MySQL ou PostgreSQL

Instale o driver (`npm i mysql2` ou `npm i pg pg-hstore`) e configure `DB_DIALECT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASS` no `.env`.

## Arquitetura (MVC)

```
src/
  config/        variáveis de ambiente e conexão com o banco
  models/        Models (Sequelize) e associações
  controllers/   regras de cada endpoint
  routes/        mapeamento URL -> middlewares -> controller
  middlewares/   autenticação/autorização, validação (zod), tratamento de erros
  validators/    schemas de entrada (zod)
  database/      migrations e seeders
  docs/          especificação OpenAPI
  utils/         AppError, asyncHandler, JWT
```

## Modelagem

```
categories 1 ──< products 1 ──< product_images
                     └──────< product_options
users (independente; role: admin | customer)
```

- `products.category_id` usa `ON DELETE RESTRICT` (não apaga categoria com produtos); imagens e opções saem em cascata.
- Índices em `products(category_id)`, `products(brand)` e `products(price)`; imagens e opções são carregadas em consulta separada para evitar JOINs que multiplicam linhas.
- Senhas são salvas com hash (bcrypt) e nunca retornam nas respostas.

## Endpoints (`/api/v1`)

| Método | Rota | Acesso |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | Público |
| GET | `/auth/me` | Autenticado |
| GET / POST | `/users` | Admin |
| GET / PUT / DELETE | `/users/:id` | Admin ou o próprio usuário |
| GET | `/categories`, `/categories/:id` | Público |
| POST / PUT / DELETE | `/categories`, `/categories/:id` | Admin |
| GET | `/products`, `/products/:id` | Público |
| POST / PUT / DELETE | `/products`, `/products/:id` | Admin |

Listagem de produtos: `GET /products?match=tenis&categoryIds=5&brand=Nike,Puma&gender=Unisex&state=Novo&priceMin=100&priceMax=400&sort=price_asc&page=1&limit=12`

Resposta paginada: `{ "data": [...], "meta": { "total", "page", "limit", "pages" } }`

## Autenticação

Envie `Authorization: Bearer <token>` nas rotas protegidas (o token vem de `/auth/login`). Cadastros públicos sempre criam o perfil `customer`; só um admin cria ou promove outro admin.

## Erros

Formato padrão: `{ "status": "error", "message": "...", "errors": [{ "field": "...", "message": "..." }] }`

| Código | Quando |
|---|---|
| 400 | Dados inválidos / JSON malformado |
| 401 | Sem token, token inválido ou credenciais erradas |
| 403 | Sem permissão para a ação |
| 404 | Registro ou rota inexistente |
| 409 | Valor duplicado (e-mail, slug) ou registro em uso |
| 500 | Erro interno (detalhes só no log do servidor) |

## Integração com o front-end

Defina `CORS_ORIGIN` com a URL do front (padrão `http://localhost:5173`). Nos produtos, `images` retorna objetos `{ id, path, position }` e `options` retorna `{ title, shape, type, values }`.
