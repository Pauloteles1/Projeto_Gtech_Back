// Colunas DECIMAL voltam como string em alguns bancos; os getters garantem número na API
const toNumber = (field) =>
  function getter() {
    const value = this.getDataValue(field)
    return value === null || value === undefined ? null : Number(value)
  }

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      name: { type: DataTypes.STRING(150), allowNull: false },
      reference: { type: DataTypes.STRING(50) },
      brand: { type: DataTypes.STRING(80), allowNull: false },
      gender: { type: DataTypes.STRING(20), allowNull: false },
      state: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'Novo' },
      description: { type: DataTypes.TEXT, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, get: toNumber('price') },
      priceDiscount: { type: DataTypes.DECIMAL(10, 2), get: toNumber('priceDiscount') },
      stars: { type: DataTypes.DECIMAL(2, 1), allowNull: false, defaultValue: 0, get: toNumber('stars') },
      ratingCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { tableName: 'products' }
  )

  Product.associate = ({ Category, ProductImage, ProductOption }) => {
    Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' })
    Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images', onDelete: 'CASCADE' })
    Product.hasMany(ProductOption, { foreignKey: 'productId', as: 'options', onDelete: 'CASCADE' })
  }

  return Product
}
