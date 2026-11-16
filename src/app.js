const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const swaggerUi = require('swagger-ui-express')
const { corsOrigin } = require('./config/env')
const swaggerSpec = require('./docs/swagger')
const routes = require('./routes')
const { notFound, errorHandler } = require('./middlewares/errorHandler')

const app = express()

// Documentação montada antes do helmet (o CSP padrão bloqueia os scripts do Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec))

app.use(helmet())
app.use(cors({ origin: corsOrigin }))
app.use(express.json({ limit: '1mb' }))

app.use('/api/v1', routes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
