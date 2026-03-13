import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount);

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
        onClick={toggleCart}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl transform transition-transform z-50 flex flex-col sm:border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            Giỏ hàng của bạn
          </h2>
          <Button variant="ghost" size="icon" onClick={toggleCart} className="rounded-full hover:bg-gray-100 active:bg-gray-200">
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <div className="bg-gray-100 p-4 rounded-full">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <p className="font-medium text-gray-600">Giỏ hàng trống</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg border border-gray-50" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                    <div className="text-green-600 font-bold text-sm mt-1">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors focus:outline-none"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors focus:outline-none"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                      title="Xóa khỏi giỏ hàng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-5 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-5">
              <span className="text-gray-600 font-medium">Tổng thanh toán:</span>
              <span className="text-2xl font-bold text-green-600">{formattedTotal}</span>
            </div>
            <Button className="w-full text-base font-semibold py-6 shadow-md" size="lg" onClick={handleCheckout}>
              Tiến hành Thanh toán
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
