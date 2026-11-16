// Inicializa o Sequelize, carrega os models e registra as associações
const { Sequelize, DataTypes } = require('sequelize')
const config = require('../config/database')[process.env.NODE_ENV || 'development']

const sequelize = new Sequelize(config)
const db = { sequelize, Sequelize }

for (const file of ['user', 'category', 'product', 'productImage', 'productOption']) {
  const model = require(`./${file}`)(sequelize, DataTypes)
  db[model.name] = model
}

Object.values(db).forEach((model) => model.associate?.(db))

module.exports = db
