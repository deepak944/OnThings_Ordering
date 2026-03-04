const Razorpay = require('razorpay');

let razorpay;

const getRazorpay = () => {
  if (razorpay) {
    return razorpay;
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  return razorpay;
};

module.exports = { getRazorpay };