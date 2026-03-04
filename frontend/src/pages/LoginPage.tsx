import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { login, clearError, markInitializationComplete } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, isInitializing } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    username_or_email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  // Separate effect for authentication redirect to avoid conflicts
  React.useEffect(() => {
    // Skip if still initializing to avoid race conditions
    if (isInitializing) {
      return;
    }
    
    // Only redirect if already authenticated when landing on login page
    const token = localStorage.getItem('token');
    console.log('[LoginPage] Auth check:', { isAuthenticated, hasToken: !!token, isInitializing });
    if (isAuthenticated && token) {
      console.log('[LoginPage] Redirecting to home (already authenticated)');
      navigate('/', { replace: true });
    }
  }, [isInitializing, isAuthenticated, navigate]); // Check when init or auth changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.username_or_email.trim() || !formData.password.trim()) {
      toast.error('Please enter username/email and password');
      return;
    }
    
    try {
      const result = await dispatch(login(formData));
      if (login.fulfilled.match(result)) {
        console.log('Login successful, token:', result.payload.access_token?.substring(0, 20) + '...');
        console.log('User:', result.payload.user);
        toast.success('Logged in successfully!');
        // Small delay to ensure state is fully propagated
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 50);
      } else if (login.rejected.match(result)) {
        const errorMsg = result.payload as string || 'Login failed';
        toast.error(errorMsg);
        console.error('Login error:', errorMsg);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">ShopHub</h1>
        <h2 className="text-2xl font-semibold text-center mb-8">Login</h2>

        {/* Error Message Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">❌ {error}</p>
          </div>
        )}

        {/* Test Credentials Info */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-xs font-semibold mb-2">Test Credentials:</p>
          <p className="text-blue-700 text-xs">📧 john_doe / John123456</p>
          <p className="text-blue-700 text-xs">📧 admin / Admin123456</p>
          <p className="text-blue-700 text-xs">📧 jane_smith / Jane123456</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email/Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email or Username
            </label>
            <input
              type="text"
              name="username_or_email"
              value={formData.username_or_email}
              onChange={handleChange}
              placeholder="john_doe or john@example.com"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                error
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  error
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <Link to="/forgot-password" className="inline-block text-sm text-blue-600 hover:underline">
            Forgot password?
          </Link>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
