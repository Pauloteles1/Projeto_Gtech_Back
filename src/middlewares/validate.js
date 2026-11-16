const AppError = require('../utils/AppError')

// Valida (e converte) body, params ou query com um schema zod
module.exports =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }))
      return next(new AppError('Dados inválidos', 400, details))
    }
    req[source] = result.data
    next()
  }
