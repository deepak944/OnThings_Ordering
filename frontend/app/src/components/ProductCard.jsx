import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Zap, Star } from 'lucide-react';

const CATEGORY_IMAGE_FALLBACKS = {
  mobiles: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=70'
  ],
  electronics: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=70'
  ],
  laptops: [
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=70'
  ],
  footwear: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=70'
  ],
  tv: [
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&auto=format&fit=crop&q=70'
  ],
  wearables: [
    'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=70'
  ],
  cameras: [
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800&auto=format&fit=crop&q=70'
  ],
  gaming: [
    'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&auto=format&fit=crop&q=70'
  ],
  accessories: [
    'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=70',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=70'
  ]
};

const buildLocalPlaceholder = (title, category) => {
  const safeTitle = (title || 'OnThings Product').replace(/[<>&'"]/g, '').slice(0, 34);
  const safeCategory = (category || 'Category').replace(/[<>&'"]/g, '').toUpperCase().slice(0, 22);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='700' height='700' viewBox='0 0 700 700'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#1d4ed8'/>
        <stop offset='100%' stop-color='#1e3a8a'/>
      </linearGradient>
    </defs>
    <rect width='700' height='700' fill='url(#g)'/>
    <circle cx='560' cy='120' r='120' fill='rgba(255,255,255,0.12)'/>
    <circle cx='160' cy='560' r='180' fill='rgba(255,255,255,0.09)'/>
    <text x='52' y='90' fill='white' opacity='0.92' font-size='40' font-family='Arial, sans-serif'>OnThings</text>
    <text x='52' y='150' fill='#fde047' opacity='0.95' font-size='28' font-family='Arial, sans-serif'>${safeCategory}</text>
    <text x='52' y='634' fill='white' opacity='0.92' font-size='26' font-family='Arial, sans-serif'>${safeTitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getImageCandidates = (product) => {
  const categoryKey = String(product.category || '').toLowerCase();
  const baseImage = product.image || product.image_url || '';
  const candidates = [];

  if (baseImage) {
    candidates.push(baseImage);
  }

  (CATEGORY_IMAGE_FALLBACKS[categoryKey] || []).forEach((url) => {
    if (!candidates.includes(url)) {
      candidates.push(url);
    }
  });

  candidates.push(buildLocalPlaceholder(product.title || product.name, product.category));
  return candidates;
};

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const imageCandidates = useMemo(() => getImageCandidates(product), [product]);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [product.id, product.image, product.image_url, product.category, product.title, product.name]);

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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_40px_rgba(30,64,175,0.18)] transition-all duration-300 border border-blue-100/80 overflow-hidden group hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50">
        <img
          src={imageCandidates[imageIndex]}
          alt={product.title || product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={() => {
            setImageIndex((current) => {
              if (current >= imageCandidates.length - 1) {
                return current;
              }
              return current + 1;
            });
          }}
        />
        {inCart && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
            In Cart
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Category */}
        <span className="inline-flex text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
          {product.category}
        </span>

        {/* Title */}
        <h3 className="text-gray-900 font-semibold text-[15px] mt-2 line-clamp-2 h-12 leading-snug">
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
          <span className="text-2xl font-extrabold text-slate-900">
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
