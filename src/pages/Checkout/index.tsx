import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle, ArrowLeft, Leaf, PartyPopper, Home } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

// ────────────────────────────────────────────────────────────────────────────────
// Success Screen Component
// ────────────────────────────────────────────────────────────────────────────────
function OrderSuccessScreen({ total, onGoHome }: { total: string; onGoHome: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Animated checkmark */}
        <div className="relative inline-flex items-center justify-center mb-8">
          {/* Outer pulse ring */}
          <span className="absolute inline-flex h-40 w-40 rounded-full bg-green-200 opacity-60 animate-ping" />
          {/* Middle ring */}
          <span className="absolute inline-flex h-32 w-32 rounded-full bg-green-300 opacity-50" />
          {/* Inner circle */}
          <div className="relative z-10 flex items-center justify-center w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl">
            <CheckCircle className="w-14 h-14 text-white drop-shadow-lg" strokeWidth={2.5} />
          </div>
        </div>

        {/* Celebration icon */}
        <div className="flex justify-center gap-2 mb-4 text-3xl animate-bounce">
          <PartyPopper className="w-8 h-8 text-yellow-500" />
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          Đặt hàng thành công! 🎉
        </h1>
        <p className="text-gray-500 text-base mb-2">
          Cảm ơn bạn đã tin tưởng <span className="font-bold text-green-600">Green Solution</span>.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Nông sản sạch sẽ được giao đến bạn sớm nhất có thể!
        </p>

        {/* Order summary box */}
        <div className="bg-white border border-green-100 rounded-2xl shadow-md p-5 mb-8 text-left space-y-3">
          <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-1">
            <Leaf className="w-4 h-4" />
            Chi tiết đơn hàng
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tổng thanh toán</span>
            <span className="font-bold text-gray-900">{total}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Phí vận chuyển</span>
            <span className="text-green-600 font-medium">Miễn phí 🚚</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Dự kiến giao hàng</span>
            <span className="font-medium text-gray-900">2 – 4 giờ</span>
          </div>
          <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 text-center">
            Mã đơn hàng: <span className="font-mono font-semibold text-gray-500">GS-{Date.now().toString().slice(-6)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/farms" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 font-semibold py-3 px-5 rounded-xl transition-all">
              <ShoppingCart className="w-4 h-4" />
              Tiếp tục mua sắm
            </button>
          </Link>
          <button
            onClick={onGoHome}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-5 rounded-xl shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            Về Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Main Checkout Page
// ────────────────────────────────────────────────────────────────────────────────
export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [savedTotal, setSavedTotal] = useState('');

  // Scroll lên đầu trang khi vào Checkout
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSavedTotal(formattedTotal); // lưu lại trước khi clearCart
      clearCart();
      setOrderPlaced(true);
    }, 1500);
  };

  // ── SUCCESS SCREEN ──
  if (orderPlaced) {
    return (
      <OrderSuccessScreen
        total={savedTotal}
        onGoHome={() => navigate('/')}
      />
    );
  }

  // ── EMPTY CART ──
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="bg-gray-50 p-6 rounded-full mb-6">
          <ShoppingCart className="w-16 h-16 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ. Hãy dạo quanh các trang trại nhé!
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

  // ── CHECKOUT FORM ──
  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán an toàn</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Cột 1: Thông tin giao hàng */}
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
                      <input required type="text" id="name" placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                      <input required type="tel" id="phone" placeholder="0912 345 678"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="address" className="text-sm font-medium text-gray-700">Địa chỉ giao hàng <span className="text-red-500">*</span></label>
                    <input required type="text" id="address" placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="notes" className="text-sm font-medium text-gray-700">Ghi chú thêm</label>
                    <textarea id="notes" rows={3} placeholder="Giao trong giờ hành chính, gọi trước khi giao..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none" />
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Cột 2: Tóm tắt đơn hàng */}
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
                      <Button type="submit" form="checkout-form" size="lg"
                        className="w-full text-base py-6 shadow-md" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
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
                      <Button type="button" onClick={openLoginModal} size="lg"
                        className="w-full text-base py-6 shadow-md bg-gray-800 hover:bg-gray-900 border-none text-white">
                        Đăng nhập để Thanh toán
                      </Button>
                    )}

                    <p className="text-xs text-center text-gray-500 mt-4">
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
