const { validationResult } = require('express-validator');
const { sequelize, Order, OrderItem, Product, Notification, User } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { mapProduct } = require('./productController');

const mapOrder = (order) => ({
  id: order.id,
  user_id: order.user_id,
  total_amount: Number(order.total_amount),
  payment_status: order.payment_status,
  order_status: order.order_status,
  payment_method: order.payment_method,
  shipping_address: order.shipping_address,
  created_at: order.created_at,
  items: (order.order_items || []).map((item) => ({
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: Number(item.price),
    product: item.product ? mapProduct(item.product) : null
  }))
});

const createOrder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const items = req.body.items || [];
  const shippingAddress = req.body.shipping_address || req.body.shippingAddress || null;
  const paymentMethod = req.body.payment_method || req.body.paymentMethod || 'cod';
  const razorpayOrderId = req.body.razorpay_order_id || null;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'At least one order item is required');
  }

  const createdOrder = await sequelize.transaction(async (transaction) => {
    let totalAmount = 0;
    const preparedItems = [];

    for (const rawItem of items) {
      const productId = rawItem.product_id || rawItem.id;
      const quantity = Number(rawItem.quantity || 1);

      if (!productId || quantity < 1 || !Number.isInteger(quantity)) {
        throw new ApiError(400, 'Invalid order item payload');
      }

      const product = await Product.findByPk(productId, { transaction });
      if (!product) {
        throw new ApiError(404, `Product not found: ${productId}`);
      }

      const unitPrice = Number(product.price);
      totalAmount += unitPrice * quantity;

      preparedItems.push({
        product_id: product.id,
        quantity,
        price: unitPrice
      });
    }

    const order = await Order.create(
      {
        user_id: req.user.id,
        total_amount: totalAmount,
        payment_status: paymentMethod === 'cod' ? 'paid' : 'pending',
        order_status: 'Processing',
        payment_method: paymentMethod === 'cod' ? 'cod' : 'razorpay',
        shipping_address: shippingAddress,
        razorpay_order_id: razorpayOrderId
      },
      { transaction }
    );

    await OrderItem.bulkCreate(
      preparedItems.map((item) => ({
        ...item,
        order_id: order.id
      })),
      { transaction }
    );

    await Notification.create(
      {
        user_id: req.user.id,
        message: `Order #${order.id} has been confirmed.`,
        type: 'order_confirmation'
      },
      { transaction }
    );

    return order;
  });

  const order = await Order.findByPk(createdOrder.id, {
    include: [
      {
        model: OrderItem,
        include: [{ model: Product }]
      }
    ]
  });

  return res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: mapOrder(order)
  });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { user_id: req.user.id },
    include: [
      {
        model: OrderItem,
        include: [{ model: Product }]
      }
    ],
    order: [['created_at', 'DESC']]
  });

  return res.status(200).json({
    success: true,
    data: orders.map(mapOrder)
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      {
        model: OrderItem,
        include: [{ model: Product }]
      }
    ]
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const isOwner = order.user_id === req.user.id;
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = req.user.is_admin || adminEmails.includes((req.user.email || '').toLowerCase());

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not allowed to access this order');
  }

  return res.status(200).json({
    success: true,
    data: mapOrder(order)
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const status = req.body.order_status;
  const allowed = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  if (!allowed.includes(status)) {
    throw new ApiError(400, 'Invalid order status');
  }

  const order = await Order.findByPk(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.order_status = status;
  await order.save();

  const user = await User.findByPk(order.user_id);

  if (status === 'Shipped') {
    await Notification.create({
      user_id: user.id,
      message: `Order #${order.id} has been shipped.`,
      type: 'order_shipped'
    });
  }

  if (status === 'Delivered') {
    await Notification.create({
      user_id: user.id,
      message: `Order #${order.id} has been delivered.`,
      type: 'order_delivered'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: {
      id: order.id,
      order_status: order.order_status
    }
  });
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus
};
