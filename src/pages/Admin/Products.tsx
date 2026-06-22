import { useEffect, useState } from 'react';
import { adminService, type AdminProduct, type AdminFarm } from '../../services/adminService';
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
  Power,
  Filter,
  PlusCircle,
  MinusCircle,
  AlertTriangle
} from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [farms, setFarms] = useState<AdminFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedFarmFilter, setSelectedFarmFilter] = useState('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('Rau Củ');
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState(10);
  const [farmId, setFarmId] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Quick stock update state tracker to show spinners on specific products
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const categories = ['Rau Củ', 'Trái Cây', 'Thịt', 'Hải Sản', 'Khác'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodsData, farmsData] = await Promise.all([
        adminService.getProducts(),
        adminService.getFarms()
      ]);
      setProducts(prodsData);
      setFarms(farmsData);
    } catch (err) {
      console.error('Failed to load products/farms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product: AdminProduct | null = null) => {
    setFormErrors({});
    setMessage(null);
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setImage(product.image);
      setPrice(product.price);
      setCategory(product.category);
      setUnit(product.unit);
      setStock(product.stock);
      setFarmId(product.farmId);
      setIsActive(product.isActive);
    } else {
      setEditingProduct(null);
      setName('');
      setImage('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2032&auto=format&fit=crop');
      setPrice(25000);
      setCategory('Rau Củ');
      setUnit('kg');
      setStock(10);
      // Auto select first farm if available
      setFarmId(farms.length > 0 ? farms[0].id : '');
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Tên sản phẩm không được trống';
    if (!unit.trim()) errors.unit = 'Đơn vị tính không được trống';
    if (!image.trim() || !image.startsWith('http')) errors.image = 'Đường dẫn ảnh sản phẩm phải hợp lệ (http/https)';
    if (price <= 0) errors.price = 'Giá bán phải lớn hơn 0';
    if (stock < 0) errors.stock = 'Tồn kho không được nhỏ hơn 0';
    if (!farmId) errors.farmId = 'Phải chọn nông trại sở hữu';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setMessage(null);

    try {
      if (editingProduct) {
        const payload: Omit<AdminProduct, 'id' | 'farmName'> = {
          farmId,
          name,
          image,
          price,
          category,
          unit,
          stock,
          isActive
        };
        const updated = await adminService.updateProduct(editingProduct.id, payload);
        
        // Find farm name to sync in frontend state
        const farm = farms.find(f => f.id === farmId);
        updated.farmName = farm ? farm.name : '';

        setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
        setMessage({ type: 'success', text: 'Cập nhật thông tin sản phẩm thành công!' });
      } else {
        const payload: Omit<AdminProduct, 'id' | 'farmName' | 'isActive'> = {
          farmId,
          name,
          image,
          price,
          category,
          unit,
          stock
        };
        const created = await adminService.createProduct(payload);
        
        // Find farm name to sync in frontend state
        const farm = farms.find(f => f.id === farmId);
        created.farmName = farm ? farm.name : '';
        created.isActive = true;

        setProducts([...products, created]);
        setMessage({ type: 'success', text: 'Thêm mới sản phẩm thành công!' });
      }
      setTimeout(() => handleCloseModal(), 1500);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin sản phẩm.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle IsActive status
  const handleToggleActive = async (product: AdminProduct) => {
    try {
      const payload: Omit<AdminProduct, 'id' | 'farmName'> = {
        farmId: product.farmId,
        name: product.name,
        image: product.image,
        price: product.price,
        category: product.category,
        unit: product.unit,
        stock: product.stock,
        isActive: !product.isActive
      };
      const updated = await adminService.updateProduct(product.id, payload);
      const farm = farms.find(f => f.id === product.farmId);
      updated.farmName = farm ? farm.name : '';
      setProducts(products.map(p => p.id === product.id ? updated : p));
    } catch (err) {
      console.error('Failed to toggle product status:', err);
      alert('Không thể thay đổi trạng thái sản phẩm.');
    }
  };

  // QUICK STOCK UPDATES (Tăng/giảm tồn kho nhanh)
  const handleQuickStockUpdate = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    
    setUpdatingStockId(productId);
    try {
      await adminService.updateProductStock(productId, newStock);
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === productId ? { ...p, stock: newStock } : p)
      );
    } catch (err) {
      console.error('Failed to update product stock:', err);
      alert('Có lỗi xảy ra khi cập nhật tồn kho.');
    } finally {
      setUpdatingStockId(null);
    }
  };

  // Handle direct stock input change
  const handleStockInputChange = async (productId: string, val: string) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 0) return;
    handleQuickStockUpdate(productId, parsed);
  };

  // Filters logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.farmName && p.farmName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFarm = selectedFarmFilter === 'All' || p.farmId === selectedFarmFilter;
    const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    
    return matchesSearch && matchesFarm && matchesCategory;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý kho hàng & sản phẩm</h1>
          <p className="text-gray-500 text-sm">Quản lý tất cả sản phẩm, danh mục, nông trại và cập nhật nhanh số tồn kho nông sản</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          className="gap-2 bg-green-600 hover:bg-green-700 font-bold active:scale-95 shadow-md shrink-0 cursor-pointer text-white border-none"
        >
          <Plus className="w-4.5 h-4.5" /> Thêm sản phẩm
        </Button>
      </div>

      <Card className="border-gray-150">
        <CardContent className="p-6 space-y-4">
          
          {/* Filters Area */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên, nông trại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none rounded-xl text-sm transition-all"
              />
            </div>

            {/* Selector Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1 text-gray-500 text-xs font-bold uppercase">
                <Filter className="w-3.5 h-3.5" /> Bộ lọc:
              </div>
              
              {/* Farm Filter */}
              <select
                value={selectedFarmFilter}
                onChange={(e) => setSelectedFarmFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 focus:ring-1 focus:ring-green-500 rounded-xl text-sm outline-none bg-white font-medium text-gray-700"
              >
                <option value="All">Tất cả Nông trại</option>
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 focus:ring-1 focus:ring-green-500 rounded-xl text-sm outline-none bg-white font-medium text-gray-700"
              >
                <option value="All">Tất cả Danh mục</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[11px] font-bold uppercase border-b border-gray-100">
                  <th className="py-3 px-4">Ảnh</th>
                  <th className="py-3 px-4">Nông sản</th>
                  <th className="py-3 px-4">Nông trại sở hữu</th>
                  <th className="py-3 px-4">Đơn giá / Đơn vị</th>
                  <th className="py-3 px-4 text-center" style={{ minWidth: '150px' }}>Tồn kho (Stock)</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const isLowStock = product.stock <= 5;
                    const isUpdatingStock = updatingStockId === product.id;

                    return (
                      <tr key={product.id} className="hover:bg-gray-50/40">
                        <td className="py-3 px-4">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded-lg border border-gray-150 shadow-inner"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900 leading-tight">{product.name}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge className="text-[10px] px-1.5 py-0.2">{product.category}</Badge>
                            <span className="text-[9px] text-gray-400">ID: {product.id}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium">
                          {product.farmName || 'Nông trại không rõ'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-955">
                          {formatCurrency(product.price)} <span className="text-gray-400 text-xs font-normal">/ {product.unit}</span>
                        </td>
                        
                        {/* CHỈNH SỬA KHO HÀNG NHANH CỦA TỪNG NÔNG TRẠI */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuickStockUpdate(product.id, product.stock - 1)}
                              disabled={product.stock <= 0 || isUpdatingStock}
                              className="text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                              title="Giảm 1 tồn kho"
                            >
                              <MinusCircle className="w-5 h-5" />
                            </button>
                            
                            {isUpdatingStock ? (
                              <Loader2 className="w-4 h-4 animate-spin text-green-600 mx-2" />
                            ) : (
                              <input
                                type="number"
                                min="0"
                                value={product.stock}
                                onChange={(e) => handleStockInputChange(product.id, e.target.value)}
                                className={`w-14 text-center border rounded-md py-0.5 text-sm font-bold focus:ring-1 focus:ring-green-500 outline-none ${
                                  isLowStock ? 'bg-red-50 border-red-200 text-red-750' : 'bg-gray-50 border-gray-200 text-gray-900'
                                }`}
                              />
                            )}

                            <button
                              type="button"
                              onClick={() => handleQuickStockUpdate(product.id, product.stock + 1)}
                              disabled={isUpdatingStock}
                              className="text-gray-400 hover:text-green-600 disabled:opacity-30 transition-colors cursor-pointer"
                              title="Tăng 1 tồn kho"
                            >
                              <PlusCircle className="w-5 h-5" />
                            </button>

                            {isLowStock && (
                              <span title="Sắp hết hàng!">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 ml-1 animate-pulse" />
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleActive(product)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                              product.isActive 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50' 
                                : 'bg-gray-150 text-gray-600 border-gray-200 hover:bg-gray-200/50'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            {product.isActive ? 'Đang bán' : 'Ẩn đi'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                      Không tìm thấy nông sản nào khớp với bộ lọc
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal popup Create/Update Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-150 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Sửa thông tin nông sản' : 'Thêm nông sản mới'}
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

              {/* Farm selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Thuộc nông trại sở hữu *</label>
                <select
                  required
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                >
                  <option value="" disabled>-- Chọn nông trại sở hữu --</option>
                  {farms.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                {formErrors.farmId && <p className="text-[10px] text-red-500 font-medium">{formErrors.farmId}</p>}
              </div>

              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Tên nông sản / sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Cà Rốt Hữu Cơ"
                  className={`w-full px-3 py-2 rounded-xl border ${formErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                />
                {formErrors.name && <p className="text-[10px] text-red-500 font-medium">{formErrors.name}</p>}
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Danh mục *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Đơn vị tính *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="kg, bó, túi..."
                    className={`w-full px-3 py-2 rounded-xl border ${formErrors.unit ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                  />
                  {formErrors.unit && <p className="text-[10px] text-red-500 font-medium">{formErrors.unit}</p>}
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Đơn giá (VND) *</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                  {formErrors.price && <p className="text-[10px] text-red-500 font-medium">{formErrors.price}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Số tồn kho ban đầu *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                  {formErrors.stock && <p className="text-[10px] text-red-500 font-medium">{formErrors.stock}</p>}
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Hình ảnh giới thiệu (Image URL) *</label>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full px-3 py-2 rounded-xl border ${formErrors.image ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                />
                {formErrors.image && <p className="text-[10px] text-red-500 font-medium">{formErrors.image}</p>}
              </div>

              {/* Is Active check */}
              {editingProduct && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveProductCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <label htmlFor="isActiveProductCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Cho phép hiển thị bán rộng rãi nông sản này
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
                  Lưu sản phẩm
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
