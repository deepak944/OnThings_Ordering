const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sequelize, Order, OrderItem, Product, Notification } = require('../models');
const { getRazorpay } = require('../utils/razorpay');

const createPaidRazorpayOrder = async ({
  userId,
  items,
  shippingAddress,
  razorpayOrderId,
  razorpayPaymentId
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'At least one order item is required');
  }

  return sequelize.transaction(async (transaction) => {
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
        user_id: userId,
        total_amount: totalAmount,
        payment_status: 'paid',
        order_status: 'Processing',
        payment_method: 'razorpay',
        shipping_address: shippingAddress,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId
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
        user_id: userId,
        message: `Order #${order.id} has been confirmed.`,
        type: 'order_confirmation'
      },
      { transaction }
    );

    return order;
  });
};

const createOrder = asyncHandler(async (req, res) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    throw new ApiError(500, 'Razorpay is not configured');
  }

  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) {
    throw new ApiError(400, 'Amount must be greater than 0');
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: req.body.currency || 'INR',
    receipt: req.body.receipt || `rcpt_${Date.now()}`,
    notes: req.body.notes || {}
  });

  return res.status(201).json({
    success: true,
    message: 'Razorpay order created successfully',
    data: order
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const {
    app_order_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Missing payment verification fields');
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new ApiError(500, 'Razorpay key secret missing');
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, 'Payment signature verification failed');
  }

  let finalizedOrder = null;

  if (app_order_id) {
    const order = await Order.findByPk(app_order_id);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.user_id !== req.user.id) {
      throw new ApiError(403, 'Unauthorized order access');
    }

    order.payment_status = 'paid';
    order.payment_method = 'razorpay';
    order.razorpay_order_id = razorpay_order_id;
    order.razorpay_payment_id = razorpay_payment_id;
    await order.save();

    finalizedOrder = order;
  } else {
    const items = req.body.items || [];
    const shippingAddress = req.body.shipping_address || req.body.shippingAddress || null;

    finalizedOrder = await createPaidRazorpayOrder({
      userId: req.user.id,
      items,
      shippingAddress,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: finalizedOrder
      ? {
          order: {
            id: finalizedOrder.id,
            user_id: finalizedOrder.user_id,
            total_amount: Number(finalizedOrder.total_amount),
            payment_status: finalizedOrder.payment_status,
            order_status: finalizedOrder.order_status,
            payment_method: finalizedOrder.payment_method,
            created_at: finalizedOrder.created_at
          }
        }
      : undefined
  });
});

module.exports = {
  createOrder,
  verifyPayment
};
