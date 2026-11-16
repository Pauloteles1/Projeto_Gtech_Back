const { z } = require('zod')

exports.createCategory = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífen'),
  useInMenu: z.boolean().default(false),
})
exports.updateCategory = exports.createCategory.partial()
