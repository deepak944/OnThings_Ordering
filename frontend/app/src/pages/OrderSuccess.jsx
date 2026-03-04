import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Package, Home, ShoppingBag, Calendar, User } from 'lucide-react';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const orderId = location.state?.orderId;
  const orderDate = location.state?.orderDate;
  const total = location.state?.total;

  // Redirect if accessed directly without order
  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const estimatedDelivery = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-500 py-8 px-6 text-center">
            <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-green-100">
              Thank you for shopping with us
            </p>
          </div>

          {/* Order Details */}
          <div className="p-6 sm:p-8">
            {/* Order Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium text-gray-900">#{orderId}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium text-gray-900">{formatDate(orderDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium text-gray-900">{user?.name || 'Guest'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-2">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-gray-900">{formatPrice(total)}</p>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Estimated Delivery</h3>
              </div>
              <p className="text-blue-800">
                Your order will be delivered by <strong>{estimatedDelivery()}</strong>
              </p>
            </div>

            {/* What's Next */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 rounded-full h-6 w-6 flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  <p className="text-gray-600">Order confirmation email sent to {user?.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 rounded-full h-6 w-6 flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <p className="text-gray-600">Your order will be processed and packed</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 rounded-full h-6 w-6 flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                  <p className="text-gray-600">You'll receive tracking information via SMS</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 rounded-full h-6 w-6 flex items-center justify-center text-white text-xs font-bold">
                    4
                  </div>
                  <p className="text-gray-600">Sit back and relax! Your order is on its way</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Home className="h-5 w-5" />
                Continue Shopping
              </Link>
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 bg-white text-blue-600 border border-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                View Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@flipkartclone.com" className="text-blue-600 hover:underline">
              support@flipkartclone.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
