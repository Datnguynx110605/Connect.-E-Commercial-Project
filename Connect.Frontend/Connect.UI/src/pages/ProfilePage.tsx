import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { authApi, ApiError } from '../services/api';

export default function ProfilePage() {
  const { user, logout, loadProfile } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: user?.userName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleSave = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await authApi.updateProfile({
        userName: formData.userName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });
      await loadProfile();
      setIsEditing(false);
      setSuccessMsg('Hồ sơ đã được cập nhật.');
    } catch (err: any) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await authApi.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setSuccessMsg('Mật khẩu đã được cập nhật.');
      setIsChangingPassword(false);
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (err: any) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản của mình không? Hành động này không thể hoàn tác.')) {
      setLoading(true);
      try {
        await authApi.deleteProfile();
        logout();
        navigate('/');
      } catch (err: any) {
        setErrorMsg(err instanceof ApiError ? err.message : 'Xóa tài khoản thất bại.');
        setLoading(false);
      }
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

      {errorMsg && (
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] rounded-[12px] px-4 py-3 text-[14px] mb-6">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] rounded-[12px] px-4 py-3 text-[14px] mb-6">
          {successMsg}
        </div>
      )}

      <div className="max-w-[700px] mx-auto">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group cursor-pointer mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-tile-1 border-4 border-white shadow-sm flex items-center justify-center text-white text-3xl font-semibold">
              {user.userName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
          </div>
          <h2 className="text-apple-display-md text-ink text-center">{user.userName}</h2>
          <p className="text-[14px] text-ink-muted mt-1">{user.email}</p>
          {user.oAuthProviderName && (
            <p className="text-[12px] text-ink-muted mt-1">Đăng nhập qua {user.oAuthProviderName}</p>
          )}
          <p className="text-[12px] text-ink-muted mt-1">Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
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
                      userName: user.userName,
                      email: user.email,
                      phoneNumber: user.phoneNumber,
                      address: user.address,
                    });
                  }}
                  className="text-[14px] text-ink-muted hover:text-ink"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="text-[14px] text-primary font-semibold hover:underline disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin inline" /> : 'Lưu'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[12px] text-ink/70 mb-1 ml-1 uppercase tracking-wider font-semibold">Tên người dùng</label>
              <input 
                type="text"
                name="userName"
                disabled={!isEditing}
                value={formData.userName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur shadow-sm border border-white/50 rounded-[12px] text-ink focus:outline-none focus:border-primary focus:bg-white/80 disabled:opacity-70 disabled:bg-white/30 transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-[12px] text-ink/70 mb-1 ml-1 uppercase tracking-wider font-semibold">Connect ID (Email)</label>
              <input 
                type="email"
                name="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur shadow-sm border border-white/50 rounded-[12px] text-ink focus:outline-none focus:border-primary focus:bg-white/80 disabled:opacity-70 disabled:bg-white/30 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-[12px] text-ink/70 mb-1 ml-1 uppercase tracking-wider font-semibold">Số điện thoại</label>
              <input 
                type="tel"
                name="phoneNumber"
                disabled={!isEditing}
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur shadow-sm border border-white/50 rounded-[12px] text-ink focus:outline-none focus:border-primary focus:bg-white/80 disabled:opacity-70 disabled:bg-white/30 transition-all font-medium"
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

          {/* Change Password Section */}
          <div className="mt-8 pt-8 border-t border-ink/10">
            {!isChangingPassword ? (
              <button 
                onClick={() => setIsChangingPassword(true)}
                className="text-[14px] text-primary hover:underline font-semibold"
              >
                Đổi mật khẩu
              </button>
            ) : (
              <div className="space-y-4">
                <h4 className="text-apple-body-strong">Đổi mật khẩu</h4>
                <input 
                  type="password"
                  placeholder="Mật khẩu hiện tại"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur shadow-sm border border-white/50 rounded-[12px] text-ink focus:outline-none focus:border-primary focus:bg-white/80 transition-all font-medium"
                />
                <input 
                  type="password"
                  placeholder="Mật khẩu mới (5-15 ký tự)"
                  minLength={5}
                  maxLength={15}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur shadow-sm border border-white/50 rounded-[12px] text-ink focus:outline-none focus:border-primary focus:bg-white/80 transition-all font-medium"
                />
                <div className="flex gap-4">
                  <button onClick={handleChangePassword} disabled={loading} className="btn-primary px-6 py-2 disabled:opacity-50">
                    {loading ? 'Đang lưu...' : 'Cập nhật'}
                  </button>
                  <button 
                    onClick={() => { setIsChangingPassword(false); setPasswordData({ oldPassword: '', newPassword: '' }); }}
                    className="text-[14px] text-ink-muted hover:text-ink"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-12 pt-8 border-t border-ink/10">
            <button 
              onClick={handleDeleteProfile}
              disabled={loading}
              className="flex items-center gap-2 text-[#ef4444] hover:text-[#dc2626] text-[14px] font-semibold transition-colors disabled:opacity-50"
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
