import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../redux/store';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist, checkWishlist } from '../redux/slices/wishlistSlice';
import { Link } from 'react-router-dom';
import { Product } from '../redux/slices/productsSlice';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState<'cart' | 'wishlist' | null>(null);

  useEffect(() => {
    checkIfInWishlist();
  }, [product.id]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const checkIfInWishlist = async () => {
    try {
      const result = await dispatch(checkWishlist(product.id));
      if (result.payload) {
        setIsInWishlist(result.payload.in_wishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ product_id: product.id, quantity }));
      setShowNotification('cart');
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product.id));
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await dispatch(addToWishlist(product.id));
        setIsInWishlist(true);
        setShowNotification('wishlist');
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const discountedPrice = product.discount_price || product.price;
  const savingsPercent = product.discount_percentage > 0 ? product.discount_percentage : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <Link to={`/product/${product.id}`}>
      <div className="relative bg-gray-100 h-48 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {savingsPercent > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
            -{savingsPercent}%
          </div>
        )}
      </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 truncate">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mt-2">
          <span className="text-yellow-400">{'⭐'.repeat(Math.round(product.rating))}</span>
          <span className="text-gray-600 ml-2 text-sm">
            {product.rating.toFixed(1)} ({product.review_count} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-blue-600">
            ₹{parseFloat(discountedPrice).toFixed(2)}
          </span>
          {product.discount_price && (
            <span className="text-lg text-gray-500 line-through">
              ₹{parseFloat(product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-2">
          {product.stock > 0 ? (
            <span className="text-green-600 font-semibold text-sm">In Stock</span>
          ) : (
            <span className="text-red-600 font-semibold text-sm">Out of Stock</span>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 border border-gray-300 rounded"
          >
            −
          </button>
          <span className="px-3">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-1 border border-gray-300 rounded"
          >
            +
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Add to Cart
          </button>
          <button
            onClick={handleWishlistToggle}
            className={`w-full py-2 rounded-lg border-2 transition ${
              isInWishlist
                ? 'border-red-500 text-red-500 hover:bg-red-50'
                : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
            }`}
          >
            {isInWishlist ? '❤️ Added' : '🤍 Wishlist'}
          </button>
        </div>

        {/* Notification Card */}
        {showNotification && (
          <div className={`mt-3 p-3 rounded-lg border-2 ${
            showNotification === 'cart'
              ? 'bg-blue-50 border-blue-300'
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${
                showNotification === 'cart'
                  ? 'text-blue-700'
                  : 'text-red-700'
              }`}>
                {showNotification === 'cart' ? '✓ Added to Cart' : '✓ Added to Wishlist'}
              </span>
              <button
                onClick={() => navigate(showNotification === 'cart' ? '/cart' : '/wishlist')}
                className={`text-xs font-bold px-2 py-1 rounded transition ${
                  showNotification === 'cart'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                View {showNotification === 'cart' ? 'Cart' : 'Wishlist'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
