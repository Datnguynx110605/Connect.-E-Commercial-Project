import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, LogOut, Package, Trash2, KeyRound, User as UserIcon, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { getProfile, updateProfile, changePassword, deleteProfile } from '../api/users';
import { ApiError } from '../api/client';

export const Profile = () => {
  const { user, setUser, logout, isLoadingUser } = useAppContext();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('info');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Info form state
  const [infoForm, setInfoForm] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  // Password form state
  const [pwForm, setPwForm] = useState({
    oldPassword: '',
    password: '',
    confirm: '',
  });

  useEffect(() => {
    if (!isLoadingUser && !user) {
      navigate('/auth');
    }
  }, [user, isLoadingUser, navigate]);

  useEffect(() => {
    if (user) {
      setInfoForm({
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
      });
    }
  }, [user]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await updateProfile(infoForm);
      setUser(updated);
      setFeedback({ type: 'success', msg: 'Cập nhật thông tin thành công!' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Cập nhật thất bại.';
      setFeedback({ type: 'error', msg });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.confirm) {
      setFeedback({ type: 'error', msg: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await changePassword({ oldPassword: pwForm.oldPassword, password: pwForm.password });
      setFeedback({ type: 'success', msg: 'Đổi mật khẩu thành công!' });
      setPwForm({ oldPassword: '', password: '', confirm: '' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Đổi mật khẩu thất bại.';
      setFeedback({ type: 'error', msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Bạn có chắc muốn xóa tài khoản? Hành động này không thể hoàn tác.')) return;
    try {
      await deleteProfile();
      logout();
      navigate('/');
    } catch {
      alert('Không thể xóa tài khoản lúc này.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  if (isLoadingUser) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-40">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col items-center">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 border-4 border-white shadow-sm flex items-center justify-center text-3xl font-bold">
                {user.userName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">{user.userName}</h2>
            <p className="text-sm text-gray-500 mb-1">{user.email}</p>
            <span className={`text-xs font-medium px-3 py-1 rounded-full mb-6 ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {user.role}
            </span>

            <div className="w-full space-y-2">
              <button
                onClick={() => { setActiveTab('info'); setFeedback(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'info' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <UserIcon size={20} /> Thông tin cá nhân
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Package size={20} /> Đơn hàng của tôi
              </button>
              <button
                onClick={() => { setActiveTab('password'); setFeedback(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'password' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <KeyRound size={20} /> Đổi mật khẩu
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors mt-4"
              >
                <LogOut size={20} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">

            {/* Feedback banner */}
            {feedback && (
              <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {feedback.msg}
              </div>
            )}

            {activeTab === 'info' && (
              <>
                <h2 className="text-2xl font-bold mb-8 text-gray-900">Thông tin cá nhân</h2>
                <form onSubmit={handleSaveInfo} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tên người dùng</label>
                      <input
                        type="text"
                        value={infoForm.userName}
                        onChange={(e) => setInfoForm({ ...infoForm, userName: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        value={infoForm.phoneNumber}
                        onChange={(e) => setInfoForm({ ...infoForm, phoneNumber: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={infoForm.email}
                        onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                      <input
                        type="text"
                        value={infoForm.address}
                        onChange={(e) => setInfoForm({ ...infoForm, address: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="text-red-500 font-medium hover:underline text-sm flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Xóa tài khoản
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {saving && <Loader2 size={16} className="animate-spin" />}
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === 'password' && (
              <>
                <h2 className="text-2xl font-bold mb-8 text-gray-900">Đổi mật khẩu</h2>
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      required
                      value={pwForm.oldPassword}
                      onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 tracking-widest"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      value={pwForm.password}
                      onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 tracking-widest"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 tracking-widest"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {saving && <Loader2 size={16} className="animate-spin" />}
                      Cập nhật mật khẩu
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>

      </div>
    </Layout>
  );
};
