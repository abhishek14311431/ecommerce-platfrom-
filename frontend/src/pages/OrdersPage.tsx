import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchUserOrders, cancelOrder } from '../redux/slices/ordersSlice';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const OrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { orders, loading } = useSelector((state: RootState) => state.orders);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [returnRequests, setReturnRequests] = useState<{ [key: number]: any[] }>({});
  const [showReturnModal, setShowReturnModal] = useState<{ orderId: number; itemId: number } | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [requestType, setRequestType] = useState<'return' | 'exchange'>('return');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    dispatch(fetchUserOrders());
  }, [dispatch, isAuthenticated, navigate]);

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await dispatch(cancelOrder(orderId));
        toast.success('Order cancelled successfully');
        dispatch(fetchUserOrders());
      } catch (error) {
        toast.error('Failed to cancel order');
      }
    }
  };

  const getEstimatedDelivery = (orderDate: string, status: string): string => {
    const date = new Date(orderDate);
    const statusMap: { [key: string]: number } = {
      pending: 5,
      confirmed: 4,
      shipped: 2,
      delivered: 0,
    };
    const daysToAdd = statusMap[status.toLowerCase()] || 5;
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatus = (status: string) => {
    const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = statusSteps.findIndex(s => s === status.toLowerCase());
    return { currentIndex, steps: statusSteps };
  };

  const handleSubmitReturn = async (orderId: number, itemId: number) => {
    if (!returnReason.trim()) {
      toast.error('Please enter a reason');
      return;
    }

    try {
      await api.post(`/orders/${orderId}/return-exchange`, {
        order_item_id: itemId,
        request_type: requestType,
        reason: returnReason,
      });
      toast.success(`${requestType.charAt(0).toUpperCase() + requestType.slice(1)} request submitted successfully`);
      setShowReturnModal(null);
      setReturnReason('');
      setRequestType('return');
      // Reload orders to update return status
      dispatch(fetchUserOrders());
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            ShopHub
          </Link>
          <div className="flex gap-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-semibold">
              Home
            </Link>
            <Link to="/cart" className="text-gray-700 hover:text-blue-600 font-semibold">
              Cart
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">You have no orders yet</p>
            <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const { currentIndex, steps } = getDeliveryStatus(order.status);
              const estimatedDelivery = getEstimatedDelivery(order.created_at, order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div 
                    className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-600">Order Number</p>
                        <p className="text-lg font-semibold text-gray-900">{order.order_number}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Placed on {new Date(order.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-2 ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <br />
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                          Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Tracking */}
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold mb-4">Delivery Status</h3>
                    <div className="flex items-center justify-between mb-6">
                      {steps.map((step, idx) => (
                        <div key={step} className="flex flex-col items-center flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            idx <= currentIndex ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {idx <= currentIndex ? '✓' : idx + 1}
                          </div>
                          <p className="text-xs text-gray-600 mt-2 capitalize">{step}</p>
                        </div>
                      ))}
                    </div>
                    {order.status.toLowerCase() !== 'delivered' && order.status.toLowerCase() !== 'cancelled' && (
                      <p className="text-sm text-gray-600">
                        <strong>Estimated Delivery:</strong> {estimatedDelivery}
                      </p>
                    )}
                    {order.status.toLowerCase() === 'delivered' && (
                      <p className="text-sm text-green-600">
                        <strong>Delivered on:</strong> {estimatedDelivery}
                      </p>
                    )}
                  </div>

                  {/* Expandable Content */}
                  {expandedOrder === order.id && (
                    <>
                      {/* Order Items */}
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                        <div className="space-y-4">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                              {item.product?.image_url && (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product?.name}
                                  className="w-20 h-20 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-semibold">{item.product?.name}</p>
                                <p className="text-sm text-gray-600">SKU: {item.product?.id}</p>
                                <p className="text-sm text-gray-600 mt-2">
                                  Quantity: {item.quantity} × ₹{parseFloat(item.product?.discount_price || item.product?.price || 0).toFixed(2)}
                                </p>
                              </div>
                              <p className="font-semibold text-right">
                                ₹{(parseFloat(item.product?.discount_price || item.product?.price || 0) * item.quantity).toFixed(2)}
                              </p>
                              {order.status.toLowerCase() === 'delivered' && (
                                <button
                                  onClick={() => setShowReturnModal({ orderId: order.id, itemId: item.id })}
                                  className="ml-4 px-3 py-2 bg-orange-500 text-white rounded text-sm font-semibold hover:bg-orange-600"
                                >
                                  Return/Exchange
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Shipping Details</h3>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Delivery Address:</p>
                          <p className="text-gray-700">{order.shipping_address}</p>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                        <div className="flex justify-end w-full max-w-xs ml-auto">
                          <div className="w-full space-y-2">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span>₹{parseFloat(order.shipping_cost).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tax:</span>
                              <span>₹{parseFloat(order.tax).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t border-gray-200">
                              <span>Total:</span>
                              <span>₹{parseFloat(order.total).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-6 flex gap-4">
                        {order.status.toLowerCase() !== 'cancelled' && order.status.toLowerCase() !== 'delivered' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="flex-1 border border-red-600 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-50"
                          >
                            Cancel Order
                          </button>
                        )}
                        <button
                          onClick={() => navigate('/')}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return/Exchange Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Return / Exchange Request</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Request Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={requestType === 'return'}
                      onChange={() => setRequestType('return')}
                      className="mr-2"
                    />
                    <span>Return</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={requestType === 'exchange'}
                      onChange={() => setRequestType('exchange')}
                      className="mr-2"
                    />
                    <span>Exchange</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Reason *</label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Please explain why you want to return/exchange this item..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowReturnModal(null);
                    setReturnReason('');
                    setRequestType('return');
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitReturn(showReturnModal.orderId, showReturnModal.itemId)}
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
