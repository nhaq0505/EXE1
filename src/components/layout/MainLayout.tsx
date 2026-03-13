import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, Menu, X, Leaf } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CartDrawer } from '../features/CartDrawer';
import { AIChatbot } from '../features/AIChatbot';
import { LoginModal } from '../features/LoginModal';
import { User as UserIcon, LogOut } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, toggleCart } = useCart();
  const { user, logout, openLoginModal } = useAuth();

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-900">
      {/* Header / Navbar */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-green-100 p-2 rounded-xl group-hover:bg-green-200 transition-colors">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900">
                  Green<span className="text-green-600">Solution</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Trang chủ
              </Link>
              <Link to="/farms" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Nông trại & Cửa hàng
              </Link>
            </nav>

            {/* Cart, Auth & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    {user.name}
                  </div>
                  <button onClick={logout} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Đăng xuất">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="hidden md:inline-flex items-center justify-center px-4 py-2 border border-green-200 shadow-sm text-sm font-medium rounded-full text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none transition-colors"
                >
                  Đăng nhập
                </button>
              )}

              <button onClick={toggleCart} className="relative p-2 text-gray-600 hover:text-green-600 transition-colors focus:outline-none">
                <ShoppingCart className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              <div className="md:hidden flex items-center">
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50"
              >
                Trang chủ
              </Link>
              <Link
                to="/farms"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50"
              >
                Nông trại & Cửa hàng
              </Link>

              <div className="border-t border-gray-100 my-2 pt-2">
                {user ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-base font-medium text-gray-700">{user.name}</span>
                    </div>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="text-red-500 text-sm font-medium px-3 py-1.5 hover:bg-red-50 rounded-md"
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { openLoginModal(); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-green-600 hover:bg-green-50"
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-6 w-6 text-green-600" />
                <span className="font-bold text-xl tracking-tight text-gray-900">
                  Green<span className="text-green-600"> Solution</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                Kết nối trực tiếp người tiêu dùng với các nông trại địa phương, mang đến thực phẩm sạch, an toàn và phát triển bền vững.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
                Liên kết nhanh
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link to="/" className="text-base text-gray-500 hover:text-gray-900">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link to="/farms" className="text-base text-gray-500 hover:text-gray-900">
                    Danh sách Nông trại
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
                Liên hệ
              </h3>
              <ul className="space-y-4">
                <li className="text-base text-gray-500">
                  Email: hello@greensolution.com
                </li>
                <li className="text-base text-gray-500">
                  Điện thoại: +84 123 456 789
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 flex items-center justify-between">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} Green Solution. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <CartDrawer />
      <AIChatbot />
      <LoginModal />
    </div>
  );
};
