import { Link } from 'react-router-dom';
import { Sprout, Leaf, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FarmCard } from '../../components/features/FarmCard';
import { ProductCard } from '../../components/features/ProductCard';
import { farms, products } from '../../mocks/mockData';

export default function Home() {
  // Lấy 3 nông trại đầu tiên
  const featuredFarms = farms.slice(0, 3);
  // Lấy 4 sản phẩm đầu tiên
  const freshProducts = products.slice(0, 4);

  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <section className="bg-green-50 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-10 pointer-events-none">
          <Leaf className="w-96 h-96 text-green-600" />
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-green-800 mb-6">
            Từ Nông Trại Xanh <br className="hidden sm:block" /> Đến Bàn Ăn Của Bạn
          </h1>
          <p className="mt-4 text-lg md:text-xl text-green-700 max-w-2xl mx-auto mb-10">
            Trải nghiệm nông sản sạch, theo dõi trực tiếp qua camera 24/24 và mua sắm dễ dàng. 
            Kết nối trực tiếp với những người nông dân tâm huyết.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/farms">
              <Button size="lg" className="gap-2 text-base shadow-md">
                Khám phá Nông trại
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* 2. Nông trại nổi bật (Featured Farms) */}
        <section>
          <div className="flex items-center justify-between xl:justify-start gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Sprout className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Nông trại tiêu biểu
              </h2>
            </div>
            <Link to="/farms" className="hidden sm:flex items-center text-green-600 font-medium hover:text-green-700 transition-colors">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFarms.map(farm => (
              <FarmCard key={farm.id} farm={farm} />
            ))}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Link to="/farms">
              <Button variant="outline" className="w-full">
                Xem tất cả Nông trại
              </Button>
            </Link>
          </div>
        </section>

        {/* 3. Nông sản mới thu hoạch (Fresh Products) */}
        <section>
          <div className="flex items-center justify-between xl:justify-start gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Mới thu hoạch hôm nay
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {freshProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Link to="/farms">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Xem thêm sản phẩm
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
