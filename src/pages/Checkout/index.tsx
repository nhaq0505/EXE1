import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tính tổng tiền
  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount);

  // Xử lý submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mô phỏng gọi API mất 1.5s
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Chúc mừng! Bạn đã đặt hàng thành công. Nông sản sạch sẽ sớm được giao đến bạn!');
      clearCart();
      navigate('/');
    }, 1500);
  };

  // NẾU GIỎ HÀNG TRỐNG
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="bg-gray-50 p-6 rounded-full mb-6">
          <ShoppingCart className="w-16 h-16 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ. Hãy dạo quanh các trang trại và xem thử các sản phẩm tươi sống nhé!
        </p>
        <Link to="/farms">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="w-5 h-5" />
            Quay lại Cửa hàng
          </Button>
        </Link>
      </div>
    );
  }

  // NẾU GIỎ HÀNG CÓ ĐỒ
  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán an toàn</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT 1: THÔNG TIN GIAO HÀNG (Chiếm 7 phần) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-xl">Thông tin nhận hàng</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                      <input 
                        required 
                        type="text" 
                        id="name" 
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                      <input 
                        required 
                        type="tel" 
                        id="phone" 
                        placeholder="0912 345 678"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="address" className="text-sm font-medium text-gray-700">Địa chỉ giao hàng <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      type="text" 
                      id="address" 
                      placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="notes" className="text-sm font-medium text-gray-700">Ghi chú thêm</label>
                    <textarea 
                      id="notes" 
                      rows={3}
                      placeholder="Giao trong giờ hành chính, gọi trước khi giao..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* CỘT 2: TÓM TẮT ĐƠN HÀNG (Chiếm 5 phần) */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24">
              <Card className="shadow-md border-green-100 overflow-hidden">
                <CardHeader className="bg-green-50 border-b border-green-100 pb-4">
                  <CardTitle className="text-xl text-green-800 flex items-center justify-between">
                    Đơn hàng của bạn
                    <span className="bg-green-600 text-white text-sm px-2.5 py-0.5 rounded-full">
                      {cart.length} sản phẩm
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Danh sách List Thu Gọn */}
                  <div className="max-h-[40vh] overflow-y-auto px-6 py-2">
                    <ul className="divide-y divide-gray-100">
                      {cart.map((item) => (
                        <li key={item.id} className="py-4 flex justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="relative">
                              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                              <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                {item.quantity}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">{item.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">{item.unit}</p>
                            </div>
                          </div>
                          <div className="text-right font-medium text-gray-900 shrink-0">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tổng kết tiền */}
                  <div className="bg-gray-50 p-6 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                      <span>Tạm tính</span>
                      <span>{formattedTotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                      <span>Phí vận chuyển</span>
                      <span className="text-green-600 font-medium">Miễn phí</span>
                    </div>
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                      <span className="text-3xl font-black text-green-600">{formattedTotal}</span>
                    </div>

                    {user ? (
                      <Button 
                        type="submit" 
                        form="checkout-form"
                        size="lg" 
                        className="w-full text-base py-6 shadow-md"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Xác nhận Đặt hàng
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        onClick={openLoginModal}
                        size="lg" 
                        className="w-full text-base py-6 shadow-md bg-gray-800 hover:bg-gray-900 border-none text-white"
                      >
                        Đăng nhập để Thanh toán
                      </Button>
                    )}
                    <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
                      Bằng việc đặt hàng, bạn đồng ý với Điều khoản của chúng tôi.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
