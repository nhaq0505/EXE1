import { useEffect, useState } from 'react';
import { adminService, type DashboardResponse } from '../../services/adminService';
import { Card, CardContent } from '../../components/ui/Card';
import { DollarSign, ShoppingBag, Users, Layers, Award, ArrowUpRight, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const statCards = [
    {
      title: 'Tổng doanh thu',
      value: stats ? formatCurrency(stats.totalRevenue) : '0 ₫',
      icon: DollarSign,
      color: 'bg-emerald-500 text-white',
      desc: 'Chỉ tính các đơn đã thanh toán'
    },
    {
      title: 'Tổng đơn hàng',
      value: stats ? stats.totalOrders.toLocaleString() : '0',
      icon: ShoppingBag,
      color: 'bg-blue-500 text-white',
      desc: 'Tất cả trạng thái đơn hàng'
    },
    {
      title: 'Khách hàng đăng ký',
      value: stats ? stats.totalUsers.toLocaleString() : '0',
      icon: Users,
      color: 'bg-purple-500 text-white',
      desc: 'Tài khoản người dùng (role: User)'
    },
    {
      title: 'Top Nông sản bán chạy',
      value: stats ? stats.bestSellers.length.toString() : '0',
      icon: Award,
      color: 'bg-amber-500 text-white',
      desc: 'Sản phẩm có doanh thu tốt nhất'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-500 text-sm">Xem số liệu thống kê và hoạt động toàn sàn Green Solution</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="border-gray-150 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-xl shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-gray-400 text-[11px] mt-4 flex items-center gap-1 font-medium">{card.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Stats Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Sellers */}
        <Card className="lg:col-span-2 border-gray-150">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-bold text-lg text-gray-900">Nông sản bán chạy nhất</h2>
                <p className="text-gray-500 text-xs">Top 5 nông sản dẫn đầu doanh số bán trên sàn</p>
              </div>
              <Link to="/admin/products" className="text-green-600 hover:text-green-700 text-xs font-bold flex items-center gap-1">
                Xem sản phẩm <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase">
                    <th className="py-3 px-2">Nông sản</th>
                    <th className="py-3 px-2 text-center">Đã bán</th>
                    <th className="py-3 px-2 text-right">Tổng doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats && stats.bestSellers.length > 0 ? (
                    stats.bestSellers.map((item, idx) => (
                      <tr key={idx} className="text-sm hover:bg-gray-50/50">
                        <td className="py-4 px-2 font-semibold text-gray-900">{item.productName}</td>
                        <td className="py-4 px-2 text-center text-gray-600 font-medium">{item.quantitySold}</td>
                        <td className="py-4 px-2 text-right text-emerald-600 font-bold">{formatCurrency(item.totalRevenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-gray-500 text-sm">Chưa có số liệu bán hàng</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Operations / Quick Links */}
        <Card className="border-gray-150">
          <CardContent className="p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Lối tắt quản trị</h2>
            <div className="space-y-3">
              <Link to="/admin/farms" className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-green-50/50 border border-gray-100 hover:border-green-150 rounded-xl transition-all group">
                <div className="bg-green-100 text-green-600 p-2.5 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Quản lý nông trại</p>
                  <p className="text-xs text-gray-400">Xem và sửa thông tin nông trại</p>
                </div>
              </Link>

              <Link to="/admin/products" className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-green-50/50 border border-gray-100 hover:border-green-150 rounded-xl transition-all group">
                <div className="bg-green-100 text-green-600 p-2.5 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Quản lý kho hàng</p>
                  <p className="text-xs text-gray-400">Cập nhật tồn kho sản phẩm</p>
                </div>
              </Link>

              <Link to="/admin/orders" className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-green-50/50 border border-gray-100 hover:border-green-150 rounded-xl transition-all group">
                <div className="bg-green-100 text-green-600 p-2.5 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Quản lý đơn hàng</p>
                  <p className="text-xs text-gray-400">Duyệt và theo dõi giao hàng</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
