'use strict'

module.exports = {
  async up(q, S) {
    await q.createTable('products', {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      category_id: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // não permite apagar categoria que ainda tem produtos
      },
      name: { type: S.STRING(150), allowNull: false },
      reference: { type: S.STRING(50) },
      brand: { type: S.STRING(80), allowNull: false },
      gender: { type: S.STRING(20), allowNull: false },
      state: { type: S.STRING(20), allowNull: false, defaultValue: 'Novo' },
      description: { type: S.TEXT, allowNull: false },
      price: { type: S.DECIMAL(10, 2), allowNull: false },
      price_discount: { type: S.DECIMAL(10, 2) },
      stars: { type: S.DECIMAL(2, 1), allowNull: false, defaultValue: 0 },
      rating_count: { type: S.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: S.DATE, allowNull: false },
      updated_at: { type: S.DATE, allowNull: false },
    })
    // Índices para as colunas usadas nos filtros da listagem
    await q.addIndex('products', ['category_id'])
    await q.addIndex('products', ['brand'])
    await q.addIndex('products', ['price'])
  },
  async down(q) {
    await q.dropTable('products')
  },
}
