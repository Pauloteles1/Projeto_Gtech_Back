'use strict'

module.exports = {
  async up(q, S) {
    await q.createTable('users', {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      firstname: { type: S.STRING(100), allowNull: false },
      surname: { type: S.STRING(100), allowNull: false },
      email: { type: S.STRING(150), allowNull: false, unique: true },
      password: { type: S.STRING, allowNull: false },
      role: { type: S.STRING(20), allowNull: false, defaultValue: 'customer' },
      created_at: { type: S.DATE, allowNull: false },
      updated_at: { type: S.DATE, allowNull: false },
    })
  },
  async down(q) {
    await q.dropTable('users')
  },
}
