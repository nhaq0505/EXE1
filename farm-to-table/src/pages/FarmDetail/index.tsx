
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, ArrowLeft, ShoppingBasket, Video, Sprout } from 'lucide-react';
import { farms, products } from '../../mocks/mockData';
import { ProductCard } from '../../components/features/ProductCard';
import { Button } from '../../components/ui/Button';

export default function FarmDetail() {
  const { id } = useParams<{ id: string }>();

  // Lấy thông tin nông trại
  const farm = farms.find(f => f.id === id);

  // Lấy danh sách sản phẩm thuộc nông trại này
  const farmProducts = products.filter(p => p.farmId === id);

  // Nếu không tìm thấy nông trại
  if (!farm) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy nông trại này</h2>
        <p className="text-gray-500 mb-8">Nông trại bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ.</p>
        <Link to="/farms">
          <Button className="gap-2">
            <ArrowLeft className="w-5 h-5" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white pb-20">
      {/* Farm Cover Image */}
      <div className="h-64 sm:h-80 lg:h-96 w-full relative">
        <img 
          src={farm.image} 
          alt={farm.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Farm Header Info (Overlay) */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
            <Link to="/farms" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Quay lại</span>
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                  {farm.name}
                </h1>
                <div className="flex flex-wrap items-center text-white/90 gap-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-5 h-5" />
                    {farm.location}
                  </span>
                  <span className="flex items-center gap-1.5 bg-yellow-500/20 px-2.5 py-1 rounded-md backdrop-blur-sm">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-white">{farm.rating}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content Space */}
          <div className="lg:col-span-2 space-y-12">
            {/* About */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Giới thiệu</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {farm.description}
              </p>
            </section>

            {/* LIVE Camera Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Video className="w-6 h-6 text-green-600" />
                  Camera Nông trại
                </h2>
              </div>
              
              <div className="w-full aspect-video rounded-xl overflow-hidden relative shadow-lg bg-gray-900 border border-gray-200">
                {/* Video Player */}
                {farm.videoUrl ? (
                  <video 
                    src={farm.videoUrl}
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                    <Video className="w-12 h-12 opacity-50" />
                    <span>Camera đang bảo trì</span>
                  </div>
                )}
                
                {/* LIVE Badge Overlay */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                  <span className="text-xs font-bold tracking-widest text-white uppercase">Live</span>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Info Box */}
          <div className="lg:col-span-1 border-t lg:border-t-0 pt-8 lg:pt-0">
            <div className="bg-green-50 rounded-xl p-6 border border-green-100 sticky top-24">
              <h3 className="text-lg font-bold tracking-tight text-gray-900 mb-4">Thông tin thêm</h3>
              <ul className="space-y-4">
                <li className="flex justify-between border-b border-green-200/50 pb-2">
                  <span className="text-gray-600">Sản phẩm hiện có</span>
                  <span className="font-semibold text-gray-900">{farmProducts.length}</span>
                </li>
                <li className="flex justify-between border-b border-green-200/50 pb-2">
                  <span className="text-gray-600">Đánh giá</span>
                  <span className="font-semibold text-gray-900">{farm.rating} / 5.0</span>
                </li>
              </ul>
              <Button className="w-full mt-6" size="lg" onClick={() => {
                const shopSection = document.getElementById('farm-products');
                shopSection?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Mua sắm ngay
              </Button>
            </div>
          </div>

        </div>

        {/* Products Grid */}
        <section id="farm-products" className="mt-20 pt-16 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-green-100 p-2 rounded-lg">
              <ShoppingBasket className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Sản phẩm từ nông trại này
            </h2>
          </div>
          
          {farmProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {farmProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Chưa có sản phẩm nào</h3>
              <p className="text-gray-500">Nông trại này hiện tại chưa cập nhật sản phẩm.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
