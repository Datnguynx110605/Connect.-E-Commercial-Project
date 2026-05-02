import React, { useState } from 'react';
import { User } from '../../types';
import { authApi, ApiError } from '../../services/api';
import { Loader2, Phone, MapPin, User as UserIcon } from 'lucide-react';

interface CompleteProfileModalProps {
  user: User;
  onComplete: () => Promise<void>;
}

export default function CompleteProfileModal({ user, onComplete }: CompleteProfileModalProps) {
  const [formData, setFormData] = useState({
    userName: user.userName || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    address: user.address || '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // We only show this modal if user has missing info and is from OAuth
  const isMissingInfo = !user.phoneNumber || !user.address;
  const isOAuthUser = !!user.oAuthProviderName;

  if (!isOAuthUser || !isMissingInfo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      setErrorMsg('Số điện thoại không hợp lệ.');
      return;
    }

    if (!formData.address || formData.address.length < 10) {
      setErrorMsg('Địa chỉ phải có ít nhất 10 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await authApi.updateProfile({
        userName: formData.userName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });
      await onComplete();
    } catch (err: any) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="max-w-md w-full glass-panel p-8 md:p-10 shadow-2xl scale-in-center overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 mx-auto">
            <UserIcon size={32} />
          </div>

          <h2 className="text-apple-display-md text-ink text-center mb-2">Hoàn tất Hồ sơ</h2>
          <p className="text-apple-body text-ink-muted text-center mb-8">
            Chào mừng bạn đến với Connect. Vui lòng cung cấp số điện thoại và địa chỉ để chúng tôi có thể phục vụ bạn tốt hơn.
          </p>

          {errorMsg && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] rounded-[12px] px-4 py-3 text-[14px] mb-6 animate-pulse">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[12px] text-ink/70 mb-1.5 ml-1 font-semibold uppercase tracking-wider">Số điện thoại</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40">
                  <Phone size={18} />
                </span>
                <input
                  type="tel"
                  required
                  placeholder=""
                  pattern="^\d{10}$"
                  title="Đúng 10 chữ số"
                  className="w-full pl-11 pr-4 py-3.5 rounded-[16px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] text-ink/70 mb-1.5 ml-1 font-semibold uppercase tracking-wider">Địa chỉ giao hàng</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-ink/40">
                  <MapPin size={18} />
                </span>
                <textarea
                  required
                  minLength={10}
                  placeholder=""
                  className="w-full pl-11 pr-4 py-3.5 rounded-[16px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px] min-h-[100px] resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 mt-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                'Hoàn tất thiết lập'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
