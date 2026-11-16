const { Op, fn, col, literal, where: sqlWhere } = require('sequelize')
const { sequelize, Product, Category, ProductImage, ProductOption } = require('../models')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

// Imagens e opções usam separate:true (consulta própria) para evitar JOINs que multiplicam linhas
const imagesInclude = { model: ProductImage, as: 'images', attributes: ['id', 'path', 'position'], separate: true, order: [['position', 'ASC']] }
const categoryInclude = { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
const optionsInclude = { model: ProductOption, as: 'options', attributes: ['id', 'title', 'shape', 'type', 'values'], separate: true }

// Preço efetivo: o promocional, quando existir
const effectivePrice = fn('COALESCE', col('Product.price_discount'), col('Product.price'))

const findFull = (id) => Product.findByPk(id, { include: [categoryInclude, imagesInclude, optionsInclude] })

const findOrFail = async (id) => {
  const product = await findFull(id)
  if (!product) throw new AppError('Produto não encontrado', 404)
  return product
}

const assertCategory = async (categoryId) => {
  if (categoryId !== undefined && !(await Category.findByPk(categoryId))) {
    throw new AppError('Categoria informada não existe', 400)
  }
}

const sortOrders = {
  relevance: [['id', 'ASC']],
  newest: [['createdAt', 'DESC']],
  price_asc: [[effectivePrice, 'ASC']],
  price_desc: [[effectivePrice, 'DESC']],
}

// GET /products - filtros, busca, ordenação e paginação
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, match, categoryIds, brand, gender, state, priceMin, priceMax, sort } = req.query

  const filters = {}
  if (match) filters[Op.or] = [{ name: { [Op.like]: `%${match}%` } }, { description: { [Op.like]: `%${match}%` } }]
  if (categoryIds?.length) filters.categoryId = { [Op.in]: categoryIds }
  if (brand) filters.brand = { [Op.in]: brand }
  if (gender) filters.gender = { [Op.in]: gender }
  if (state) filters.state = { [Op.in]: state }

  const priceFilters = []
  if (priceMin !== undefined) priceFilters.push(sqlWhere(effectivePrice, { [Op.gte]: priceMin }))
  if (priceMax !== undefined) priceFilters.push(sqlWhere(effectivePrice, { [Op.lte]: priceMax }))
  if (priceFilters.length) filters[Op.and] = priceFilters

  const { rows, count } = await Product.findAndCountAll({
    where: filters,
    include: [categoryInclude, imagesInclude],
    order: sortOrders[sort],
    limit,
    offset: (page - 1) * limit,
  })

  res.json({ data: rows, meta: { total: count, page, limit, pages: Math.ceil(count / limit) } })
})

// GET /products/:id
exports.getById = asyncHandler(async (req, res) => res.json(await findOrFail(req.params.id)))

// POST /products (admin) - cria produto, imagens e opções na mesma transação
exports.create = asyncHandler(async (req, res) => {
  const { images, options, ...data } = req.body
  await assertCategory(data.categoryId)

  const id = await sequelize.transaction(async (transaction) => {
    const product = await Product.create(data, { transaction })
    await ProductImage.bulkCreate(images.map((path, position) => ({ productId: product.id, path, position })), { transaction })
    await ProductOption.bulkCreate(options.map((o) => ({ ...o, productId: product.id })), { transaction })
    return product.id
  })

  res.status(201).json(await findFull(id))
})

// PUT /products/:id (admin) - atualiza os campos enviados; images/options, se enviados, substituem os atuais
exports.update = asyncHandler(async (req, res) => {
  const { images, options, ...data } = req.body
  const product = await findOrFail(req.params.id)
  await assertCategory(data.categoryId)

  const price = data.price ?? product.price
  const discount = data.priceDiscount === undefined ? product.priceDiscount : data.priceDiscount
  if (discount != null && discount >= price) throw new AppError('priceDiscount deve ser menor que price', 400)

  await sequelize.transaction(async (transaction) => {
    await product.update(data, { transaction })
    if (images) {
      await ProductImage.destroy({ where: { productId: product.id }, transaction })
      await ProductImage.bulkCreate(images.map((path, position) => ({ productId: product.id, path, position })), { transaction })
    }
    if (options) {
      await ProductOption.destroy({ where: { productId: product.id }, transaction })
      await ProductOption.bulkCreate(options.map((o) => ({ ...o, productId: product.id })), { transaction })
    }
  })

  res.json(await findFull(product.id))
})

// DELETE /products/:id (admin) - imagens e opções saem em cascata
exports.remove = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id)
  if (!product) throw new AppError('Produto não encontrado', 404)
  await product.destroy()
  res.status(204).send()
})
