module.exports = (sequelize, DataTypes) => {
  const ProductOption = sequelize.define(
    'ProductOption',
    {
      title: { type: DataTypes.STRING(50), allowNull: false },
      shape: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'square' },
      type: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'text' },
      values: { type: DataTypes.JSON, allowNull: false },
    },
    { tableName: 'product_options' }
  )

  ProductOption.associate = ({ Product }) => {
    ProductOption.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
  }

  return ProductOption
}
