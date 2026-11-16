const { port } = require('./config/env')
const app = require('./app')
const { sequelize } = require('./models')

sequelize
  .authenticate()
  .then(() => {
    app.listen(port, () => {
      console.log(`API rodando em http://localhost:${port}/api/v1`)
      console.log(`Documentação em http://localhost:${port}/api-docs`)
    })
  })
  .catch((err) => {
    console.error('Falha ao conectar ao banco de dados:', err.message)
    process.exit(1)
  })
