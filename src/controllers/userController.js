const { User } = require('../models')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const isAdmin = (req) => req.user.role === 'admin'

// Admin acessa qualquer usuário; os demais, apenas o próprio
const assertAccess = (req, id) => {
  if (!isAdmin(req) && req.user.id !== id) throw new AppError('Você não tem permissão para esta ação', 403)
}

const findOrFail = async (id) => {
  const user = await User.findByPk(id)
  if (!user) throw new AppError('Usuário não encontrado', 404)
  return user
}

// GET /users (admin) - paginado
exports.list = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const { rows, count } = await User.findAndCountAll({ limit, offset: (page - 1) * limit, order: [['id', 'ASC']] })
  res.json({ data: rows, meta: { total: count, page, limit, pages: Math.ceil(count / limit) } })
})

// GET /users/:id
exports.getById = asyncHandler(async (req, res) => {
  assertAccess(req, req.params.id)
  res.json(await findOrFail(req.params.id))
})

// POST /users (admin) - permite definir o perfil
exports.create = asyncHandler(async (req, res) => {
  res.status(201).json(await User.create(req.body))
})

// PUT /users/:id - só admin altera o perfil (role)
exports.update = asyncHandler(async (req, res) => {
  assertAccess(req, req.params.id)
  if (req.body.role && !isAdmin(req)) throw new AppError('Apenas administradores podem alterar o perfil', 403)
  const user = await findOrFail(req.params.id)
  await user.update(req.body)
  res.json(user)
})

// DELETE /users/:id
exports.remove = asyncHandler(async (req, res) => {
  assertAccess(req, req.params.id)
  const user = await findOrFail(req.params.id)
  await user.destroy()
  res.status(204).send()
})
