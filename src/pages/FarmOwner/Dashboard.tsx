import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Boxes, 
  ShoppingBag, 
  AlertTriangle, 
  Loader2, 
  Plus, 
  Calendar,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { farmOwnerService, type FarmStatistics } from '../../services/farmOwnerService';
import { type Product } from '../../mocks/mockData';

export default function Dashboard() {
  const [stats, setStats] = useState<FarmStatistics | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [fetchedStats, fetchedProducts] = await Promise.all([
        farmOwnerService.getStatistics(),
        farmOwnerService.getProducts()
      ]);
      setStats(fetchedStats);
      
      // Filter products low on stock (stock <= 5)
      const lowStock = fetchedProducts.filter(p => p.stock <= 5);
      setLowStockProducts(lowStock);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        <p className="text-sm font-medium">Đang tải số liệu thống kê vườn...</p>
      </div>
    );
  }

  // Sample data for breakdown of revenue
  const revenueBreakdown = [
    { name: 'Rau Củ Hữu Cơ', amount: 5500000, percentage: 55, color: 'bg-green-500' },
    { name: 'Trái Cây Sạch', amount: 3000000, percentage: 30, color: 'bg-orange-400' },
    { name: 'Gia Vị & Khác', amount: 1500000, percentage: 15, color: 'bg-blue-400' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Kênh Quản Trị Vườn</h1>
          <p className="text-gray-500 mt-1">
            Chào mừng trở lại! Xem hiệu suất hoạt động nông trại của bạn hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm inline-flex items-center gap-2 text-sm font-medium text-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <Link
            to="/farm-owner/inventory"
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-md inline-flex items-center gap-2 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Cards Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-400">Doanh thu vườn</span>
            <p className="text-2xl font-black text-gray-900 leading-none">
              {stats ? formatCurrency(stats.revenue) : '0 ₫'}
            </p>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12.5%
            </span>
          </div>
          <div className="p-4 bg-green-50 rounded-2xl text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-400">Đang bán lẻ</span>
            <p className="text-2xl font-black text-gray-900 leading-none">
              {stats ? stats.activeProductsCount : 0} <span className="text-base font-normal text-gray-400">loại</span>
            </p>
            <span className="text-xs text-gray-500">
              Tổng sản phẩm hoạt động
            </span>
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-400">Đơn cần giao</span>
            <p className="text-2xl font-black text-gray-900 leading-none">
              {stats ? stats.pendingOrdersCount : 0} <span className="text-base font-normal text-gray-400">đơn</span>
            </p>
            <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
              Chờ xử lý & đóng gói
            </span>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-400">Sắp hết hàng</span>
            <p className="text-2xl font-black text-gray-900 leading-none">
              {stats ? stats.lowStockCount : 0} <span className="text-base font-normal text-gray-400">mặt hàng</span>
            </p>
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Tồn kho ≤ 5
            </span>
          </div>
          <div className="p-4 bg-red-50 rounded-2xl text-red-650">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Revenue chart / breakdown list */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Phân cơ cấu doanh thu thực tế</h2>
            </div>
            <span className="text-xs font-semibold text-gray-400 inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Tháng này
            </span>
          </div>

          {/* Sizing bar graphics */}
          <div className="space-y-4">
            <div className="h-6 w-full rounded-full bg-gray-100 overflow-hidden flex">
              {revenueBreakdown.map((item, index) => (
                <div 
                  key={index}
                  className={`${item.color} h-full first:rounded-l-full last:rounded-r-full`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.name}: ${item.percentage}%`}
                />
              ))}
            </div>

            {/* List describing structure */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {revenueBreakdown.map((item, index) => (
                <div key={index} className="p-4 rounded-xl bg-gray-55/50 border border-gray-100 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                  </div>
                  <p className="text-lg font-black text-gray-900 pl-5">
                    {formatCurrency(item.amount)}
                  </p>
                  <span className="text-xs text-gray-400 pl-5">{item.percentage}% tổng doanh thu</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simple Dashboard Sales Insights */}
          <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100/50 mt-4">
            <h3 className="text-sm font-bold text-green-800 mb-1">Gợi ý từ Trợ lý AI nông trại</h3>
            <p className="text-xs text-green-700 leading-relaxed">
              Rau củ hữu cơ chiếm 55% tổng doanh thu của vườn trong 30 ngày qua. Nhóm hàng "Xà lách tươi" đang có tốc độ bán tăng 20%, bạn nên bổ sung thêm diện tích thu hoạch vào tuần tới để tối ưu doanh số.
            </p>
          </div>
        </div>

        {/* Right Column: Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-900">Sản phẩm sắp hết hàng</h2>
            </div>
            <span className="text-xs font-semibold text-red-650 bg-red-50 px-2 py-0.5 rounded-full">
              Cần thu hoạch gấp
            </span>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {lowStockProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50/20 hover:bg-red-50/40 transition-colors"
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-12 h-12 rounded-lg object-cover border border-gray-150"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-red-650 bg-red-50 px-2 py-1 rounded-lg">
                      Còn {product.stock} {product.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm font-medium">Tuyệt vời! Tất cả sản phẩm đều đủ lượng tồn kho.</p>
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/farm-owner/inventory"
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 text-sm font-semibold transition-all inline-flex items-center justify-center gap-2"
            >
              Quản lý kho hàng <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
