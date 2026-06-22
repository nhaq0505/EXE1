import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  ClipboardList, 
  Settings as SettingsIcon, 
  LogOut, 
  ArrowLeft, 
  Menu, 
  X, 
  Leaf,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const FarmOwnerLayout: React.FC = () => {
  const { user, logout, openLoginModal } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Authentication & Authorization check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h2>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập với tài khoản Chủ vườn (FarmOwner) để truy cập trang quản trị này.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={openLoginModal}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md"
            >
              Đăng nhập ngay
            </button>
            <Link
              to="/"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Quay về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== 'FarmOwner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-6">
            Tài khoản của bạn ({user.name} - {user.role}) không có quyền truy cập vào khu vực Kênh Người Bán này.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                logout();
                openLoginModal();
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md"
            >
              Đăng nhập tài khoản khác
            </button>
            <Link
              to="/"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Quay về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/farm-owner/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/farm-owner/inventory', label: 'Kho hàng', icon: Boxes },
    { path: '/farm-owner/orders', label: 'Đơn hàng', icon: ClipboardList },
    { path: '/farm-owner/settings', label: 'Cài đặt vườn', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 sticky top-0 h-screen z-20">
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200">
          <div className="bg-green-100 p-2 rounded-xl">
            <Leaf className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="font-bold text-base text-gray-900 tracking-tight leading-none">Kênh Người Bán</h1>
            <span className="text-xs text-green-600 font-medium">Green Solution</span>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2.5 rounded-full">
              <UserIcon className="w-5 h-5 text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-green-50 text-green-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            Về trang mua sắm
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Menu Panel */}
          <div className="relative flex flex-col w-72 max-w-xs bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-250">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                <span className="font-bold text-gray-900">Kênh Người Bán</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Profile */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-green-50 text-green-700 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-2">
              <Link
                to="/"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400" />
                Về trang mua sắm
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-30 shadow-xs">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            <span className="font-bold text-gray-900">Kênh Người Bán</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-gray-500" />
          </div>
        </header>

        {/* Sub-routing Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
