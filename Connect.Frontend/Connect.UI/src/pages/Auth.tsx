import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { login as apiLogin, checkEmail, verifyEmail, register as apiRegister } from '../api/users';
import { ApiError } from '../api/client';
import { useNotification } from '../components/Notification/NotificationContext';

export const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const verifyToken = searchParams.get('token');

  // If verifyToken exists, we default to Register mode.
  const [isLogin, setIsLogin] = useState(!verifyToken);
  const navigate = useNavigate();
  const { setUser } = useAppContext();
  const { success } = useNotification();

  // Registration states: 'email' -> 'waiting' -> 'verifying' -> 'details'
  const [registerStep, setRegisterStep] = useState<'email' | 'waiting' | 'verifying' | 'details'>('email');
  const [registrationSessionToken, setRegistrationSessionToken] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userName: '',
    phoneNumber: '',
    address: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (verifyToken && !verifyAttempted.current) {
      verifyAttempted.current = true;
      setIsLogin(false);
      setRegisterStep('verifying');
      handleVerifyEmail(verifyToken);
    }
  }, [verifyToken]);
  const { error: notifyError } = useNotification();

  const getErrorMessage = (err: any, context: 'login' | 'register' | 'verify') => {
    if (!(err instanceof ApiError)) {
      return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
    }

    if (err.status === 429) {
      notifyError('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.', 'Thao tác quá nhanh');
    }

    switch (err.status) {
      case 400:
        return err.message || 'Yêu cầu không hợp lệ.';
      case 401:
        if (context === 'login') return 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
        return 'Phiên làm việc đã hết hạn hoặc không có quyền truy cập.';
      case 404:
        return 'Không tìm thấy tài nguyên yêu cầu.';
      case 409:
        if (context === 'register') return 'Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.';
        return 'Dữ liệu đã tồn tại hoặc xảy ra xung đột.';
      case 429:
        return 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một lát và thử lại sau.';
      case 500:
        return 'Máy chủ đang gặp sự cố (Lỗi 500). Chúng tôi sẽ khắc phục sớm nhất có thể.';
      default:
        return err.message || 'Đã xảy ra lỗi khi kết nối với máy chủ.';
    }
  };

  const handleVerifyEmail = async (token: string) => {
    try {
      setLoading(true);
      setError('');
      const res = await verifyEmail({ verificationToken: token });

      // Handle both object and plain string responses
      const sessionToken = typeof res === 'string'
        ? res
        : (res as any).registrationSessionToken || (res as any).RegistrationSessionToken || (res as any).token || '';

      setRegistrationSessionToken(sessionToken);
      setRegisterStep('details');

      // Remove token from URL so it doesn't trigger again on refresh
      if (searchParams.has('token')) {
        searchParams.delete('token');
        setSearchParams(searchParams);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'verify'));
      setRegisterStep('email');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await apiLogin({
        email: formData.email,
        password: formData.password,
      });
      setUser(user);
      navigate('/home');
    } catch (err) {
      setError(getErrorMessage(err, 'login'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await checkEmail({ email: formData.email });
      setRegisterStep('waiting');
    } catch (err) {
      setError(getErrorMessage(err, 'register'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiRegister({
        registrationSessionToken,
        userName: formData.userName,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        address: formData.address,
      });

      // Auto-login after successful registration is a common practice,
      // but here we can just switch to login view and prefill email if we had it
      setIsLogin(true);
      setError('');
      success('Đăng ký thành công! Vui lòng đăng nhập.', 'Chào mừng bạn');
    } catch (err) {
      setError(getErrorMessage(err, 'register'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
            </h1>
            <p className="text-gray-500 text-sm">Cùng Connect khám phá thế giới công nghệ</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Đăng ký
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-600 w-4 h-4" />
                  <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="text-blue-600 font-medium hover:underline">Quên mật khẩu?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold rounded-xl py-3.5 hover:bg-blue-700 transition-colors mt-6 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : null}
                Đăng nhập
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {registerStep === 'email' && (
                <form onSubmit={handleRegisterEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      placeholder="email@example.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold rounded-xl py-3.5 hover:bg-blue-700 transition-colors mt-6 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : null}
                    Tiếp theo
                  </button>
                </form>
              )}

              {registerStep === 'waiting' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Kiểm tra email của bạn</h3>
                  <p className="text-gray-500 text-sm">
                    Chúng tôi đã gửi một liên kết xác nhận đến địa chỉ email của bạn.
                    Vui lòng nhấp vào liên kết đó để tiếp tục quá trình đăng ký.
                  </p>
                  <button
                    onClick={() => setRegisterStep('email')}
                    className="mt-6 text-sm text-blue-600 font-medium hover:underline"
                  >
                    Sử dụng email khác
                  </button>
                </div>
              )}

              {registerStep === 'verifying' && (
                <div className="text-center py-8">
                  <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <p className="text-gray-500">Đang xác thực email...</p>
                </div>
              )}

              {registerStep === 'details' && (
                <form onSubmit={handleRegisterDetailsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                    <input
                      required
                      type="text"
                      value={formData.userName}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      required
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      placeholder="0912345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input
                      required
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      placeholder="Địa chỉ giao hàng"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold rounded-xl py-3.5 hover:bg-blue-700 transition-colors mt-6 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : null}
                    Hoàn tất đăng ký
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button className="flex justify-center items-center gap-2 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5" />
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button className="flex justify-center items-center gap-2 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors bg-black">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="w-5 h-5 filter invert" />
                <span className="text-sm font-medium text-white">Apple</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};
