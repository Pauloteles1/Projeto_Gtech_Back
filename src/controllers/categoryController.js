const { Category } = require('../models')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const findOrFail = async (id) => {
  const category = await Category.findByPk(id)
  if (!category) throw new AppError('Categoria não encontrada', 404)
  return category
}

// GET /categories
exports.list = asyncHandler(async (req, res) => {
  res.json({ data: await Category.findAll({ order: [['name', 'ASC']] }) })
})

// GET /categories/:id
exports.getById = asyncHandler(async (req, res) => res.json(await findOrFail(req.params.id)))

// POST /categories (admin)
exports.create = asyncHandler(async (req, res) => res.status(201).json(await Category.create(req.body)))

// PUT /categories/:id (admin)
exports.update = asyncHandler(async (req, res) => {
  const category = await findOrFail(req.params.id)
  await category.update(req.body)
  res.json(category)
})

// DELETE /categories/:id (admin) - 409 se ainda houver produtos (FK RESTRICT)
exports.remove = asyncHandler(async (req, res) => {
  const category = await findOrFail(req.params.id)
  await category.destroy()
  res.status(204).send()
})
