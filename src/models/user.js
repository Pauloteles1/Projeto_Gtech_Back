const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      firstname: { type: DataTypes.STRING(100), allowNull: false },
      surname: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
      password: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'customer' },
    },
    {
      tableName: 'users',
      // A senha nunca é carregada por padrão; use User.scope('withPassword') no login
      defaultScope: { attributes: { exclude: ['password'] } },
      scopes: { withPassword: {} },
      hooks: {
        // Gera o hash sempre que a senha for criada ou alterada
        beforeSave: async (user) => {
          if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10)
        },
      },
    }
  )

  // Garante que o hash nunca apareça em respostas JSON
  User.prototype.toJSON = function toJSON() {
    const values = { ...this.get() }
    delete values.password
    return values
  }

  return User
}
