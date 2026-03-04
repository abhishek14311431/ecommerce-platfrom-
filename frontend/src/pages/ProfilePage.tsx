import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchUserOrders } from '../redux/slices/ordersSlice';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
}

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { orders, loading: ordersLoading } = useSelector((state: RootState) => state.orders);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchProfile();
    dispatch(fetchUserOrders());
  }, [isAuthenticated, navigate, dispatch]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setProfile(response.data);
      setFormData({
        phone: response.data.phone || '',
        address: response.data.address || '',
        city: response.data.city || '',
        state: response.data.state || '',
        postal_code: response.data.postal_code || '',
        country: response.data.country || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      await api.put('/auth/me', formData);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
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
        <p className="text-xl text-gray-600">Loading profile...</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">My Profile</h2>

              {profile && (
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <p className="text-sm text-gray-600">Username</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile.username}
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile.email}
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Edit Profile Button */}
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Edit Profile Form */}
            {editing && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold mb-6">Edit Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleUpdateProfile}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {profile && !editing && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">Delivery Address</h3>
                {profile.address ? (
                  <div className="space-y-2">
                    <p className="text-gray-900 font-semibold">{profile.address}</p>
                    <p className="text-gray-600">
                      {profile.city}, {profile.state} {profile.postal_code}
                    </p>
                    <p className="text-gray-600">{profile.country}</p>
                    {profile.phone && (
                      <p className="text-gray-600">Phone: {profile.phone}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No delivery address added</p>
                    <button
                      onClick={() => setEditing(true)}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-6">Recent Orders</h3>

              {ordersLoading ? (
                <p className="text-gray-600">Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No orders yet</p>
                  <Link
                    to="/"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Order #{order.order_number}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-3 py-1 rounded text-xs font-semibold mb-2 ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                          <br />
                          <span
                            className={`inline-block px-3 py-1 rounded text-xs font-semibold ${getPaymentStatusColor(
                              order.payment_status
                            )}`}
                          >
                            {order.payment_status}
                          </span>
                        </div>
                      </div>

                      <div className="pb-4 mb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">
                          {order.items?.length || 0} item(s)
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {order.items?.slice(0, 2).map((item: any, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {item.product?.name}
                            </span>
                          ))}
                          {order.items?.length > 2 && (
                            <span className="text-xs text-gray-600 px-2 py-1">
                              +{order.items.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="text-lg font-bold text-blue-600">
                            ₹{parseFloat(order.total).toFixed(2)}
                          </p>
                        </div>
                        <Link
                          to="/orders"
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}

                  {orders.length > 5 && (
                    <Link
                      to="/orders"
                      className="block text-center text-blue-600 hover:text-blue-700 font-semibold py-4"
                    >
                      View All Orders →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
