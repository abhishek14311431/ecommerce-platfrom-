import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchProducts } from '../redux/slices/productsSlice';
import { setFilters, setCategoryId, setSearch } from '../redux/slices/filterSlice';
import { logout } from '../redux/slices/authSlice';
import ProductCard from '../components/ProductCard';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { products, loading } = useSelector((state: RootState) => state.products);
  const { categoryId, search, sortBy, sortOrder, skip, limit } = useSelector((state: RootState) => state.filter);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [showCategories, setShowCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    setShowUserMenu(false);
    navigate('/');
  };

  // Load search history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('searchHistory');
    if (stored) {
      setSearchHistory(JSON.parse(stored));
    }
  }, []);

  // Save search history to localStorage
  const addToSearchHistory = (term: string) => {
    if (!term.trim()) return;
    
    const filtered = searchHistory.filter(item => item.toLowerCase() !== term.toLowerCase());
    const updated = [term, ...filtered].slice(0, 10); // Keep last 10 searches
    
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    setShowSearchHistory(false);
  };

  const handleSearchHistoryClick = (term: string) => {
    setSearchInput(term);
    dispatch(setSearch(term));
    setShowSearchHistory(false);
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    dispatch(
      fetchProducts({
        category_id: categoryId,
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
        skip,
        limit,
      })
    );
  }, [dispatch, categoryId, search, sortBy, sortOrder, skip, limit]);

  const handleCategoryClick = (catId: number) => {
    dispatch(setCategoryId(catId));
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get('search') as string;
    if (searchTerm) {
      addToSearchHistory(searchTerm);
    }
    dispatch(setSearch(searchTerm || undefined));
    setShowSearchHistory(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              ShopHub
            </Link>

            {/* Search Bar with History */}
            <form onSubmit={handleSearch} className="flex-1 mx-8">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => searchHistory.length > 0 && setShowSearchHistory(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  🔍
                </button>

                {/* Search History Dropdown */}
                {showSearchHistory && searchHistory.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 z-40 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs font-semibold text-gray-600 px-3 py-2">Recent Searches</p>
                      {searchHistory.map((term, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearchHistoryClick(term)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm text-gray-700 flex items-center justify-between"
                        >
                          <span>🔍 {term}</span>
                        </button>
                      ))}
                      <button
                        onClick={clearSearchHistory}
                        className="w-full text-left px-3 py-2 hover:bg-red-50 rounded text-xs text-red-600 mt-2 pt-2 border-t border-gray-200"
                      >
                        Clear History
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Right icons */}
            <div className="flex gap-6 items-center">
              <Link to="/wishlist" className="text-2xl hover:text-red-500">
                ❤️
              </Link>
              <Link to="/cart" className="text-2xl hover:text-blue-500">
                🛒
              </Link>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="text-2xl hover:text-gray-600 relative"
                >
                  👤
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                          <p className="text-xs text-gray-600">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-200"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">🎉 Mega Sale Alert!</h1>
          <p className="text-2xl mb-6">Get Up to 50% OFF on All Categories</p>
          <div className="flex justify-center gap-4 text-lg">
            <span className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold">Free Shipping</span>
            <span className="bg-white text-pink-600 px-6 py-2 rounded-full font-bold">Easy Returns</span>
            <span className="bg-white text-red-600 px-6 py-2 rounded-full font-bold">24/7 Support</span>
          </div>
        </div>
      </div>

      {/* Category Showcase */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {!loadingCategories && categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`p-4 rounded-lg text-center transition-all hover:scale-105 ${
                  categoryId === cat.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white hover:bg-blue-50'
                }`}
              >
                <div className="text-4xl mb-2">
                  {cat.name === 'Electronics' && '📱'}
                  {cat.name === 'Mobiles' && '📲'}
                  {cat.name === 'Laptops' && '💻'}
                  {cat.name === 'Fashion' && '👕'}
                  {cat.name === 'Home Appliances' && '🏠'}
                  {cat.name === 'Books' && '📚'}
                  {cat.name === 'Beauty' && '💄'}
                  {cat.name === 'Sports' && '⚽'}
                </div>
                <p className="text-sm font-semibold">{cat.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Category Display */}
        {categoryId && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-blue-900">
                  {categories.find(c => c.id === categoryId)?.name}
                </h2>
                <p className="text-blue-700">
                  {categories.find(c => c.id === categoryId)?.description}
                </p>
              </div>
              <button
                onClick={() => dispatch(setCategoryId(undefined))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View All Products
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="w-full">
            {/* Product Count */}
            {!loading && products.length > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{products.length}</span> products
                  {categoryId && ` in ${categories.find(c => c.id === categoryId)?.name}`}
                </p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-xl text-gray-600 mt-4">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-2xl font-semibold text-gray-800 mb-2">No products found</p>
                <p className="text-gray-600 mb-6">Try browsing a different category or search term</p>
                <button
                  onClick={() => {
                    dispatch(setCategoryId(undefined));
                    dispatch(setSearch(undefined));
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default HomePage;
