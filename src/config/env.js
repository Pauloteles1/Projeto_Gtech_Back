// Carrega as variáveis de ambiente e centraliza as configurações da aplicação
require('dotenv').config()

const isProd = process.env.NODE_ENV === 'production'

if (isProd && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET é obrigatório em produção')
}

module.exports = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-nao-use-em-producao',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
}
