import { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  User as UserIcon, 
  MapPin, 
  Phone, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { farmOwnerService, type FarmOrder } from '../../services/farmOwnerService';

export default function Orders() {
  const [orders, setOrders] = useState<FarmOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('All');

  const loadOrders = async () => {
    try {
      const data = await farmOwnerService.getOrders();
      // Sort orders by date descending
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sorted);
    } catch (err) {
      console.error('Failed to load farm orders:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrders();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const updated = await farmOwnerService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày ${d.toLocaleDateString('vi-VN')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-100">
            <Clock className="w-3.5 h-3.5" /> Chờ xác nhận
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <Truck className="w-3.5 h-3.5" /> Đang chuẩn bị
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã giao hàng
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
            <XCircle className="w-3.5 h-3.5" /> Đã hủy bỏ
          </span>
        );
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const tabs = [
    { key: 'All', label: 'Tất cả' },
    { key: 'Pending', label: 'Chờ xác nhận' },
    { key: 'Processing', label: 'Đang chuẩn bị' },
    { key: 'Delivered', label: 'Đã giao hàng' },
    { key: 'Cancelled', label: 'Đã hủy' }
  ];

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý Đơn hàng</h1>
          <p className="text-gray-500 mt-1">
            Xác nhận đơn, theo dõi quá trình đóng gói nông sản và giao hàng tới người mua.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm inline-flex items-center gap-2 text-sm font-semibold text-gray-600 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key 
                ? 'border-green-600 text-green-700' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label} ({
              tab.key === 'All' 
                ? orders.length 
                : orders.filter(o => o.status === tab.key).length
            })
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-sm font-medium">Đang tải danh sách đơn hàng nông trại...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden hover:shadow-sm transition-shadow"
            >
              {/* Order Card Top Info */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900 text-base">Đơn hàng #{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Đặt lúc: {formatDate(order.createdAt)}
                  </p>
                </div>
                
                {/* Status action buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  {order.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Processing')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Chuẩn bị hàng
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                        className="px-4 py-2 border border-red-200 text-red-650 hover:bg-red-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Hủy đơn
                      </button>
                    </>
                  )}
                  {order.status === 'Processing' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Xác nhận đã giao
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                        className="px-4 py-2 border border-red-200 text-red-650 hover:bg-red-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Hủy đơn
                      </button>
                    </>
                  )}
                  {order.status === 'Delivered' && (
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                      Giao dịch hoàn tất
                    </span>
                  )}
                  {order.status === 'Cancelled' && (
                    <span className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                      Đơn đã bị hủy
                    </span>
                  )}
                </div>
              </div>

              {/* Order Card Content */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-gray-250">
                {/* Column 1: Customer Details */}
                <div className="lg:pr-6 space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Thông tin người nhận
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-150 p-2 rounded-xl text-gray-500">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-gray-900">{order.receiverName}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-gray-150 p-2 rounded-xl text-gray-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span>{order.phone}</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-gray-150 p-2 rounded-xl text-gray-500 shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="leading-snug">{order.address}</span>
                    </div>

                    {order.notes && (
                      <div className="flex items-start gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50 text-xs">
                        <div className="text-amber-600 shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-amber-800">
                          <strong>Ghi chú:</strong> {order.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Order Items Basket from Farm */}
                <div className="pt-6 lg:pt-0 lg:px-6 lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Giỏ hàng nông sản ({order.items.length})
                  </h3>
                  
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.productName} 
                              className="w-12 h-12 rounded-lg object-cover border border-gray-150"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-bold text-sm">
                              GS
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 text-sm leading-tight">{item.productName}</p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(item.price)} / {item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total Price */}
                  <div className="border-t border-gray-150 pt-4 flex justify-between items-center bg-gray-50/50 -mx-6 -mb-6 px-6 py-4">
                    <span className="font-semibold text-gray-600 text-sm">Tổng cộng thanh toán:</span>
                    <span className="text-lg font-black text-green-650">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <ClipboardList className="w-12 h-12 text-gray-350 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-950 mb-1">Không có đơn hàng nào</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Hiện tại nông trại của bạn chưa có đơn hàng nào thuộc trạng thái này.
          </p>
        </div>
      )}
    </div>
  );
}
