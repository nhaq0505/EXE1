import { useEffect, useState } from 'react';
import { 
  Save, 
  MapPin, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Sprout, 
  Loader2,
  CheckCircle,
  Eye
} from 'lucide-react';
import { farmOwnerService, type FarmSettings } from '../../services/farmOwnerService';

export default function Settings() {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await farmOwnerService.getFarmSettings();
        setName(data.name);
        setImage(data.image);
        setDescription(data.description);
        setLocation(data.location);
        setVideoUrl(data.videoUrl || '');
      } catch (err) {
        console.error('Failed to load farm settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Tên vườn không được trống';
    if (!location.trim()) errors.location = 'Vị trí vườn không được trống';
    if (!description.trim()) errors.description = 'Mô tả ngắn không được trống';
    if (!image.trim() || !image.startsWith('http')) errors.image = 'Đường dẫn hình ảnh giới thiệu phải hợp lệ';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload: Omit<FarmSettings, 'id'> = {
        name,
        image,
        description,
        location,
        videoUrl: videoUrl || undefined
      };
      const updated = await farmOwnerService.updateFarmSettings(payload);
      
      setName(updated.name);
      setImage(updated.image);
      setDescription(updated.description);
      setLocation(updated.location);
      setVideoUrl(updated.videoUrl || '');
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Hide success toast after 3s
    } catch (err) {
      console.error('Failed to save farm settings:', err);
      alert('Không thể cập nhật thông tin cài đặt vườn. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        <p className="text-sm font-medium">Đang tải thông tin trang trại của bạn...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="border-b border-gray-150 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Cài đặt Trang trại</h1>
        <p className="text-gray-500 mt-1">
          Cập nhật thông tin giới thiệu nông trại của bạn hiển thị trên trang chủ và liên kết camera 24/24.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl flex items-center gap-3 shadow-xs animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div className="text-sm font-bold">
            Cập nhật cấu hình vườn thành công! Thông tin của bạn đã được cập nhật trực tuyến.
          </div>
        </div>
      )}

      {/* Main Settings Form Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
            {/* Farm Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 inline-flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-green-600" /> Tên nông trại / vườn *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Rau Xanh Đà Nẵng"
                className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
              />
              {formErrors.name && <p className="text-[10px] text-red-500 font-medium">{formErrors.name}</p>}
            </div>

            {/* Farm Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-green-600" /> Vị trí địa lý trang trại *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ví dụ: Hòa Vang, Đà Nẵng"
                className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.location ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
              />
              {formErrors.location && <p className="text-[10px] text-red-500 font-medium">{formErrors.location}</p>}
            </div>

            {/* Farm Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 inline-flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-green-600" /> Mô tả hoạt động nông trại *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả cam kết canh tác hữu cơ, quy trình chăm bón và chất lượng nông sản tươi sạch..."
                className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.description ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
              />
              {formErrors.description && <p className="text-[10px] text-red-500 font-medium">{formErrors.description}</p>}
            </div>

            {/* Farm Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 inline-flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-green-600" /> Hình ảnh giới thiệu (Banner URL) *
              </label>
              <input
                type="text"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.image ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
              />
              {formErrors.image && <p className="text-[10px] text-red-500 font-medium">{formErrors.image}</p>}
            </div>

            {/* Farm Camera Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 inline-flex items-center gap-1.5">
                <Video className="w-4 h-4 text-green-600" /> Camera giám sát 24/24 (MP4/HLS Stream URL)
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://videos.pexels.com/...mp4"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
              />
              <span className="text-[10px] text-gray-400 block leading-tight">
                Liên kết luồng camera trực tiếp tại vườn giúp người tiêu dùng tự do giám sát quy trình tưới tiêu sạch thời gian thực.
              </span>
            </div>

            {/* Action Save button */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-md inline-flex items-center gap-2 text-sm cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu cấu hình...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu thông tin vườn
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Preview Panel */}
        <div className="space-y-6">
          {/* Banner Image Preview */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Eye className="w-4.5 h-4.5 text-gray-450" />
              <h2 className="text-sm font-bold text-gray-900">Xem trước Banner vườn</h2>
            </div>
            <div className="p-4">
              {image && image.startsWith('http') ? (
                <div className="relative w-full h-44 rounded-xl border border-gray-150 overflow-hidden shadow-inner">
                  <img src={image} alt={name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4">
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">{name || 'Tên vườn'}</h3>
                      <p className="text-xs text-gray-200 inline-flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-red-400" /> {location || 'Vị trí'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-44 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs font-semibold">Chưa có ảnh preview</span>
                </div>
              )}
            </div>
          </div>

          {/* Camera Player Live Preview */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4.5 h-4.5 text-gray-450" />
                <h2 className="text-sm font-bold text-gray-900">Luồng Camera 24/24</h2>
              </div>
              {videoUrl && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-red-650 bg-red-50 border border-red-150 animate-pulse">
                  ● LIVE 24/7
                </span>
              )}
            </div>
            <div className="p-4">
              {videoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-150 bg-black aspect-video shadow-md">
                  <video 
                    src={videoUrl} 
                    className="w-full h-full object-cover" 
                    controls 
                    muted 
                    autoPlay 
                    loop 
                    playsInline
                  />
                </div>
              ) : (
                <div className="w-full h-44 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Video className="w-8 h-8" />
                  <span className="text-xs font-semibold">Chưa có luồng camera</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
