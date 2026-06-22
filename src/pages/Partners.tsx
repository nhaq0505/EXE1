import React from 'react';
import { partners } from '../mocks/mockData';
import { ExternalLink, Handshake, ShieldCheck, Heart } from 'lucide-react';

const highlights = [
  { icon: ShieldCheck, label: 'Đồng hành uy tín', desc: 'Hợp tác chặt chẽ cùng các doanh nghiệp định hướng bền vững' },
  { icon: Handshake, label: 'Tầm nhìn chung', desc: 'Đẩy mạnh kết nối xanh từ nông trại đến bàn ăn' },
  { icon: Heart, label: 'Cam kết chất lượng', desc: 'Tất cả đối tác đều tuân thủ quy chuẩn hữu cơ nghiêm ngặt' },
];

const Partners: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">
            🤝 Mạng Lưới Đối Tác · Green Solution
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            Đối Tác Của Chúng Tôi
          </h1>
          <p className="text-green-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Hợp tác cùng phát triển chuỗi giá trị nông nghiệp hữu cơ bền vững và giải pháp tiêu dùng thân thiện với môi trường.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-white border-b border-gray-200 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Partners List */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900">Danh sách đơn vị hợp tác</h2>
          <p className="text-gray-500 text-sm mt-1">Đồng hành và kết nối bền vững vì một tương lai xanh</p>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl w-full">
            {partners.map((partner) => (
              <div 
                key={partner.id} 
                className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100 border-b border-gray-100">
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-green-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Verified Partner
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors">
                      {partner.name}
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {partner.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <a 
                      href={partner.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-xs gap-1.5"
                    >
                      Ghé thăm Facebook <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partners;
