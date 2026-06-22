import { useEffect, useState } from 'react';
import { adminService, type AdminFarm } from '../../services/adminService';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Plus, 
  Edit2, 
  MapPin, 
  Video, 
  Search, 
  X, 
  Loader2, 
  CheckCircle2, 
  Power,
  Star
} from 'lucide-react';

export default function Farms() {
  const [farms, setFarms] = useState<AdminFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<AdminFarm | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [rating, setRating] = useState(5.0);
  const [isActive, setIsActive] = useState(true);
  const [ownerId, setOwnerId] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const data = await adminService.getFarms();
      setFarms(data);
    } catch (err) {
      console.error('Failed to load farms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (farm: AdminFarm | null = null) => {
    setFormErrors({});
    setMessage(null);
    if (farm) {
      setEditingFarm(farm);
      setName(farm.name);
      setImage(farm.image);
      setDescription(farm.description);
      setLocation(farm.location);
      setVideoUrl(farm.videoUrl || '');
      setRating(Number(farm.rating));
      setIsActive(farm.isActive);
      setOwnerId(farm.ownerId || '');
    } else {
      setEditingFarm(null);
      setName('');
      setImage('https://rauxanhdanang.com/wp-content/uploads/2023/04/rauxanhdanang.com-logo-1.png');
      setDescription('');
      setLocation('');
      setVideoUrl('https://videos.pexels.com/video-files/3266800/3266800-sd_640_360_30fps.mp4');
      setRating(5.0);
      setIsActive(true);
      setOwnerId('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFarm(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Tên nông trại không được trống';
    if (!location.trim()) errors.location = 'Vị trí địa lý không được trống';
    if (!description.trim()) errors.description = 'Mô tả nông trại không được trống';
    if (!image.trim() || !image.startsWith('http')) errors.image = 'Đường dẫn ảnh banner phải hợp lệ (http/https)';
    if (rating < 0 || rating > 5) errors.rating = 'Đánh giá rating từ 0 đến 5';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setMessage(null);

    try {
      if (editingFarm) {
        const payload: Omit<AdminFarm, 'id'> = {
          name,
          image,
          description,
          location,
          videoUrl: videoUrl || undefined,
          rating,
          isActive,
          ownerId: ownerId || undefined
        };
        const updated = await adminService.updateFarm(editingFarm.id, payload);
        setFarms(farms.map(f => f.id === editingFarm.id ? updated : f));
        setMessage({ type: 'success', text: 'Cập nhật thông tin nông trại thành công!' });
      } else {
        const payload: Omit<AdminFarm, 'id' | 'isActive'> = {
          name,
          image,
          description,
          location,
          videoUrl: videoUrl || undefined,
          rating,
          ownerId: ownerId || undefined
        };
        const created = await adminService.createFarm(payload);
        setFarms([...farms, created]);
        setMessage({ type: 'success', text: 'Thêm mới nông trại thành công!' });
      }
      setTimeout(() => handleCloseModal(), 1500);
    } catch (err: any) {
      console.error('Failed to save farm:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin nông trại.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (farm: AdminFarm) => {
    try {
      const payload: Omit<AdminFarm, 'id'> = {
        name: farm.name,
        image: farm.image,
        description: farm.description,
        location: farm.location,
        videoUrl: farm.videoUrl,
        rating: Number(farm.rating),
        isActive: !farm.isActive,
        ownerId: farm.ownerId
      };
      const updated = await adminService.updateFarm(farm.id, payload);
      setFarms(farms.map(f => f.id === farm.id ? updated : f));
    } catch (err) {
      console.error('Failed to toggle active status:', err);
      alert('Không thể thay đổi trạng thái nông trại.');
    }
  };

  const filteredFarms = farms.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nông trại</h1>
          <p className="text-gray-500 text-sm">Quản lý danh sách, trạng thái và cấu hình live camera 24/7 của các nông trại</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          className="gap-2 bg-green-600 hover:bg-green-700 font-bold active:scale-95 shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" /> Thêm nông trại
        </Button>
      </div>

      <Card className="border-gray-150">
        <CardContent className="p-6 space-y-4">
          {/* Filter / Search Bar */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm nông trại theo tên, địa chỉ..."
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
                  <th className="py-3 px-4">Hình ảnh</th>
                  <th className="py-3 px-4">Tên nông trại</th>
                  <th className="py-3 px-4">Địa điểm</th>
                  <th className="py-3 px-4 text-center">Đánh giá</th>
                  <th className="py-3 px-4 text-center">Camera Live</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredFarms.length > 0 ? (
                  filteredFarms.map((farm) => (
                    <tr key={farm.id} className="hover:bg-gray-50/40">
                      <td className="py-3 px-4">
                        <img 
                          src={farm.image} 
                          alt={farm.name} 
                          className="w-16 h-10 object-cover rounded-lg border border-gray-150 shadow-inner"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900 leading-tight">{farm.name}</div>
                        <span className="text-[10px] text-gray-400 block mt-1">ID: {farm.id}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{farm.location}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold text-xs border border-amber-100">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {farm.rating}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {farm.videoUrl ? (
                          <span className="inline-flex items-center gap-1 text-red-650 bg-red-50 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-150">
                            <Video className="w-3 h-3 text-red-500" /> LIVE
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Không</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(farm)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                            farm.isActive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50' 
                              : 'bg-gray-150 text-gray-600 border-gray-200 hover:bg-gray-200/50'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          {farm.isActive ? 'Đang mở' : 'Tạm dừng'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenModal(farm)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                      Không tìm thấy nông trại nào khớp với từ khóa
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Popup Create/Update Farm */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-150 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">
                {editingFarm ? 'Sửa thông tin Nông trại' : 'Thêm nông trại mới'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border text-sm font-semibold shadow-xs ${
                  message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {message.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Farm Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Tên nông trại *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Rau Xanh Đà Nẵng"
                  className={`w-full px-3 py-2 rounded-xl border ${formErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                />
                {formErrors.name && <p className="text-[10px] text-red-500 font-medium">{formErrors.name}</p>}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Địa chỉ / Vị trí *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: Hòa Vang, Đà Nẵng"
                  className={`w-full px-3 py-2 rounded-xl border ${formErrors.location ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                />
                {formErrors.location && <p className="text-[10px] text-red-500 font-medium">{formErrors.location}</p>}
              </div>

              {/* Image Banner URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Banner Image URL *</label>
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

              {/* Camera Video Stream URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Camera Live Video URL (MP4 Stream)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://videos.pexels.com/...mp4"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                />
                <span className="text-[10px] text-gray-400 block leading-tight">Có thể dùng link SD nén để đảm bảo tải mượt mà.</span>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Mô tả hoạt động nông trại *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giới thiệu quy trình canh tác sạch, cam kết an toàn..."
                  className={`w-full px-3 py-2 rounded-xl border ${formErrors.description ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-green-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                />
                {formErrors.description && <p className="text-[10px] text-red-500 font-medium">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Rating */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Điểm đánh giá (Rating) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    required
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                  {formErrors.rating && <p className="text-[10px] text-red-500 font-medium">{formErrors.rating}</p>}
                </div>

                {/* Owner ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">ID Chủ vườn (OwnerId)</label>
                  <input
                    type="text"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    placeholder="Nhập ID tài khoản FarmOwner"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Is Active Status checkbox */}
              {editingFarm && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Nông trại đang mở cửa hoạt động bình thường
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
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
