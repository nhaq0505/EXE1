import { useEffect, useState } from 'react';
import { adminService, type AdminProduct, type AdminMealPlan } from '../../services/adminService';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Plus, 
  Edit2, 
  Search, 
  X, 
  Loader2, 
  CheckCircle2, 
  Trash2,
  AlertTriangle,
  Utensils
} from 'lucide-react';

export default function MealPlans() {
  const [mealPlans, setMealPlans] = useState<AdminMealPlan[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMealPlan, setEditingMealPlan] = useState<AdminMealPlan | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [calories, setCalories] = useState(1500);
  const [dishesText, setDishesText] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, prodsData] = await Promise.all([
        adminService.getMealPlans(),
        adminService.getProducts()
      ]);
      setMealPlans(plansData);
      setProducts(prodsData);
    } catch (err) {
      console.error('Failed to load meal plans/products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan: AdminMealPlan | null = null) => {
    setFormErrors({});
    setMessage(null);
    if (plan) {
      setEditingMealPlan(plan);
      setTitle(plan.title);
      setTargetAudience(plan.targetAudience);
      setCalories(plan.calories);
      setDishesText(Array.isArray(plan.dishes) ? plan.dishes.join('\n') : '');
      setFeaturesText(Array.isArray(plan.features) ? plan.features.join(', ') : '');
      
      // Map existing ingredients to selected product IDs
      const ingredientIds = plan.ingredients ? plan.ingredients.map((i: any) => i.id) : [];
      setSelectedProductIds(ingredientIds);
      
      setIsActive(plan.isActive);
    } else {
      setEditingMealPlan(null);
      setTitle('');
      setTargetAudience('Gia đình 3-4 người');
      setCalories(1800);
      setDishesText('');
      setFeaturesText('Zero Waste, Tối ưu Dinh dưỡng, Gom đơn chung cư');
      setSelectedProductIds([]);
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMealPlan(null);
  };

  // Toggle select product ingredient
  const handleToggleProduct = (prodId: string) => {
    if (selectedProductIds.includes(prodId)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== prodId));
    } else {
      setSelectedProductIds([...selectedProductIds, prodId]);
    }
  };

  // Calculate temp total price in Frontend for visual feedback
  const tempTotalPrice = products
    .filter(p => selectedProductIds.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Tên thực đơn không được trống';
    if (!targetAudience.trim()) errors.targetAudience = 'Đối tượng sử dụng không được trống';
    if (calories <= 0) errors.calories = 'Lượng calories phải lớn hơn 0';
    if (!dishesText.trim()) errors.dishesText = 'Danh sách các món ăn không được trống';
    if (selectedProductIds.length === 0) errors.products = 'Phải chọn ít nhất 1 nông sản làm nguyên liệu';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setMessage(null);

    // Convert text inputs to arrays
    const dishes = dishesText
      .split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    const features = featuresText
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    try {
      if (editingMealPlan) {
        const payload: Omit<AdminMealPlan, 'id' | 'ingredients' | 'totalPrice'> & { ingredientProductIds: string[] } = {
          title,
          targetAudience,
          calories,
          dishes,
          features,
          ingredientProductIds: selectedProductIds,
          isActive
        };
        const updated = await adminService.updateMealPlan(editingMealPlan.id, payload);
        setMealPlans(mealPlans.map(p => p.id === editingMealPlan.id ? updated : p));
        setMessage({ type: 'success', text: 'Cập nhật thực đơn dinh dưỡng thành công!' });
      } else {
        const payload: Omit<AdminMealPlan, 'id' | 'isActive' | 'ingredients' | 'totalPrice'> & { ingredientProductIds: string[] } = {
          title,
          targetAudience,
          calories,
          dishes,
          features,
          ingredientProductIds: selectedProductIds
        };
        const created = await adminService.createMealPlan(payload);
        setMealPlans([...mealPlans, created]);
        setMessage({ type: 'success', text: 'Thêm mới thực đơn dinh dưỡng thành công!' });
      }
      setTimeout(() => handleCloseModal(), 1500);
    } catch (err: any) {
      console.error('Failed to save meal plan:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi lưu thực đơn.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMealPlan = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa (ẩn) thực đơn dinh dưỡng này không?')) return;
    try {
      await adminService.deleteMealPlan(id);
      setMealPlans(mealPlans.map(p => p.id === id ? { ...p, isActive: false } : p));
    } catch (err) {
      console.error('Failed to delete meal plan:', err);
      alert('Không thể xóa thực đơn dinh dưỡng này.');
    }
  };

  const filteredPlans = mealPlans.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.targetAudience.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin rounded-full h-12 w-12 text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thực đơn dinh dưỡng mẫu</h1>
          <p className="text-gray-500 text-sm">Quản lý gói Combo/Thực đơn dinh dưỡng mẫu thông minh, liên kết nguyên liệu nông sản từ hệ thống</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          className="gap-2 bg-green-600 hover:bg-green-700 font-bold active:scale-95 shadow-md shrink-0 text-white border-none cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" /> Tạo thực đơn mẫu
        </Button>
      </div>

      <Card className="border-gray-150">
        <CardContent className="p-6 space-y-4">
          
          {/* Search */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm thực đơn theo tiêu đề, đối tượng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none rounded-xl text-sm transition-all"
            />
          </div>

          {/* List Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[11px] font-bold uppercase border-b border-gray-100">
                  <th className="py-3 px-4">Tên thực đơn mẫu</th>
                  <th className="py-3 px-4">Đối tượng sử dụng</th>
                  <th className="py-3 px-4 text-center">Năng lượng</th>
                  <th className="py-3 px-4 text-center">Số nguyên liệu</th>
                  <th className="py-3 px-4 text-right">Tổng đơn giá combo</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50/40">
                      <td className="py-4 px-4 font-semibold text-gray-900 leading-tight">
                        <div>{plan.title}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {plan.features && plan.features.slice(0, 3).map((f, i) => (
                            <Badge key={i} className="text-[9px] px-1 py-0.1 bg-green-50 text-green-700 border-green-100">{f}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-650 font-medium">
                        {plan.targetAudience}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-700 font-bold">
                        {plan.calories} kcal
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-xs border border-blue-100">
                          <Utensils className="w-3 h-3" />
                          {plan.ingredients ? plan.ingredients.length : 0} nguyên liệu
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-emerald-600 font-bold">
                        {formatCurrency(plan.totalPrice)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${
                          plan.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                            : 'bg-red-50 text-red-700 border-red-250'
                        }`}>
                          {plan.isActive ? 'Đang bán' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenModal(plan)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMealPlan(plan.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                      Không tìm thấy thực đơn dinh dưỡng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal popup Create/Update MealPlan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-150 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">
                {editingMealPlan ? 'Sửa Thực đơn dinh dưỡng' : 'Tạo Thực đơn mẫu mới'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border text-sm font-semibold shadow-xs ${
                  message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {message.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Tên thực đơn dinh dưỡng *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Thực Đơn Gia Đình Nhỏ"
                  className={`w-full px-3 py-2 rounded-xl border ${formErrors.title ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                />
                {formErrors.title && <p className="text-[10px] text-red-500 font-medium">{formErrors.title}</p>}
              </div>

              {/* Target & Calories */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Đối tượng sử dụng *</label>
                  <input
                    type="text"
                    required
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ví dụ: Gia đình 3 người"
                    className={`w-full px-3 py-2 rounded-xl border ${formErrors.targetAudience ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                  />
                  {formErrors.targetAudience && <p className="text-[10px] text-red-500 font-medium">{formErrors.targetAudience}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Lượng Calories (kcal) *</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                  {formErrors.calories && <p className="text-[10px] text-red-500 font-medium">{formErrors.calories}</p>}
                </div>
              </div>

              {/* Dishes (Textarea) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex justify-between">
                  <span>Danh sách món ăn đề xuất *</span>
                  <span className="text-[10px] text-gray-400 font-normal">Mỗi món ăn viết trên 1 dòng</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={dishesText}
                  onChange={(e) => setDishesText(e.target.value)}
                  placeholder="Ví dụ:&#10;Canh chua cá lóc đồng&#10;Thịt bò xào rau cải&#10;Đậu phụ sốt cà chua"
                  className={`w-full px-3 py-2 rounded-xl border ${formErrors.dishesText ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                />
                {formErrors.dishesText && <p className="text-[10px] text-red-500 font-medium">{formErrors.dishesText}</p>}
              </div>

              {/* Features (Comma split) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex justify-between">
                  <span>Đặc trưng nổi bật</span>
                  <span className="text-[10px] text-gray-400 font-normal">Các đặc điểm ngăn cách bằng dấu phẩy</span>
                </label>
                <input
                  type="text"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Zero Waste, Nấu nhanh 30 phút, Tối ưu Dinh dưỡng"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              {/* CHỌN NGUYÊN LIỆU NÔNG SẢN TỪ HỆ THỐNG */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 flex justify-between items-center">
                  <span>Lựa chọn nông sản cấu thành thực đơn (Nguyên liệu) *</span>
                  <span className="text-xs font-bold text-emerald-600">
                    Combo tạm tính: {formatCurrency(tempTotalPrice)}
                  </span>
                </label>
                
                {formErrors.products && (
                  <p className="text-[10px] text-red-500 font-bold inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {formErrors.products}
                  </p>
                )}

                <div className="border border-gray-200 rounded-xl max-h-[160px] overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50">
                  {products.map(prod => {
                    const isSelected = selectedProductIds.includes(prod.id);
                    return (
                      <div 
                        key={prod.id}
                        onClick={() => handleToggleProduct(prod.id)}
                        className={`flex items-center gap-3 p-2 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-all ${
                          isSelected 
                            ? 'bg-green-50 border-green-300 text-green-800 font-bold shadow-xs' 
                            : 'bg-white border-gray-150 hover:bg-gray-100/50 text-gray-650'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-3.5 h-3.5 text-green-600 rounded cursor-pointer"
                        />
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-8 h-8 object-cover rounded-md border"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate leading-tight">{prod.name}</p>
                          <span className="text-[10px] text-emerald-600 block mt-0.5">{formatCurrency(prod.price)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Is Active Status checkbox */}
              {editingMealPlan && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveMealCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <label htmlFor="isActiveMealCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Mở bán gói thực đơn mẫu này trên trang chủ
                  </label>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-gray-150 flex justify-end gap-3 shrink-0">
                <Button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 cursor-pointer border-none"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 font-bold px-6 py-2 shadow-md inline-flex items-center gap-1.5 cursor-pointer text-white border-none"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Lưu thực đơn
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
