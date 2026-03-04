import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Zap, Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }
    addToCart(product);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }
    addToCart(product);
    navigate('/checkout');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const inCart = isInCart(product.id);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-200 overflow-hidden group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
        />
        {inCart && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            In Cart
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Category */}
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {product.category}
        </span>

        {/* Title */}
        <h3 className="text-gray-900 font-medium text-sm mt-1 line-clamp-2 h-10">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex items-center bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
            <span>{product.rating}</span>
            <Star className="h-3 w-3 ml-0.5 fill-current" />
          </div>
          <span className="text-gray-500 text-xs">({product.reviews.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="mt-3">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded font-medium transition-colors ${
              inCart
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-yellow-400 text-blue-900 hover:bg-yellow-500'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            {inCart ? 'Add More' : 'Add to Cart'}
          </button>
          
          <button
            onClick={handleBuyNow}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
