import { useState, useEffect } from 'react';
import { Search, Sprout, Leaf, Loader2 } from 'lucide-react';
import { FarmCard } from '../../components/features/FarmCard';
import { ProductCard } from '../../components/features/ProductCard';
import { Button } from '../../components/ui/Button';
import { farmService } from '../../services/farmService';
import { productService } from '../../services/productService';
import { type Farm, type Product } from '../../mocks/mockData';

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [categories, setCategories] = useState<string[]>(['Tất cả']);
  
  const [farms, setFarms] = useState<Farm[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page] = useState(1);
  const [limit] = useState(100); // Load matching batch

  // Tải danh mục thực tế và danh sách farm
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [cats, allFarms] = await Promise.all([
          productService.getCategories(),
          farmService.getFarms()
        ]);
        setCategories(cats);
        setFarms(allFarms);
      } catch (err) {
        console.error('Failed to load shop categories/farms:', err);
      }
    };
    loadStaticData();
  }, []);

  // Gọi API tải danh sách sản phẩm (hỗ trợ search, category, page, limit)
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const items = await productService.getProducts({
          page,
          limit,
          search: searchTerm || undefined,
          category: activeCategory !== 'Tất cả' ? activeCategory : undefined
        });
        setProducts(items);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeCategory, page, limit]);

  // Lọc Farm theo searchTerm cục bộ hoặc từ API
  const filteredFarms = farms.filter(farm => 
    farm.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header & Công cụ lọc */}
      <div className="bg-green-50/50 py-12 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Khám phá Nông trại & Nông sản
          </h1>
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            {/* Thanh tìm kiếm */}
            <div className="relative w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm nông trại, sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
              />
            </div>

            {/* Bộ lọc danh mục (Cuộn ngang trên mobile) */}
            <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 -mx-4 md:mx-0 px-4 md:px-0">
              <div className="flex gap-2 min-w-max">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? 'default' : 'outline'}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-5 whitespace-nowrap ${
                      activeCategory === category ? 'shadow-md' : 'border-gray-200'
                    }`}
                  >
                    {category === 'Vegetables' || category === 'Rau Củ' ? 'Rau củ' : 
                     category === 'Fruits' || category === 'Trái Cây' ? 'Trái cây' : 
                     category === 'Meat' || category === 'Thịt' ? 'Thịt' : 
                     category === 'Hải Sản' ? 'Hải sản' : category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Section 1: Nông trại (Chỉ hiện khi có kết quả và đang chọn 'Tất cả') */}
        {filteredFarms.length > 0 && activeCategory === 'Tất cả' && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-green-100 p-2 rounded-lg">
                <Sprout className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Nông trại nổi bật ({filteredFarms.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFarms.map(farm => (
                <FarmCard key={farm.id} farm={farm} />
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Sản phẩm */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Sản phẩm tìm thấy ({products.length})
              </h2>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <p className="text-sm font-medium">Đang tìm sản phẩm ngon lành...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Không có sản phẩm nào khớp với "{searchTerm}" trong phân loại đã chọn. 
                Vui lòng thử lại với từ khóa khác.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('Tất cả');
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
