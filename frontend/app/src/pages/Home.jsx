import React, { useEffect, useMemo, useState } from 'react';
import { products as fallbackProducts } from '../data/products';
import { apiRequest } from '../lib/api';
import ProductCard from '../components/ProductCard';
import { Search, Package, Truck } from 'lucide-react';

const Home = ({ searchQuery }) => {
  const [products, setProducts] = useState(fallbackProducts);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const response = await apiRequest('/products');
        if (isMounted && Array.isArray(response?.data) && response.data.length > 0) {
          setProducts(response.data);
        }
      } catch (_error) {
        // Keep fallback local products when backend is unavailable.
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let result = products;

    // Apply search filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      result = result.filter((product) => {
        const title = product.title || product.name || '';
        return (
          title.toLowerCase().includes(searchTerm) ||
          String(product.category || '').toLowerCase().includes(searchTerm)
        );
      });
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    return result;
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="home-shell min-h-screen bg-slate-50">
      <div className="home-atmosphere" aria-hidden="true">
        <span className="home-orb home-orb-one" />
        <span className="home-orb home-orb-two" />
        <span className="home-orb home-orb-three" />
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="hero-mesh" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                India's Biggest Shopping Festival
              </h1>
              <p className="text-lg md:text-xl text-blue-100/95 mb-6">
                Get the best deals on electronics, fashion, and more!
              </p>
              <div className="flex gap-4">
                <span className="bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-extrabold shadow-[0_8px_20px_rgba(250,204,21,0.35)]">
                  Up to 70% OFF
                </span>
                <span className="bg-white/95 text-blue-700 px-4 py-2 rounded-full font-bold shadow-md">
                  Free Delivery
                </span>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="hero-brand-card bg-white/10 backdrop-blur-sm rounded-xl p-7 w-[280px] sm:w-[320px]">
                <p className="text-blue-100 text-sm tracking-[0.18em] uppercase mb-2">Welcome to</p>
                <h2 className="text-white text-4xl font-black italic leading-none">
                  On<span className="text-yellow-300">Things</span>
                </h2>
                <p className="text-blue-100 mt-3">Fast delivery. Better deals. Trusted shopping.</p>

                <div className="hero-road mt-6" aria-hidden="true">
                  <span className="hero-road-line" />
                  <span className="hero-road-line" />
                  <span className="hero-road-line" />
                  <span className="hero-road-line" />
                  <Truck className="hero-truck-runner h-7 w-7 text-yellow-300" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Category Filter */}
        <div className="mb-8 rounded-2xl bg-white/75 backdrop-blur-sm border border-blue-100/70 p-4 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)]'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-200 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery.trim() && (
          <div className="mb-6 flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-500" />
            <p className="text-gray-600">
              Showing results for <span className="font-semibold text-gray-900">"{searchQuery}"</span>
              <span className="ml-2 text-sm">({filteredProducts.length} products found)</span>
            </p>
          </div>
        )}

        {loadingProducts && (
          <p className="mb-4 text-sm text-gray-500">Loading products...</p>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            {searchQuery && (
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Delivery</h3>
              <p className="text-gray-600 text-sm">On orders above Rs.500</p>
            </div>
            <div>
              <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Genuine Products</h3>
              <p className="text-gray-600 text-sm">100% authentic guarantee</p>
            </div>
            <div>
              <div className="bg-purple-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Shipping</h3>
              <p className="text-gray-600 text-sm">Delivery within 2-3 days</p>
            </div>
            <div>
              <div className="bg-orange-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">Multiple payment options</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
