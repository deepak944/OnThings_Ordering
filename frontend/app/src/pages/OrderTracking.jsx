import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest(`/orders/${orderId}`, {
          method: 'GET',
          token
        });

        if (response?.data) {
          setOrder(response.data);
        }
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isAuthenticated, token, navigate]);

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

  const trackingSteps = [
    {
      status: 'Processing',
      title: 'Order Confirmed',
      icon: Package
    },
    {
      status: 'Shipped',
      title: 'Shipped',
      icon: Truck
    },
    {
      status: 'Out for Delivery',
      title: 'Out for Delivery',
      icon: Truck
    },
    {
      status: 'Delivered',
      title: 'Delivered',
      icon: CheckCircle
    }
  ];

  const getCurrentStepIndex = () => {
    return trackingSteps.findIndex((step) => step.status === order?.order_status);
  };

  const currentStepIndex = order ? getCurrentStepIndex() : -1;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/my-orders')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        )}

        {/* Order Details */}
        {!isLoading && order && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                  <p className="text-gray-600 mt-2">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Order Total</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ₹{order.total_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Order Status</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {order.order_status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Payment Status</p>
                  <p
                    className={`text-lg font-semibold mt-1 ${
                      order.payment_status === 'paid'
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Payment Method</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {order.payment_method === 'cod' ? 'COD' : 'Razorpay'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Items</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tracking Timeline</h2>
              <div className="space-y-4">
                {trackingSteps.map((step, index) => {
                  const isCurrentStep = step.status === order.order_status;
                  const isCompletedStep = index <= currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.status} className="flex gap-4">
                      {/* Timeline Line and Icon */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white ${
                            isCompletedStep
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        >
                          {isCompletedStep ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <Clock className="h-6 w-6" />
                          )}
                        </div>
                        {index < trackingSteps.length - 1 && (
                          <div
                            className={`w-1 h-12 mt-2 ${
                              isCompletedStep && index < currentStepIndex
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          ></div>
                        )}
                      </div>

                      {/* Step Details */}
                      <div className="pb-4 flex-1">
                        <h3
                          className={`font-semibold text-lg ${
                            isCompletedStep
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`text-sm mt-1 ${
                            isCompletedStep
                              ? 'text-gray-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {isCompletedStep
                            ? isCurrentStep
                              ? 'Order is currently ' +
                                (step.status === 'Processing'
                                  ? 'being processed'
                                  : step.status === 'Shipped'
                                  ? 'in transit'
                                  : step.status === 'Out for Delivery'
                                  ? 'out for delivery'
                                  : 'delivered')
                              : 'Completed'
                            : 'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {order.shipping_address.fullName}
                  </p>
                  <p className="text-gray-600 mt-1">
                    {order.shipping_address.address}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address.city},
                    {order.shipping_address.state} {order.shipping_address.pincode}
                  </p>
                  <p className="text-gray-600 mt-2">
                    Phone: {order.shipping_address.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    {item.product?.image_url && (
                      <img
                        src={item.product.image_url}
                        alt={item.product?.name}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.product?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.product?.category && 
                          `Category: ${item.product.category}`}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-600">
                          Qty: {item.quantity} × ₹{item.price}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ₹{(item.quantity * item.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>
                      ₹
                      {(order.total_amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total Amount</span>
                    <span>₹{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-800 text-sm">
                If you have any questions about your order, please contact our support team.
                We're here to help!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
