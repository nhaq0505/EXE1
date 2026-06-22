import { useEffect, useState } from 'react';
import { adminService, type AdminOrder } from '../../services/adminService';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Search, 
  X, 
  Loader2, 
  ClipboardList,
  User,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Status tab filtering
  const [activeTab, setActiveTab] = useState('All');
  
  // Modal details state
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const tabs = [
    { key: 'All', label: 'Tất cả đơn' },
    { key: 'Pending', label: 'Chờ thanh toán' },
    { key: 'Confirmed', label: 'Đã xác nhận' },
    { key: 'Preparing', label: 'Đang chuẩn bị' },
    { key: 'Shipping', label: 'Đang giao' },
    { key: 'Delivered', label: 'Đã giao' },
    { key: 'Cancelled', label: 'Đã hủy' }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response: any = await adminService.getOrders();
      if (response && Array.isArray(response.items)) {
        setOrders(response.items);
      } else if (Array.isArray(response)) {
        setOrders(response);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const updated = await adminService.updateOrderStatus(selectedOrder.id, status);
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: updated.status, paymentStatus: updated.paymentStatus } : o));
      setSelectedOrder({ ...selectedOrder, status: updated.status, paymentStatus: updated.paymentStatus });
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper styles for statuses
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Chờ thanh toán</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Đã xác nhận</Badge>;
      case 'preparing':
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Đang chuẩn bị</Badge>;
      case 'shipping':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200">Đang giao hàng</Badge>;
      case 'delivered':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-250">Đã giao</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Đã hủy</Badge>;
      default:
        return <Badge className="bg-gray-55 text-gray-700">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (pStatus: string) => {
    switch (pStatus.toLowerCase()) {
      case 'pending':
        return <span className="text-yellow-600 font-bold">Chưa trả</span>;
      case 'paid':
        return <span className="text-emerald-600 font-bold">Đã thanh toán</span>;
      case 'failed':
        return <span className="text-red-650 font-bold">Thất bại</span>;
      case 'cancelled':
        return <span className="text-red-500 font-bold">Đã hủy</span>;
      default:
        return <span className="text-gray-500 font-bold">{pStatus}</span>;
    }
  };

  // Filtering
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.phone.includes(searchQuery) ||
                          (o.id && o.id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = activeTab === 'All' || o.status.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin rounded-full h-12 w-12 text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng hệ thống</h1>
        <p className="text-gray-500 text-sm">Theo dõi và phê duyệt tất cả các đơn hàng, giao dịch PayOS trên toàn hệ thống Green Solution</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key 
                ? 'border-green-600 text-green-600 font-extrabold' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="border-gray-150">
        <CardContent className="p-6 space-y-4">
          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm theo khách hàng, số điện thoại, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none rounded-xl text-sm transition-all"
            />
          </div>

          {/* List Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[11px] font-bold uppercase border-b border-gray-100">
                  <th className="py-3 px-4">Đơn hàng ID</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4 text-right">Tổng thanh toán</th>
                  <th className="py-3 px-4 text-center">Thanh toán</th>
                  <th className="py-3 px-4 text-center">Trạng thái giao</th>
                  <th className="py-3 px-4">Ngày đặt</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/40">
                      <td className="py-3 px-4 font-medium text-gray-500">
                        <span className="truncate block max-w-[80px]" title={order.id}>{order.id}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {order.receiverName}
                      </td>
                      <td className="py-3 px-4 text-gray-650 font-medium">
                        {order.phone}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-extrabold">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getPaymentStatusBadge(order.paymentStatus || 'Pending')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          onClick={() => handleOpenDetails(order)}
                          className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                      Không tìm thấy đơn hàng nào khớp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Popup Chi tiết đơn hàng & Phê duyệt */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-150 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-green-600" /> Chi tiết đơn hàng
                </h2>
                <p className="text-gray-400 text-[10px] font-medium mt-0.5">Mã ID: {selectedOrder.id}</p>
              </div>
              <button 
                onClick={handleCloseDetails}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Order Info Cards Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Receiver Info */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2.5 text-xs font-semibold">
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 border-b border-gray-200/60 pb-1.5">
                    <User className="w-3.5 h-3.5 text-green-600" /> Thông tin người nhận
                  </p>
                  <p className="text-gray-800 text-sm font-extrabold">{selectedOrder.receiverName}</p>
                  <p className="text-gray-650 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedOrder.phone}
                  </p>
                  <p className="text-gray-650 flex items-start gap-2 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" /> 
                    <span>{selectedOrder.address}</span>
                  </p>
                  {selectedOrder.notes && (
                    <p className="text-gray-500 flex items-start gap-2 italic leading-relaxed border-t border-gray-200/50 pt-2 font-normal">
                      <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-450" />
                      <span>Ghi chú: {selectedOrder.notes}</span>
                    </p>
                  )}
                </div>

                {/* Status & Billing */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3 text-xs font-semibold">
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 border-b border-gray-200/60 pb-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-green-600" /> Trạng thái & Hóa đơn
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-550">Giao hàng:</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-550">Thanh toán:</span>
                    {getPaymentStatusBadge(selectedOrder.paymentStatus || 'Pending')}
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-200/60 pt-2">
                    <span className="text-gray-550">Ngày đặt:</span>
                    <span className="text-gray-700 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-gray-200/60 pt-2">
                    <span className="text-gray-900 font-bold">Tổng thanh toán:</span>
                    <span className="text-emerald-600 font-extrabold text-base">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-2">
                <p className="text-xs font-extrabold text-gray-700">Danh sách nông sản trong đơn:</p>
                <div className="border border-gray-150 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 font-bold uppercase">
                        <th className="py-2.5 px-4">Tên sản phẩm</th>
                        <th className="py-2.5 px-4 text-center">Đơn giá</th>
                        <th className="py-2.5 px-4 text-center">Số lượng</th>
                        <th className="py-2.5 px-4 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-3 px-4 font-bold text-gray-900">{item.productName}</td>
                            <td className="py-3 px-4 text-center text-gray-650">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-3 px-4 text-center text-gray-800 font-extrabold">x{item.quantity}</td>
                            <td className="py-3 px-4 text-right text-emerald-600 font-extrabold">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-gray-400">Không có sản phẩm hiển thị</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Webhook/PayOS Checkout URL details if Pending */}
              {selectedOrder.status.toLowerCase() === 'pending' && selectedOrder.checkoutUrl && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                  <div>
                    <p>Khách hàng chưa thanh toán đơn hàng này.</p>
                    <a 
                      href={selectedOrder.checkoutUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="underline text-blue-700 hover:text-blue-900 block mt-1"
                    >
                      Bấm vào đây để đi tới trang thanh toán PayOS thử nghiệm
                    </a>
                  </div>
                </div>
              )}

              {/* PHÊ DUYỆT TRẠNG THÁI ĐƠN HÀNG (ADMIN CONTROLS) */}
              <div className="border-t border-gray-150 pt-4 space-y-3 bg-gray-50 p-4 rounded-xl border">
                <p className="text-xs font-bold text-gray-700">Phê duyệt & cập nhật trạng thái giao hàng (Cổng Admin):</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isUpdating || selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Delivered'}
                    onClick={() => handleUpdateStatus('Confirmed')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer border-none"
                  >
                    Duyệt đơn (Confirm)
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating || selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Delivered'}
                    onClick={() => handleUpdateStatus('Preparing')}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer border-none"
                  >
                    Chuẩn bị hàng (Prepare)
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating || selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Delivered'}
                    onClick={() => handleUpdateStatus('Shipping')}
                    className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-650 text-white rounded-lg text-xs font-bold active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer border-none"
                  >
                    Giao hàng (Ship)
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating || selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Delivered'}
                    onClick={() => handleUpdateStatus('Delivered')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer border-none"
                  >
                    Đã giao hàng (Deliver)
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating || selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Delivered'}
                    onClick={() => handleUpdateStatus('Cancelled')}
                    className="px-3.5 py-1.5 bg-red-650 hover:bg-red-750 text-white rounded-lg text-xs font-bold active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer border-none"
                  >
                    Hủy đơn hàng (Cancel)
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">Lưu ý: Hủy đơn hàng sẽ tự động khôi phục hoàn lại số lượng tồn kho (Stock) của nông sản tương ứng.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-150 flex justify-end shrink-0 bg-gray-50/50 rounded-b-2xl">
              <Button 
                onClick={handleCloseDetails} 
                className="bg-gray-250 hover:bg-gray-300 text-gray-700 font-bold text-xs py-2 px-5 cursor-pointer border-none"
              >
                Đóng lại
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
