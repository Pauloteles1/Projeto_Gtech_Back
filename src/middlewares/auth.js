const AppError = require('../utils/AppError')
const { verifyToken } = require('../utils/token')

// Exige um token JWT válido no header "Authorization: Bearer <token>"
exports.authenticate = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ')
  if (scheme !== 'Bearer' || !token) return next(new AppError('Token de acesso não informado', 401))

  const payload = verifyToken(token) // erros de JWT são tratados no errorHandler (401)
  req.user = { id: Number(payload.sub), role: payload.role }
  next()
}

// Restringe a rota aos perfis informados (ex.: authorize('admin'))
exports.authorize =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role) ? next() : next(new AppError('Você não tem permissão para esta ação', 403))
