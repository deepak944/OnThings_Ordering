import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { Package, Clock, CheckCircle, Truck, ArrowRight, ShoppingBag } from 'lucide-react';

const MyOrders = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('/orders/user-orders', {
          method: 'GET',
          token
        });

        if (response?.data) {
          setOrders(response.data);
        }
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token, navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'Shipped':
        return <Truck className="h-5 w-5 text-orange-500" />;
      case 'Out for Delivery':
        return <Truck className="h-5 w-5 text-yellow-500" />;
      case 'Delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Shipped':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Out for Delivery':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid'
      ? 'text-green-600 bg-green-50'
      : 'text-orange-600 bg-orange-50';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">Track and manage all your orders</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to place your first order</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Status Badge */}
                      <div
                        className={`px-4 py-2 rounded-lg border flex items-center gap-2 font-medium text-sm ${getStatusColor(
                          order.order_status
                        )}`}
                      >
                        {getStatusIcon(order.order_status)}
                        {order.order_status}
                      </div>

                      {/* Payment Status */}
                      <div
                        className={`px-4 py-2 rounded-lg font-medium text-sm ${getPaymentStatusColor(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Items:</h4>
                  <div className="space-y-3">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 pb-3 border-b border-gray-100 last:border-0"
                      >
                        {item.product?.image_url && (
                          <img
                            src={item.product.image_url}
                            alt={item.product?.name}
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.product?.name || 'Product'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ₹{(item.quantity * item.price).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="p-6 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{order.total_amount.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/order-tracking/${order.id}`)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center sm:justify-start"
                  >
                    Track Order
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
