import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  X, 
  Save
} from 'lucide-react';
import { farmOwnerService } from '../../services/farmOwnerService';
import { type Product } from '../../mocks/mockData';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Rau Củ', 'Trái Cây', 'Thịt', 'Hải Sản', 'Khác']);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Quick stock state to track which items are currently saving
  const [savingStockId, setSavingStockId] = useState<string | null>(null);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormSaving, setIsFormSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Rau Củ');
  const [price, setPrice] = useState<number>(0);
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState<number>(0);
  const [image, setImage] = useState('');

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await farmOwnerService.getProducts();
      setProducts(data);
      
      // Keep category list unique and up-to-date
      const uniqueCats = Array.from(new Set(data.map(p => p.category)));
      if (uniqueCats.length > 0) {
        setCategories(uniqueCats);
      }
    } catch (err) {
      console.error('Failed to load inventory products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Quick Stock adjustment directly calls PATCH /api/farm-owner/products/{id}/stock
  const handleQuickStockUpdate = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    setSavingStockId(productId);
    try {
      const updatedProduct = await farmOwnerService.updateStock(productId, newStock);
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
    } catch (err) {
      console.error('Failed to update stock via API:', err);
      alert('Có lỗi xảy ra khi cập nhật số lượng tồn kho. Vui lòng thử lại.');
    } finally {
      setSavingStockId(null);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentProductId(null);
    setName('');
    setCategory(categories[0] || 'Rau Củ');
    setPrice(0);
    setUnit('kg');
    setStock(0);
    setImage('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setModalMode('edit');
    setCurrentProductId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price);
    setUnit(product.unit);
    setStock(product.stock);
    setImage(product.image);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Tên sản phẩm không được trống';
    if (!category.trim()) errors.category = 'Danh mục không được trống';
    if (price <= 0) errors.price = 'Giá tiền phải lớn hơn 0';
    if (!unit.trim()) errors.unit = 'Đơn vị tính không được trống (kg, bó...)';
    if (stock < 0) errors.stock = 'Số lượng không được âm';
    if (!image.trim() || !image.startsWith('http')) errors.image = 'Đường dẫn ảnh phải hợp lệ (bắt đầu bằng http)';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsFormSaving(true);
    const productPayload = {
      name,
      category,
      price: Number(price),
      unit,
      stock: Number(stock),
      image
    };

    try {
      if (modalMode === 'create') {
        const newProduct = await farmOwnerService.createProduct(productPayload);
        setProducts(prev => [newProduct, ...prev]);
      } else if (modalMode === 'edit' && currentProductId) {
        const updated = await farmOwnerService.updateProduct(currentProductId, productPayload);
        setProducts(prev => prev.map(p => p.id === currentProductId ? updated : p));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Không thể lưu thông tin sản phẩm. Vui lòng kiểm tra lại.');
    } finally {
      setIsFormSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá sản phẩm này khỏi cửa hàng nông trại?')) return;
    
    try {
      await farmOwnerService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Không thể xoá sản phẩm này. Vui lòng thử lại.');
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Danh sách Kho hàng</h1>
          <p className="text-gray-500 mt-1">Quản lý nông sản, cập nhật nhanh số lượng thu hoạch và tồn kho.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-md inline-flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Thêm sản phẩm mới
        </button>
      </div>

      {/* Filters & Tools */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm bg-gray-50/50"
          />
        </div>

        {/* Category filter scroll */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('Tất cả')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'Tất cả' 
                ? 'bg-green-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-250'
            }`}
          >
            Tất cả danh mục
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-green-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-250'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-sm font-medium">Đang tải danh sách kho hàng nông trại...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Hình ảnh</th>
                  <th className="px-6 py-4">Tên sản phẩm</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4 text-right">Đơn giá</th>
                  <th className="px-6 py-4 text-center">Đơn vị</th>
                  <th className="px-6 py-4 text-center w-48">Tồn kho hiện tại</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Image */}
                    <td className="px-6 py-4">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-14 h-14 rounded-xl object-cover border border-gray-150 shadow-xs"
                      />
                    </td>
                    
                    {/* Name */}
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {product.name}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-right font-semibold text-gray-950">
                      {formatCurrency(product.price)}
                    </td>

                    {/* Unit */}
                    <td className="px-6 py-4 text-center text-gray-500 font-medium">
                      {product.unit}
                    </td>

                    {/* Quick Stock Change (PATCH) */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={savingStockId === product.id || product.stock <= 0}
                          onClick={() => handleQuickStockUpdate(product.id, product.stock - 1)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-extrabold flex items-center justify-center text-gray-700 disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        
                        <div className="relative">
                          {savingStockId === product.id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-green-600 mx-3" />
                          ) : (
                            <input
                              type="number"
                              value={product.stock}
                              onChange={(e) => handleQuickStockUpdate(product.id, Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-16 text-center py-1.5 border border-gray-200 rounded-lg text-sm font-bold bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                          )}
                        </div>

                        <button
                          disabled={savingStockId === product.id}
                          onClick={() => handleQuickStockUpdate(product.id, product.stock + 1)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-extrabold flex items-center justify-center text-gray-700 disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      {product.stock <= 5 && (
                        <span className="text-[10px] text-red-500 font-bold block mt-1">Sắp hết hàng!</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-650 hover:bg-red-55/10 rounded-lg transition-colors cursor-pointer"
                          title="Xoá khỏi vườn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-base mb-4">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Tất cả');
            }}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* CRUD Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">
                {modalMode === 'create' ? 'Thêm nông sản mới' : 'Chỉnh sửa nông sản'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Tên nông sản *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Rau Cải Ngọt Hữu Cơ"
                  className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                />
                {formErrors.name && <p className="text-[10px] text-red-500 font-medium">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Danh mục *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                  >
                    {categories.filter(c => c !== 'Tất cả').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {!categories.includes('Rau Củ') && <option value="Rau Củ">Rau Củ</option>}
                    {!categories.includes('Trái Cây') && <option value="Trái Cây">Trái Cây</option>}
                    {!categories.includes('Thịt') && <option value="Thịt">Thịt</option>}
                    {!categories.includes('Hải Sản') && <option value="Hải Sản">Hải Sản</option>}
                    {!categories.includes('Khác') && <option value="Khác">Khác</option>}
                  </select>
                </div>

                {/* Measure Unit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Đơn vị tính *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="kg, bó, hộp, vỉ..."
                    className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.unit ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                  />
                  {formErrors.unit && <p className="text-[10px] text-red-500 font-medium">{formErrors.unit}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Unit Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Đơn giá (₫) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="25000"
                    className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.price ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                  />
                  {formErrors.price && <p className="text-[10px] text-red-500 font-medium">{formErrors.price}</p>}
                </div>

                {/* Initial Stock */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Số lượng ban đầu *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="50"
                    className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.stock ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                  />
                  {formErrors.stock && <p className="text-[10px] text-red-500 font-medium">{formErrors.stock}</p>}
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Đường dẫn hình ảnh (URL) *</label>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.image ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                />
                {formErrors.image && <p className="text-[10px] text-red-500 font-medium">{formErrors.image}</p>}
                
                {image && image.startsWith('http') && (
                  <div className="mt-2 relative w-full h-32 rounded-xl border border-gray-150 overflow-hidden">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isFormSaving}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  {isFormSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
