const router = require('express').Router()
const { authenticate, authorize } = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const { idParam } = require('../validators/common')
const userSchemas = require('../validators/user')
const categorySchemas = require('../validators/category')
const productSchemas = require('../validators/product')
const auth = require('../controllers/authController')
const users = require('../controllers/userController')
const categories = require('../controllers/categoryController')
const products = require('../controllers/productController')

const admin = [authenticate, authorize('admin')]
const id = validate(idParam, 'params')

router.get('/health', (req, res) => res.json({ status: 'ok' }))

// Autenticação
router.post('/auth/register', validate(userSchemas.register), auth.register)
router.post('/auth/login', validate(userSchemas.login), auth.login)
router.get('/auth/me', authenticate, auth.me)

// Usuários
router.get('/users', ...admin, validate(userSchemas.listUsers, 'query'), users.list)
router.post('/users', ...admin, validate(userSchemas.createUser), users.create)
router.get('/users/:id', authenticate, id, users.getById)
router.put('/users/:id', authenticate, id, validate(userSchemas.updateUser), users.update)
router.delete('/users/:id', authenticate, id, users.remove)

// Categorias (leitura pública, escrita apenas admin)
router.get('/categories', categories.list)
router.get('/categories/:id', id, categories.getById)
router.post('/categories', ...admin, validate(categorySchemas.createCategory), categories.create)
router.put('/categories/:id', ...admin, id, validate(categorySchemas.updateCategory), categories.update)
router.delete('/categories/:id', ...admin, id, categories.remove)

// Produtos (leitura pública, escrita apenas admin)
router.get('/products', validate(productSchemas.listProducts, 'query'), products.list)
router.get('/products/:id', id, products.getById)
router.post('/products', ...admin, validate(productSchemas.createProduct), products.create)
router.put('/products/:id', ...admin, id, validate(productSchemas.updateProduct), products.update)
router.delete('/products/:id', ...admin, id, products.remove)

module.exports = router
