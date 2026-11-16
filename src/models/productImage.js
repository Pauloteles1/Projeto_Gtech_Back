module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define(
    'ProductImage',
    {
      path: { type: DataTypes.STRING, allowNull: false },
      position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { tableName: 'product_images' }
  )

  ProductImage.associate = ({ Product }) => {
    ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
  }

  return ProductImage
}
