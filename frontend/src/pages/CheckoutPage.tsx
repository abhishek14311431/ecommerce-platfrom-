import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { createOrder, fetchUserOrders } from '../redux/slices/ordersSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

type PaymentMethod = 'cod' | 'upi' | 'debit_card' | 'credit_card' | 'net_banking';

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items, totals } = useSelector((state: RootState) => state.cart);
  const { selectedOrder, loading } = useSelector((state: RootState) => state.orders);

  const [shippingDetails, setShippingDetails] = useState({
    road: '',
    district: '',
    city: '',
    state: '',
    country: 'India',
    pinCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const indianStates = [
    'Andhra Pradesh',
    'Delhi',
    'Gujarat',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Rajasthan',
    'Tamil Nadu',
    'Telangana',
    'Uttar Pradesh',
    'West Bengal',
  ];

  const countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];

  const indianBanks = [
    'State Bank of India (SBI)',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Punjab National Bank (PNB)',
    'Bank of Baroda',
    'Canara Bank',
    'Union Bank of India',
    'Kotak Mahindra Bank',
    'IndusInd Bank',
  ];

  const isPinCodeValid = /^\d{6}$/.test(shippingDetails.pinCode.trim());
  const isAddressValid =
    shippingDetails.road.trim().length > 0 &&
    shippingDetails.district.trim().length > 0 &&
    shippingDetails.city.trim().length > 0 &&
    shippingDetails.state.trim().length > 0 &&
    shippingDetails.country.trim().length > 0 &&
    isPinCodeValid;

  const formattedShippingAddress = `${shippingDetails.road.trim()}, ${shippingDetails.district.trim()}, ${shippingDetails.city.trim()}, ${shippingDetails.state.trim()}, ${shippingDetails.country.trim()} - ${shippingDetails.pinCode.trim()}`;

  const handleShippingFieldChange = (
    field: keyof typeof shippingDetails,
    value: string
  ) => {
    setShippingDetails((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (items.length === 0 && !orderCreated) {
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, items, navigate, orderCreated]);

  const validatePaymentDetails = (): boolean => {
    if (paymentMethod === 'upi' && !upiId.trim()) {
      toast.error('Please enter your UPI ID');
      return false;
    }
    if ((paymentMethod === 'debit_card' || paymentMethod === 'credit_card')) {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        toast.error('Please enter all card details');
        return false;
      }
    }
    if (paymentMethod === 'net_banking' && !selectedBank) {
      toast.error('Please select a bank');
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAddressValid) {
      toast.error('Please fill all shipping fields and enter a valid 6-digit pin code');
      return;
    }

    if (paymentMethod !== 'cod' && !validatePaymentDetails()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create order with payment method
      const result = await dispatch(
        createOrder({ 
          shipping_address: formattedShippingAddress,
          payment_method: paymentMethod 
        })
      );

      if (createOrder.fulfilled.match(result)) {
        const order = result.payload;
        setOrderCreated(true);
        setOrderDetails(order);
        console.log('✅ Order created:', order);
        
        // Clear the cart after successful order
        const clearResult = await dispatch(clearCart());
        console.log('✅ Cart cleared:', clearResult);
        
        // Fetch updated orders list
        const ordersResult = await dispatch(fetchUserOrders());
        console.log('✅ Orders fetched:', ordersResult);
        
        // Show success modal with animation
        setShowSuccessModal(true);
        
        // Don't show toast when showing modal - the modal is the feedback
        // Don't auto-redirect - let user click the button
      } else {
        console.error('❌ Order creation failed:', result);
        toast.error('Failed to create order');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('❌ Order creation error:', error);
      toast.error('An error occurred while creating the order');
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || (items.length === 0 && !orderCreated)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            ShopHub
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {!showSuccessModal && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitOrder} className="bg-white rounded-lg shadow-md p-6">
              {/* Shipping Address */}
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Shipping Address *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={shippingDetails.road}
                    onChange={(e) => handleShippingFieldChange('road', e.target.value)}
                    placeholder="Road / Street"
                    className="md:col-span-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={shippingDetails.district}
                    onChange={(e) => handleShippingFieldChange('district', e.target.value)}
                    placeholder="District"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={shippingDetails.city}
                    onChange={(e) => handleShippingFieldChange('city', e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <select
                    value={shippingDetails.state}
                    onChange={(e) => handleShippingFieldChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select State</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <select
                    value={shippingDetails.country}
                    onChange={(e) => handleShippingFieldChange('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={shippingDetails.pinCode}
                    onChange={(e) => handleShippingFieldChange('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Pin Code (6 digits)"
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {shippingDetails.pinCode.length > 0 && !isPinCodeValid && (
                  <p className="text-red-500 text-sm mt-1">Enter a valid 6-digit pin code</p>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Payment Method *
                </label>
                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">Cash on Delivery (COD)</span>
                      <p className="text-sm text-gray-600">Pay when you receive the product</p>
                    </div>
                  </label>

                  {/* UPI */}
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium text-gray-900">UPI</span>
                      <p className="text-sm text-gray-600">PhonePe, Google Pay, Paytm, etc.</p>
                      {paymentMethod === 'upi' && (
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="Enter UPI ID (e.g., yourname@paytm)"
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </label>

                  {/* Debit Card */}
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="debit_card"
                      checked={paymentMethod === 'debit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium text-gray-900">Debit Card</span>
                      <p className="text-sm text-gray-600">Visa, MasterCard, RuPay</p>
                      {paymentMethod === 'debit_card' && (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="Card Number"
                            maxLength={16}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="CVV"
                              maxLength={3}
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Credit Card */}
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium text-gray-900">Credit Card</span>
                      <p className="text-sm text-gray-600">Visa, MasterCard, American Express</p>
                      {paymentMethod === 'credit_card' && (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="Card Number"
                            maxLength={16}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="CVV"
                              maxLength={3}
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Net Banking */}
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="net_banking"
                      checked={paymentMethod === 'net_banking'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium text-gray-900">Net Banking</span>
                      <p className="text-sm text-gray-600">All major Indian banks</p>
                      {paymentMethod === 'net_banking' && (
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Your Bank</option>
                          {indianBanks.map((bank) => (
                            <option key={bank} value={bank}>
                              {bank}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>
                        ₹{(
                          parseFloat(item.product.discount_price || item.product.price) *
                          item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              {totals && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{parseFloat(totals.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>₹{parseFloat(totals.shipping_cost).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₹{parseFloat(totals.tax).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-blue-600 pt-2">
                      <span>Total:</span>
                      <span>₹{parseFloat(totals.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isAddressValid || isProcessing || loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing || loading
                  ? 'Processing...'
                  : !isAddressValid
                  ? 'Enter Shipping Address to Continue'
                  : paymentMethod === 'cod'
                  ? 'Place Order (Cash on Delivery)'
                  : 'Proceed to Payment'}
              </button>

              {/* Continue Shopping Button */}
              <Link
                to="/cart"
                className="block text-center mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
              >
                Back to Cart
              </Link>
            </form>
          </div>

          {/* Order Items Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>
              <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        No Image
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-600">
                        ₹{parseFloat(item.product.discount_price || item.product.price).toFixed(2)}
                        × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {totals && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{parseFloat(totals.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>₹{parseFloat(totals.shipping_cost).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>₹{parseFloat(totals.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-600 pt-2 border-t border-gray-200 mt-2">
                    <span>Total:</span>
                    <span>₹{parseFloat(totals.total).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && orderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 transform animate-scale-up shadow-2xl">
            {/* Animated Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24">
                {/* Outer circle pulse */}
                <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse-scale"></div>
                {/* Main circle */}
                <div className="absolute inset-0 rounded-full bg-green-100 flex items-center justify-center">
                  <svg 
                    className="w-16 h-16 text-green-500 animate-checkmark" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Success Message */}
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-center text-gray-600 mb-6 text-lg">
              {paymentMethod === 'cod' 
                ? '🎉 Your order has been placed. You will pay on delivery.' 
                : `✅ Your ${paymentMethod.toUpperCase()} payment is being processed.`}
            </p>
            
            {/* Order Details */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <div className="flex justify-between mb-3">
                <span className="text-gray-600 font-medium">Order Number</span>
                <span className="font-bold text-gray-800">{orderDetails.order_number}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-600 font-medium">Total Amount</span>
                <span className="font-bold text-green-600 text-lg">₹{parseFloat(orderDetails.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Payment Method</span>
                <span className="font-semibold text-gray-800">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}</span>
              </div>
            </div>

            {/* Status Check Info */}
            <p className="text-center text-gray-600 text-sm mb-6 bg-amber-50 p-3 rounded-lg border border-amber-200">
              📦 Check the status of your order in <span className="font-semibold">My Orders</span>
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/orders')}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md"
              >
                My Orders
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { 
            transform: scale(0.8);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes pulse-scale {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.1;
          }
        }
        @keyframes checkmark-draw {
          0% {
            stroke-dashoffset: 48;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.4s ease-out;
        }
        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }
        .animate-checkmark {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: checkmark-draw 0.6s ease-out 0.3s forwards;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
