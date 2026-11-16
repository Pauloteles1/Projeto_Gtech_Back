'use strict'

const now = () => new Date()
const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

// [nome, marca, categoryId, gênero, estado, preço, preço promocional]
const items = [
  ['K-Swiss V8 - Masculino', 'Adidas', 5, 'Masculino', 'Novo', 200, 149.9],
  ['Nike Air Zoom - Feminino', 'Nike', 5, 'Feminino', 'Novo', 349.9, null],
  ['Puma Suede Classic', 'Puma', 5, 'Unisex', 'Usado', 289.9, 239.9],
  ['Camiseta Esportiva Dry', 'Adidas', 1, 'Masculino', 'Novo', 79.9, null],
  ['Calça Jogger Moletom', 'Nike', 2, 'Feminino', 'Novo', 189.9, 159.9],
  ['Boné Aba Curva', 'Puma', 3, 'Unisex', 'Novo', 59.9, null],
  ['Headphone Bluetooth', 'Gucci', 4, 'Unisex', 'Novo', 399.9, 349.9],
  ['Tênis Runner Pro', 'Nike', 5, 'Masculino', 'Usado', 450, 379.9],
]

module.exports = {
  async up(q) {
    const timestamps = () => ({ created_at: now(), updated_at: now() })
    const images = []
    const options = []

    await q.bulkInsert(
      'products',
      items.map(([name, brand, categoryId, gender, state, price, discount], i) => ({
        id: i + 1,
        category_id: categoryId,
        name,
        reference: `REF-${String(i + 1).padStart(5, '0')}`,
        brand,
        gender,
        state,
        description: DESCRIPTION,
        price,
        price_discount: discount,
        stars: 4.5,
        rating_count: 90 + i * 7,
        ...timestamps(),
      }))
    )

    items.forEach((_, i) => {
      const productId = i + 1
      for (let n = 1; n <= 5; n += 1) {
        images.push({ product_id: productId, path: `/produc-image-${n}.jpeg`, position: n - 1, ...timestamps() })
      }
      options.push(
        { product_id: productId, title: 'Tamanho', shape: 'square', type: 'text', values: JSON.stringify(['39', '40', '41', '42', '43']), ...timestamps() },
        { product_id: productId, title: 'Cor', shape: 'circle', type: 'color', values: JSON.stringify(['#6FEEFF', '#FF6969', '#5E5E5E', '#6D70B7']), ...timestamps() }
      )
    })

    await q.bulkInsert('product_images', images)
    await q.bulkInsert('product_options', options)
  },
  async down(q) {
    await q.bulkDelete('product_options', null, {})
    await q.bulkDelete('product_images', null, {})
    await q.bulkDelete('products', null, {})
  },
}
