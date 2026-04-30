import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { User as UserIcon, Camera, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: 'password123', // Dummy password
    address: user?.address || ''
  });

  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center">
        <div>
          <p className="text-apple-body mb-4">Vui lòng đăng nhập để xem hồ sơ của bạn.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">Đăng nhập</button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSave = () => {
    updateUser({
      username: formData.username,
      address: formData.address
      // In a real app we'd update email & pass through secure endpoints
    });
    setIsEditing(false);
  };

  const handleDeleteProfile = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản của mình không? Hành động này không thể hoàn tác.')) {
      logout();
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10 min-h-screen">
      <div className="flex items-end justify-between mb-10 pb-6 border-b border-ink/10">
        <h1 className="text-apple-display-md">Hồ sơ của bạn</h1>
        <button onClick={handleLogout} className="text-[14px] text-ink/70 hover:text-ink font-semibold">Đăng xuất</button>
      </div>

      <div className="max-w-[700px] mx-auto">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group cursor-pointer mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-tile-1 border-4 border-white shadow-sm flex items-center justify-center text-white text-3xl font-semibold">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
          </div>
          <h2 className="text-apple-display-md text-ink text-center">{user.username}</h2>
          <p className="text-[14px] text-ink-muted mt-1">{user.email}</p>
        </div>

        {/* Info Form */}
        <div className="glass-panel p-8">
          <div className="flex justify-between items-center mb-8 border-b border-ink/10 pb-4">
            <h3 className="text-apple-body-strong text-xl">Chi tiết Tài khoản</h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-[14px] text-primary hover:underline"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      username: user.username,
                      email: user.email,
                      password: 'password123',
                      address: user.address || ''
                    });
                  }}
                  className="text-[14px] text-ink-muted hover:text-ink"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSave}
                  className="text-[14px] text-primary font-semibold hover:underline"
                >
                  Lưu
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[12px] text-ink/70 mb-1 ml-1 uppercase tracking-wider font-semibold">Tên</label>
              <input 
                type="text"
                name="username"
                disabled={!isEditing}
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur shadow-sm border border-white/50 rounded-[12px] text-ink focus:outline-none focus:border-primary focus:bg-white/80 disabled:opacity-70 disabled:bg-white/30 transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-[12px] text-ink/70 mb-1 ml-1 uppercase tracking-wider font-semibold">Connect ID (Email)</label>
              <input 
                type="email"
                name="email"
                disabled={true} // Usually email can't be easily changed
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/30 backdrop-blur shadow-sm border border-white/50 rounded-[12px] text-ink/60 focus:outline-none transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-[12px] text-ink/70 mb-1 ml-1 uppercase tracking-wider font-semibold">Mật khẩu</label>
              <input 
                type="password"
                name="password"
                disabled={!isEditing}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur shadow-sm border border-white/50 rounded-[12px] text-ink focus:outline-none focus:border-primary focus:bg-white/80 disabled:opacity-70 disabled:bg-white/30 transition-all font-medium tracking-widest text-lg"
              />
            </div>

            <div>
              <label className="block text-[12px] text-ink/70 mb-1 ml-1 uppercase tracking-wider font-semibold">Địa chỉ Chính</label>
              <input 
                type="text"
                name="address"
                disabled={!isEditing}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur shadow-sm border border-white/50 rounded-[12px] text-ink focus:outline-none focus:border-primary focus:bg-white/80 disabled:opacity-70 disabled:bg-white/30 transition-all font-medium"
              />
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-ink/10">
            <button 
              onClick={handleDeleteProfile}
              className="flex items-center gap-2 text-[#ef4444] hover:text-[#dc2626] text-[14px] font-semibold transition-colors"
            >
              <Trash2 size={16} /> Xóa Tài khoản
            </button>
            <p className="text-[12px] text-ink-muted mt-2 max-w-sm">
              Hành động này sẽ xóa vĩnh viễn tài khoản của bạn và hủy bỏ quyền truy cập vào tất cả các dịch vụ Connect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
