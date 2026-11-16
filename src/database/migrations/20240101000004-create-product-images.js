'use strict'

module.exports = {
  async up(q, S) {
    await q.createTable('product_images', {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      product_id: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      path: { type: S.STRING, allowNull: false },
      position: { type: S.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: S.DATE, allowNull: false },
      updated_at: { type: S.DATE, allowNull: false },
    })
    await q.addIndex('product_images', ['product_id'])
  },
  async down(q) {
    await q.dropTable('product_images')
  },
}
