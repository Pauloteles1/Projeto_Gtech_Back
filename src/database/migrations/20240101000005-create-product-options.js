'use strict'

module.exports = {
  async up(q, S) {
    await q.createTable('product_options', {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      product_id: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: { type: S.STRING(50), allowNull: false },
      shape: { type: S.STRING(20), allowNull: false, defaultValue: 'square' },
      type: { type: S.STRING(20), allowNull: false, defaultValue: 'text' },
      values: { type: S.JSON, allowNull: false },
      created_at: { type: S.DATE, allowNull: false },
      updated_at: { type: S.DATE, allowNull: false },
    })
    await q.addIndex('product_options', ['product_id'])
  },
  async down(q) {
    await q.dropTable('product_options')
  },
}
