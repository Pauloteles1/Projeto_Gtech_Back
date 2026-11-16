const { z } = require('zod')
const { pagination } = require('./common')

const option = z.object({
  title: z.string().trim().min(1),
  shape: z.enum(['square', 'circle']).default('square'),
  type: z.enum(['text', 'color']).default('text'),
  values: z.array(z.string().min(1)).min(1),
})

const product = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().trim().min(1, 'Informe o nome'),
  reference: z.string().trim().optional(),
  brand: z.string().trim().min(1),
  gender: z.enum(['Masculino', 'Feminino', 'Unisex']),
  state: z.enum(['Novo', 'Usado']).default('Novo'),
  description: z.string().trim().default(''),
  price: z.number().positive('O preço deve ser maior que zero'),
  priceDiscount: z.number().positive().nullable().optional(),
  stars: z.number().min(0).max(5).default(0),
  ratingCount: z.number().int().min(0).default(0),
  images: z.array(z.string().min(1)).default([]), // caminhos/URLs, na ordem de exibição
  options: z.array(option).default([]),
})

exports.createProduct = product.refine((p) => p.priceDiscount == null || p.priceDiscount < p.price, {
  message: 'priceDiscount deve ser menor que price',
  path: ['priceDiscount'],
})
exports.updateProduct = product.partial()

// Lista separada por vírgula ("1,2") -> array
const csv = z
  .string()
  .optional()
  .transform((v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined))

exports.listProducts = z.object({
  ...pagination,
  match: z.string().trim().optional(),
  categoryIds: csv.transform((v) => v?.map(Number).filter(Number.isInteger)),
  brand: csv,
  gender: csv,
  state: csv,
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'newest']).default('relevance'),
})
