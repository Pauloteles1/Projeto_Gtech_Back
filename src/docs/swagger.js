// Especificação OpenAPI 3.0 da API (exibida em /api-docs)
const ref = (name) => ({ $ref: `#/components/schemas/${name}` })
const json = (schema) => ({ 'application/json': { schema } })
const security = [{ bearerAuth: [] }]
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
const list = (name) => ({ type: 'object', properties: { data: { type: 'array', items: ref(name) }, meta: ref('Meta') } })

const messages = {
  400: 'Dados inválidos',
  401: 'Não autenticado ou token inválido',
  403: 'Sem permissão',
  404: 'Registro não encontrado',
  409: 'Conflito (valor duplicado ou registro em uso)',
}

// Monta uma operação: parâmetros, corpo, autenticação e respostas de erro
const op = (tag, summary, { params = [], body, ok = 200, resp, secure = false, errors = [] } = {}) => ({
  tags: [tag],
  summary,
  ...(secure && { security }),
  ...(params.length && { parameters: params }),
  ...(body && { requestBody: { required: true, content: json(ref(body)) } }),
  responses: {
    [ok]: ok === 204 ? { description: 'Sem conteúdo' } : { description: 'Sucesso', content: json(resp) },
    ...Object.fromEntries(errors.map((c) => [c, { description: messages[c], content: json(ref('Error')) }])),
  },
})

