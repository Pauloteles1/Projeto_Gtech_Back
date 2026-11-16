const { UniqueConstraintError, ForeignKeyConstraintError, ValidationError } = require('sequelize')
const AppError = require('../utils/AppError')

// 404 para rotas inexistentes
exports.notFound = (req, res, next) =>
  next(new AppError(`Rota ${req.method} ${req.originalUrl} não encontrada`, 404))

// Converte qualquer erro em uma resposta JSON padronizada: { status, message, errors? }
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500
  let message = err.message
  let errors = err.details

  if (err instanceof UniqueConstraintError) {
    status = 409
    message = 'Já existe um registro com esse valor'
    errors = err.errors.map((e) => ({ field: e.path, message: 'Valor já cadastrado' }))
  } else if (err instanceof ValidationError) {
    status = 400
    message = 'Dados inválidos'
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }))
  } else if (err instanceof ForeignKeyConstraintError) {
    status = 409
    message = 'Operação não permitida: o registro está em uso ou a referência não existe'
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401
    message = 'Token inválido ou expirado'
  } else if (err.type === 'entity.parse.failed') {
    status = 400
    message = 'JSON malformado'
  }

  if (status >= 500) {
    console.error(err)
    message = 'Erro interno do servidor'
  }

  res.status(status).json({ status: 'error', message, ...(errors && { errors }) })
}
