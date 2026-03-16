import { useState } from 'react';
import { CheckCircle, Camera, Users, Flame, ShoppingCart, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import type { MealPlan } from '../../mocks/mockData';
import { menuIngredients, products } from '../../mocks/mockData';
import { useCart } from '../../context/CartContext';

interface MealPlanCardProps {
  plan: MealPlan;
}

export const MealPlanCard: React.FC<MealPlanCardProps> = ({ plan }) => {
  const { addToCart, toggleCart } = useCart();
  const [added, setAdded] = useState(false);

  // Tính giá thực tế từ các sản phẩm trong menuIngredients
  const ingredientIds = menuIngredients[plan.id] ?? [];
  const ingredientProducts = ingredientIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  const realTotalPrice = ingredientProducts.reduce((sum, p) => sum + p.price, 0);
  const formattedPrice = realTotalPrice.toLocaleString('vi-VN');

  const handleAddMenuToCart = () => {
    if (ingredientProducts.length === 0) return;

    ingredientProducts.forEach((product) => {
      addToCart(product);
    });

    // Visual feedback on the button
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);

    // Auto-open the cart drawer so the user sees the items fly in
    setTimeout(() => {
      toggleCart();
    }, 300);
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 overflow-hidden group">
      {/* Coloured top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-400 w-full" />

      <CardHeader className="pb-3">
        {/* Audience pill */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1">
            <Users className="w-3.5 h-3.5" />
            {plan.targetAudience}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-green-700 transition-colors">
          {plan.title}
        </h3>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2 mt-3">
          {/* Calories badge (orange) */}
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-3 py-1">
            <Flame className="w-3.5 h-3.5" />
            {plan.calories.toLocaleString()} Kcal / ngày
          </span>

          {/* Feature badges (green) */}
          {plan.features.map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1"
            >
              {feature}
            </span>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        {/* Dish list */}
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Thực đơn trong ngày
        </h4>
        <ul className="space-y-2">
          {plan.dishes.map((dish) => (
            <li key={dish} className="flex items-start gap-2.5 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{dish}</span>
            </li>
          ))}
        </ul>

        {/* Ingredient count indicator */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <PackageCheck className="w-4 h-4 text-green-400" />
          <span>
            {(menuIngredients[plan.id] ?? []).length} nguyên liệu được định lượng sẵn
          </span>
        </div>

        {/* Visual Trust block */}
        <Link
          to="/farms"
          className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 hover:border-green-300 transition-colors group/link"
        >
          <div className="bg-green-100 p-2 rounded-lg flex-shrink-0 group-hover/link:bg-green-200 transition-colors">
            <Camera className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-green-800">Cam kết nguồn gốc</p>
            <p className="text-xs text-green-600 leading-snug">
              Xem livestream từ trang trại đối tác →
            </p>
          </div>
        </Link>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3 border-t border-gray-100 pt-5">
        {/* Price */}
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-gray-500 font-medium">Nguyên liệu ước tính</span>
          <span className="text-xl font-extrabold text-green-700">
            {formattedPrice}&nbsp;<span className="text-sm font-semibold">₫</span>
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleAddMenuToCart}
          disabled={added}
          className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-md text-sm
            ${added
              ? 'bg-emerald-500 hover:bg-emerald-500 text-white scale-95 cursor-default'
              : 'bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white hover:shadow-lg'
            }`}
        >
          {added ? (
            <>
              <PackageCheck className="w-5 h-5 animate-bounce" />
              Đã thêm {(menuIngredients[plan.id] ?? []).length} nguyên liệu vào giỏ! 🎉
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              🛒 Thêm nguyên liệu vào giỏ
            </>
          )}
        </button>
      </CardFooter>
    </Card>
  );
};
