import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already handled reactively
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const cartCount = getCartCount();

  return (
    <nav className="bg-blue-600 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <span className="text-white text-2xl font-bold italic tracking-tight">
              On<span className="text-yellow-300">Things 🚚</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 pr-12 rounded-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 text-blue-600 hover:text-blue-800"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Right Side Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`text-white hover:text-yellow-300 font-medium transition-colors ${
                    isActive('/login') ? 'text-yellow-300' : ''
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-white text-blue-600 px-4 py-1.5 rounded-sm font-medium hover:bg-yellow-300 hover:text-blue-800 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">
                  Hello, {user?.name?.split(' ')[0] || 'User'}
                </span>
                <Link
                  to="/my-orders"
                  className={`text-white hover:text-yellow-300 transition-colors ${
                    isActive('/my-orders') ? 'text-yellow-300' : ''
                  }`}
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-yellow-300 transition-colors flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className={`flex items-center gap-2 text-white hover:text-yellow-300 transition-colors ${
                isActive('/cart') ? 'text-yellow-300' : ''
              }`}
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-800 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="font-medium">Cart</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 pr-12 rounded-sm text-gray-800 placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-4 text-blue-600"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-700 border-t border-blue-500">
          <div className="px-4 py-3 space-y-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white hover:text-yellow-300 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white hover:text-yellow-300 py-2"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <span className="block text-white py-2">
                  Hello, {user?.name || 'User'}
                </span>
                <Link
                  to="/my-orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white hover:text-yellow-300 py-2"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-white hover:text-yellow-300 py-2 w-full text-left"
                >
                  Logout
                </button>
              </>
            )}
            <Link
              to="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-white hover:text-yellow-300 py-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
