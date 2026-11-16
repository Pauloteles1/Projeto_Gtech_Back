// Configuração do Sequelize (usada pela aplicação e pelo sequelize-cli)
require('dotenv').config()

const dialect = process.env.DB_DIALECT || 'sqlite'

const connection =
  dialect === 'sqlite'
    ? { dialect, storage: process.env.DB_STORAGE || './database.sqlite' }
    : {
        dialect,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
      }

const config = { ...connection, logging: false, define: { underscored: true } }

module.exports = { development: config, test: config, production: config }
