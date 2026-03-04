#!/usr/bin/env node

/**
 * Utility script to update order status for testing
 * Usage: node scripts/updateOrderStatus.js <orderId> <status>
 * 
 * Example:
 * node scripts/updateOrderStatus.js 1 Shipped
 * node scripts/updateOrderStatus.js 1 "Out for Delivery"
 * node scripts/updateOrderStatus.js 1 Delivered
 */

require('dotenv').config();
const { Order, User, Notification } = require('../models');

const updateOrderStatus = async () => {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node scripts/updateOrderStatus.js <orderId> <status>');
    console.error('Valid statuses: Processing, Shipped, "Out for Delivery", Delivered');
    process.exit(1);
  }

  const orderId = parseInt(args[0]);
  const newStatus = args.slice(1).join(' ');
  const validStatuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  if (!validStatuses.includes(newStatus)) {
    console.error(`Invalid status: ${newStatus}`);
    console.error(`Valid statuses: ${validStatuses.join(', ')}`);
    process.exit(1);
  }

  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      console.error(`Order #${orderId} not found`);
      process.exit(1);
    }

    const oldStatus = order.order_status;
    order.order_status = newStatus;
    await order.save();

    // Create notification
    const user = await User.findByPk(order.user_id);
    if (user) {
      let message = '';
      switch (newStatus) {
        case 'Shipped':
          message = `Your order #${orderId} has been shipped! 🚚`;
          break;
        case 'Out for Delivery':
          message = `Your order #${orderId} is out for delivery! 📍`;
          break;
        case 'Delivered':
          message = `Your order #${orderId} has been delivered! ✅`;
          break;
        default:
          message = `Your order #${orderId} status updated to ${newStatus}`;
      }

      await Notification.create({
        user_id: user.id,
        message,
        type: `order_${newStatus.toLowerCase().replace(/\s+/g, '_')}`
      });
    }

    console.log(`✓ Order #${orderId} status updated: ${oldStatus} → ${newStatus}`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating order status:', error.message);
    process.exit(1);
  }
};

updateOrderStatus();
