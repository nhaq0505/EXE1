import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  ClipboardList, 
  LogOut, 
  ArrowLeft, 
  Menu, 
  X, 
  Leaf,
  User as UserIcon,
  ShieldAlert,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout, openLoginModal } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Authentication & Authorization check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-2xl border border-gray-800">
          <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu quản trị</h2>
          <p className="text-gray-600 mb-6 font-medium">
            Vui lòng đăng nhập với tài khoản Quản trị viên (Admin) để truy cập trang quản trị này.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={openLoginModal}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-95"
            >
              Đăng nhập Admin
            </button>
            <Link
              to="/"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all inline-flex items-center justify-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> Quay về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-2xl border border-gray-800">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Truy cập bị từ chối (403)</h2>
          <p className="text-gray-600 mb-6 font-medium text-sm leading-relaxed">
            Tài khoản của bạn ({user.name} - {user.role}) không có quyền truy cập vào cổng quản trị hệ thống tối cao này.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                logout();
                openLoginModal();
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-95"
            >
              Đăng nhập tài khoản Admin
            </button>
            <Link
              to="/"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all inline-flex items-center justify-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> Quay về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/admin/farms', label: 'Nông trại', icon: Leaf },
    { path: '/admin/products', label: 'Sản phẩm', icon: Boxes },
    { path: '/admin/meal-plans', label: 'Thực đơn mẫu', icon: ClipboardList },
    { path: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Desktop - Sleek Dark Theme */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 border-r border-gray-800 sticky top-0 h-screen z-20 text-gray-300">
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-800 bg-gray-950">
          <div className="bg-green-900/50 p-2 rounded-xl border border-green-600/30">
            <Leaf className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight leading-none">QUẢN TRỊ HỆ THỐNG</h1>
            <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Green Solution</span>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-5 border-b border-gray-800 bg-gray-950/40">
          <div className="flex items-center gap-3">
            <div className="bg-gray-800 p-2.5 rounded-full border border-gray-700">
              <UserIcon className="w-5 h-5 text-gray-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-green-400 font-bold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/admin/dashboard' && location.pathname === '/admin');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/25 border-l-4 border-green-400' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2 bg-gray-950/20">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            Về trang mua sắm
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Menu Panel */}
          <div className="relative flex flex-col w-72 max-w-xs bg-gray-900 h-full shadow-2xl animate-in slide-in-from-left duration-200 text-gray-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-950">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-400" />
                <span className="font-bold text-white text-sm">QUẢN TRỊ HỆ THỐNG</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Profile */}
            <div className="px-6 py-5 border-b border-gray-800 bg-gray-950/40">
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-full border border-gray-700">
                  <UserIcon className="w-5 h-5 text-gray-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path === '/admin/dashboard' && location.pathname === '/admin');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-800 space-y-2 bg-gray-950/20">
              <Link
                to="/"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-gray-500" />
                Về trang mua sắm
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-gray-900 text-white h-16 flex items-center justify-between px-4 sticky top-0 z-30 shadow-md">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 hover:bg-gray-800 rounded-lg text-gray-350"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-400" />
            <span className="font-bold text-sm tracking-tight text-white">QUẢN TRỊ HỆ THỐNG</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
            <UserIcon className="w-4 h-4 text-gray-300" />
          </div>
        </header>

        {/* Sub-routing Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
