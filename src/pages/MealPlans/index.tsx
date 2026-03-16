import { mealPlans } from '../../mocks/mockData';
import { MealPlanCard } from '../../components/features/MealPlanCard';
import { Sparkles, Leaf, Recycle, TrendingDown } from 'lucide-react';

const highlights = [
  { icon: Leaf, label: 'Định lượng chính xác', desc: 'Cân đúng Kcal cho từng thành viên' },
  { icon: Sparkles, label: 'Dinh dưỡng khoa học', desc: 'Cân bằng đạm – tinh bột – chất béo' },
  { icon: TrendingDown, label: 'Tiết kiệm tối đa', desc: 'Gom đơn chung cư, giảm giá 20–30%' },
  { icon: Recycle, label: 'Zero Waste', desc: 'Nguyên liệu dùng hết, không lãng phí' },
];

const MealPlans: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">
            ✨ Green Solution · Smart Meal Planner
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            Thực Đơn Thông Minh
          </h1>
          <p className="text-green-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Định lượng chính xác · Dinh dưỡng khoa học · Tiết kiệm tối đa · Zero Waste
          </p>
        </div>
      </section>

      {/* Highlight strip */}
      <section className="bg-white border-b border-gray-200 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {highlights.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="bg-green-100 p-2.5 rounded-xl flex-shrink-0">
                <Icon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meal plan grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chọn thực đơn phù hợp</h2>
            <p className="text-gray-500 text-sm mt-1">4 gói được thiết kế riêng theo quy mô gia đình</p>
          </div>
          <span className="hidden md:inline-block bg-green-50 text-green-700 text-xs font-semibold border border-green-200 px-4 py-2 rounded-full">
            {mealPlans.length} gói thực đơn
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mealPlans.map((plan) => (
            <MealPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default MealPlans;
