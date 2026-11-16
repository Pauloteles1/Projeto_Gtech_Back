'use strict'
const bcrypt = require('bcryptjs')

const now = () => new Date()

module.exports = {
  async up(q) {
    await q.bulkInsert('users', [
      {
        id: 1,
        firstname: 'Admin',
        surname: 'Digital Store',
        email: process.env.ADMIN_EMAIL || 'admin@digitalstore.com',
        password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@123', 10),
        role: 'admin',
        created_at: now(),
        updated_at: now(),
      },
    ])
    const names = [['Camisetas', 'camisetas'], ['Calças', 'calcas'], ['Bonés', 'bones'], ['Headphones', 'headphones'], ['Tênis', 'tenis']]
    await q.bulkInsert(
      'categories',
      names.map(([name, slug], i) => ({ id: i + 1, name, slug, use_in_menu: true, created_at: now(), updated_at: now() }))
    )
  },
  async down(q) {
    await q.bulkDelete('categories', null, {})
    await q.bulkDelete('users', null, {})
  },
}
