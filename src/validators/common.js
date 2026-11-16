const { z } = require('zod')

exports.idParam = z.object({ id: z.coerce.number().int().positive('id inválido') })

exports.pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
}
