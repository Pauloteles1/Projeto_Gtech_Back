'use strict'

module.exports = {
  async up(q, S) {
    await q.createTable('categories', {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: S.STRING(100), allowNull: false },
      slug: { type: S.STRING(100), allowNull: false, unique: true },
      use_in_menu: { type: S.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: S.DATE, allowNull: false },
      updated_at: { type: S.DATE, allowNull: false },
    })
  },
  async down(q) {
    await q.dropTable('categories')
  },
}
