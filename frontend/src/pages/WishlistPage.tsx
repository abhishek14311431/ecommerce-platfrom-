import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const WishlistPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state: RootState) => state.wishlist);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated, navigate]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await dispatch(removeFromWishlist(productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await dispatch(addToCart({ product_id: productId, quantity: 1 }));
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading wishlist...</p>
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
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">Your wishlist is empty</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {/* Product Image */}
                {item.product?.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">
                    {item.product?.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-600">
                      ₹
                      {parseFloat(
                        item.product?.discount_price || item.product?.price || 0
                      ).toFixed(2)}
                    </span>
                    {item.product?.discount_price && (
                      <span className="text-lg text-gray-500 line-through">
                        ₹{parseFloat(item.product.price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-400">
                      {'⭐'.repeat(Math.round(item.product?.rating || 0))}
                    </span>
                    <span className="text-gray-600 ml-2 text-xs">
                      {item.product?.rating?.toFixed(1)} (
                      {item.product?.review_count || 0} reviews)
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-4">
                    {item.product?.stock > 0 ? (
                      <span className="text-green-600 font-semibold text-sm">In Stock</span>
                    ) : (
                      <span className="text-red-600 font-semibold text-sm">Out of Stock</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(item.product_id)}
                      disabled={item.product?.stock === 0}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.product_id)}
                      className="w-full border-2 border-red-500 text-red-500 py-2 rounded-lg hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
