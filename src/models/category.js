module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      name: { type: DataTypes.STRING(100), allowNull: false },
      slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      useInMenu: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    { tableName: 'categories' }
  )

  Category.associate = ({ Product }) => {
    Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' })
  }

  return Category
}
