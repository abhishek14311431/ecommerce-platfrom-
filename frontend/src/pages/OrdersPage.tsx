import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchUserOrders, cancelOrder } from '../redux/slices/ordersSlice';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const OrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { orders, loading } = useSelector((state: RootState) => state.orders);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            ShopHub
          </Link>
          <div className="flex gap-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-semibold"
            >
              Home
            </Link>
            <Link
              to="/cart"
              className="text-gray-700 hover:text-blue-600 font-semibold"
            >
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
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {order.order_number}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-2 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <br />
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getPaymentStatusColor(
                        order.payment_status
                      )}`}
                    >
                      Payment: {order.payment_status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Items:</h3>
                  <div className="space-y-4">
                    {order.items && order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 pb-4 border-b border-gray-100">
                        {item.product?.image_url && (
                          <img
                            src={item.product.image_url}
                            alt={item.product?.name || 'Product'}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{item.product?.name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ₹{parseFloat(
                              item.product?.discount_price || item.product?.price || 0
                            ).toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ₹{(parseFloat(item.product?.discount_price || item.product?.price || 0) * item.quantity).toFixed(
                            2
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-end w-full max-w-xs ml-auto space-y-2">
                    <div className="flex justify-between w-full">
                      <span>Subtotal:</span>
                      <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-full">
                      <span>Shipping:</span>
                      <span>₹{parseFloat(order.shipping_cost).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-full">
                      <span>Tax:</span>
                      <span>₹{parseFloat(order.tax).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-full text-lg font-bold text-blue-600 pt-2">
                      <span>Total:</span>
                      <span>₹{parseFloat(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Shipping Address:
                  </p>
                  <p className="text-gray-600">{order.shipping_address}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    View Details
                  </button>
                  {order.status.toLowerCase() !== 'cancelled' &&
                    order.status.toLowerCase() !== 'delivered' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="flex-1 border border-red-600 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-50"
                      >
                        Cancel Order
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
