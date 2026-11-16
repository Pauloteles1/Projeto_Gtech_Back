const { z } = require('zod')
const { pagination } = require('./common')

const password = z.string().min(8, 'A senha deve ter ao menos 8 caracteres')
const email = z.string().trim().toLowerCase().email('E-mail inválido')

exports.register = z.object({
  firstname: z.string().trim().min(1, 'Informe o nome'),
  surname: z.string().trim().min(1, 'Informe o sobrenome'),
  email,
  password,
})

exports.login = z.object({ email, password: z.string().min(1, 'Informe a senha') })

exports.createUser = exports.register.extend({ role: z.enum(['admin', 'customer']).default('customer') })
exports.updateUser = exports.createUser.partial()
exports.listUsers = z.object(pagination)