const productFilters = [
  ['page', 'integer', 'Página (padrão 1)'],
  ['limit', 'integer', 'Itens por página (padrão 12, máx. 100)'],
  ['match', 'string', 'Busca no nome e na descrição'],
  ['categoryIds', 'string', 'IDs de categoria separados por vírgula, ex.: 1,5'],
  ['brand', 'string', 'Marcas separadas por vírgula'],
  ['gender', 'string', 'Masculino, Feminino ou Unisex (separados por vírgula)'],
  ['state', 'string', 'Novo ou Usado (separados por vírgula)'],
  ['priceMin', 'number', 'Preço mínimo (considera o preço promocional)'],
  ['priceMax', 'number', 'Preço máximo (considera o preço promocional)'],
].map(([name, type, description]) => ({ name, in: 'query', description, schema: { type } }))
productFilters.push({
  name: 'sort',
  in: 'query',
  description: 'Ordenação',
  schema: { type: 'string', enum: ['relevance', 'newest', 'price_asc', 'price_desc'] },
})

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Digital Store API',
    version: '1.0.0',
    description:
      'API REST da Digital Store. Para rotas protegidas, faça login em `POST /auth/login` e clique em **Authorize** informando o token JWT. O seeder cria o admin `admin@digitalstore.com` / `Admin@123`.',
  },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Auth' }, { name: 'Users' }, { name: 'Categories' }, { name: 'Products' }],
  paths: {
    '/health': { get: op('Auth', 'Verifica se a API está no ar', { resp: { type: 'object', properties: { status: { type: 'string' } } } }) },
    '/auth/register': { post: op('Auth', 'Cadastra um cliente', { body: 'RegisterInput', ok: 201, resp: ref('AuthResponse'), errors: [400, 409] }) },
    '/auth/login': { post: op('Auth', 'Autentica e retorna o token JWT', { body: 'LoginInput', resp: ref('AuthResponse'), errors: [400, 401] }) },
    '/auth/me': { get: op('Auth', 'Dados do usuário autenticado', { secure: true, resp: ref('User'), errors: [401] }) },
    '/users': {
      get: op('Users', 'Lista usuários (admin)', {
        secure: true,
        params: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }],
        resp: list('User'),
        errors: [401, 403],
      }),
      post: op('Users', 'Cria usuário com perfil definido (admin)', { secure: true, body: 'UserInput', ok: 201, resp: ref('User'), errors: [400, 401, 403, 409] }),
    },
    '/users/{id}': {
      get: op('Users', 'Busca usuário (admin ou o próprio)', { secure: true, params: [idParam], resp: ref('User'), errors: [401, 403, 404] }),
      put: op('Users', 'Atualiza usuário (admin ou o próprio; só admin altera role)', { secure: true, params: [idParam], body: 'UserUpdate', resp: ref('User'), errors: [400, 401, 403, 404, 409] }),
      delete: op('Users', 'Remove usuário (admin ou o próprio)', { secure: true, params: [idParam], ok: 204, errors: [401, 403, 404] }),
    },
    '/categories': {
      get: op('Categories', 'Lista categorias', { resp: { type: 'object', properties: { data: { type: 'array', items: ref('Category') } } } }),
      post: op('Categories', 'Cria categoria (admin)', { secure: true, body: 'CategoryInput', ok: 201, resp: ref('Category'), errors: [400, 401, 403, 409] }),
    },
    '/categories/{id}': {
      get: op('Categories', 'Busca categoria', { params: [idParam], resp: ref('Category'), errors: [404] }),
      put: op('Categories', 'Atualiza categoria (admin)', { secure: true, params: [idParam], body: 'CategoryInput', resp: ref('Category'), errors: [400, 401, 403, 404, 409] }),
      delete: op('Categories', 'Remove categoria sem produtos (admin)', { secure: true, params: [idParam], ok: 204, errors: [401, 403, 404, 409] }),
    },
    '/products': {
      get: op('Products', 'Lista produtos com filtros, ordenação e paginação', { params: productFilters, resp: list('Product'), errors: [400] }),
      post: op('Products', 'Cria produto com imagens e opções (admin)', { secure: true, body: 'ProductInput', ok: 201, resp: ref('Product'), errors: [400, 401, 403] }),
    },
    '/products/{id}': {
      get: op('Products', 'Detalhes do produto (imagens, opções e categoria)', { params: [idParam], resp: ref('Product'), errors: [404] }),
      put: op('Products', 'Atualiza produto (admin); images/options enviados substituem os atuais', { secure: true, params: [idParam], body: 'ProductInput', resp: ref('Product'), errors: [400, 401, 403, 404] }),
      delete: op('Products', 'Remove produto (admin)', { secure: true, params: [idParam], ok: 204, errors: [401, 403, 404] }),
    },
  },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } },
        },
      },
      Meta: { type: 'object', properties: { total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' }, pages: { type: 'integer' } } },
      RegisterInput: {
        type: 'object',
        required: ['firstname', 'surname', 'email', 'password'],
        properties: { firstname: { type: 'string' }, surname: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 } },
      },
      LoginInput: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', example: 'admin@digitalstore.com' }, password: { type: 'string', example: 'Admin@123' } } },
      UserInput: {
        allOf: [ref('RegisterInput'), { type: 'object', properties: { role: { type: 'string', enum: ['admin', 'customer'] } } }],
      },
      UserUpdate: { type: 'object', properties: { firstname: { type: 'string' }, surname: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, role: { type: 'string', enum: ['admin', 'customer'] } } },
      User: {
        type: 'object',
        properties: { id: { type: 'integer' }, firstname: { type: 'string' }, surname: { type: 'string' }, email: { type: 'string' }, role: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' } },
      },
      AuthResponse: { type: 'object', properties: { user: ref('User'), token: { type: 'string' } } },
      CategoryInput: {
        type: 'object',
        required: ['name', 'slug'],
        properties: { name: { type: 'string', example: 'Tênis' }, slug: { type: 'string', example: 'tenis' }, useInMenu: { type: 'boolean' } },
      },
      Category: { allOf: [ref('CategoryInput'), { type: 'object', properties: { id: { type: 'integer' } } }] },
      ProductOption: {
        type: 'object',
        required: ['title', 'values'],
        properties: {
          title: { type: 'string', example: 'Tamanho' },
          shape: { type: 'string', enum: ['square', 'circle'] },
          type: { type: 'string', enum: ['text', 'color'] },
          values: { type: 'array', items: { type: 'string' }, example: ['39', '40', '41'] },
        },
      },
      ProductInput: {
        type: 'object',
        required: ['categoryId', 'name', 'brand', 'gender', 'price'],
        properties: {
          categoryId: { type: 'integer' },
          name: { type: 'string' },
          reference: { type: 'string' },
          brand: { type: 'string' },
          gender: { type: 'string', enum: ['Masculino', 'Feminino', 'Unisex'] },
          state: { type: 'string', enum: ['Novo', 'Usado'] },
          description: { type: 'string' },
          price: { type: 'number', example: 200 },
          priceDiscount: { type: 'number', nullable: true, example: 149.9 },
          stars: { type: 'number' },
          ratingCount: { type: 'integer' },
          images: { type: 'array', items: { type: 'string' }, example: ['/produc-image-1.jpeg'] },
          options: { type: 'array', items: ref('ProductOption') },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          reference: { type: 'string' },
          brand: { type: 'string' },
          gender: { type: 'string' },
          state: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          priceDiscount: { type: 'number', nullable: true },
          stars: { type: 'number' },
          ratingCount: { type: 'integer' },
          category: ref('Category'),
          images: { type: 'array', items: { type: 'object', properties: { id: { type: 'integer' }, path: { type: 'string' }, position: { type: 'integer' } } } },
          options: { type: 'array', items: ref('ProductOption') },
        },
      },
    },
  },
}
