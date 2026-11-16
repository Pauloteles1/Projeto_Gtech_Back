const bcrypt = require('bcryptjs')
const { User } = require('../models')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { signToken } = require('../utils/token')

// POST /auth/register - cadastro público (sempre cria um cliente)
exports.register = asyncHandler(async (req, res) => {
  const user = await User.create({ ...req.body, role: 'customer' })
  res.status(201).json({ user, token: signToken(user) })
})

// POST /auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.scope('withPassword').findOne({ where: { email } })
  // Mesma mensagem para e-mail ou senha incorretos (não revela se o e-mail existe)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('E-mail ou senha inválidos', 401)
  }
  res.json({ user, token: signToken(user) })
})

// GET /auth/me - dados do usuário autenticado
exports.me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id)
  if (!user) throw new AppError('Usuário não encontrado', 401)
  res.json(user)
})
