const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('orders', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  order_status: {
    type: DataTypes.ENUM('Processing', 'Shipped', 'Out for Delivery', 'Delivered'),
    allowNull: false,
    defaultValue: 'Processing'
  },
  payment_method: {
    type: DataTypes.ENUM('cod', 'razorpay'),
    allowNull: false,
    defaultValue: 'cod'
  },
  shipping_address: {
    type: DataTypes.JSON,
    allowNull: true
  },
  razorpay_order_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  razorpay_payment_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Order;