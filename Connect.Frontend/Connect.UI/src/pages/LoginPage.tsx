import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { authApi } from '../services/api';
import { ApiError } from '../services/api';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register-email' | 'register-form'>(
    window.location.pathname === '/verify-email' ? 'register-email' : 'login'
  );
  const { login, loginWithGoogle } = useAppContext();
  const navigate = useNavigate();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [regEmail, setRegEmail] = useState(() => localStorage.getItem('regEmail') || '');
  const [regSessionToken, setRegSessionToken] = useState('');
  const [regForm, setRegForm] = useState({
    userName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-verify if token is present in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('registrationSessionToken');
    
    if (token) {
      const autoVerify = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
          const res = await authApi.verifyEmail(token);
          setRegSessionToken(res.registrationSessionToken);
          setMode('register-form');
          // Clear query params
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err: any) {
          setErrorMsg(err instanceof ApiError ? err.message : 'Token không hợp lệ hoặc đã hết hạn.');
          setMode('register-email');
        } finally {
          setLoading(false);
        }
      };
      autoVerify();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 401) setErrorMsg('Email hoặc mật khẩu không đúng.');
        else if (err.status === 429) setErrorMsg('Quá nhiều lần thử. Vui lòng đợi 2 phút.');
        else setErrorMsg(err.message);
      } else {
        setErrorMsg('Không thể kết nối. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await authApi.checkEmail(regEmail);
      localStorage.setItem('regEmail', regEmail);
      setSuccessMsg(res.message || 'Email xác minh đã được gửi. Vui lòng kiểm tra hộp thư.');
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 409) setErrorMsg('Email đã được đăng ký.');
        else setErrorMsg(err.message);
      } else {
        setErrorMsg('Không thể kết nối. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (regForm.password !== regForm.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        registrationSessionToken: regSessionToken,
        userName: regForm.userName,
        phoneNumber: regForm.phoneNumber,
        password: regForm.password,
        address: regForm.address,
      });
      // Auto-login after registration
      await login(regEmail, regForm.password);
      localStorage.removeItem('regEmail');
      navigate('/');
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 409) setErrorMsg('Tên người dùng hoặc email đã tồn tại.');
        else setErrorMsg(err.message);
      } else {
        setErrorMsg('Không thể kết nối. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-44px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-10">
        <div>
          <h2 className="text-center text-apple-display-md text-ink">
            {mode === 'login' ? 'Đăng nhập vào Connect.' : 'Tạo Connect ID của bạn.'}
          </h2>
          <p className="mt-2 text-center text-apple-body text-ink-muted">
            {mode === 'login'
              ? 'Chào mừng trở lại.'
              : mode === 'register-email'
              ? 'Nhập email để bắt đầu đăng ký.'
              : 'Hoàn tất thông tin tài khoản của bạn.'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] rounded-[12px] px-4 py-3 text-[14px]">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] rounded-[12px] px-4 py-3 text-[14px]">
            {successMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  required
                  placeholder="Connect ID (Email)"
                  className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  placeholder="Mật khẩu"
                  className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-[14px] disabled:opacity-50">
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>
        )}

        {/* REGISTER: CHECK EMAIL STEP */}
        {mode === 'register-email' && (
          <form className="mt-8 space-y-6" onSubmit={handleCheckEmail}>
            {!successMsg ? (
              <>
                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Địa chỉ Email"
                      className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary py-[14px] disabled:opacity-50">
                  {loading ? 'Đang gửi...' : 'Gửi email xác minh'}
                </button>
              </>
            ) : (
              <div className="mt-6 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-apple-body-strong text-ink">Kiểm tra Hộp thư của bạn</p>
                <p className="text-[14px] text-ink-muted mt-2">
                  Chúng tôi đã gửi một liên kết xác minh đến <br/>
                  <strong className="text-ink">{regEmail}</strong>.
                </p>
                <button 
                  type="button"
                  onClick={() => { setSuccessMsg(''); setErrorMsg(''); }}
                  className="mt-6 text-[13px] text-primary hover:underline"
                >
                  Thử lại với email khác
                </button>
              </div>
            )}
          </form>
        )}

        {/* REGISTER: FILL INFO STEP */}
        {mode === 'register-form' && (
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] text-ink/70 mb-1 ml-1 font-semibold">Tên người dùng (3-30 ký tự, chữ thường)</label>
                <input
                  type="text"
                  required
                  placeholder="johndoe"
                  pattern="^[a-z]{3,30}$"
                  title="3-30 ký tự, chỉ chữ thường"
                  className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                  value={regForm.userName}
                  onChange={(e) => setRegForm({...regForm, userName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[12px] text-ink/70 mb-1 ml-1 font-semibold">Số điện thoại (10 chữ số)</label>
                <input
                  type="tel"
                  required
                  placeholder="0912345678"
                  pattern="^\d{10}$"
                  title="Đúng 10 chữ số"
                  className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                  value={regForm.phoneNumber}
                  onChange={(e) => setRegForm({...regForm, phoneNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[12px] text-ink/70 mb-1 ml-1 font-semibold">Mật khẩu (5-30 ký tự)</label>
                <input
                  type="password"
                  required
                  minLength={5}
                  maxLength={30}
                  placeholder="Mật khẩu"
                  className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                  value={regForm.password}
                  onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  placeholder="Xác nhận mật khẩu"
                  className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                  value={regForm.confirmPassword}
                  onChange={(e) => setRegForm({...regForm, confirmPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[12px] text-ink/70 mb-1 ml-1 font-semibold">Địa chỉ giao hàng (tối thiểu 10 ký tự)</label>
                <input
                  type="text"
                  required
                  minLength={10}
                  placeholder="123 Nguyen Hue, District 1, Ho Chi Minh City"
                  className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                  value={regForm.address}
                  onChange={(e) => setRegForm({...regForm, address: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-[14px] disabled:opacity-50">
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>
        )}

        {/* Google OAuth */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/10" />
            </div>
            <div className="relative flex justify-center text-[12px]">
              <span className="px-3 bg-white/50 backdrop-blur-md text-ink-muted rounded-full shadow-sm">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={loginWithGoogle}
              className="w-full inline-flex justify-center items-center gap-3 py-3 px-4 border border-white/50 shadow-sm rounded-[12px] bg-white/70 backdrop-blur text-apple-body-strong text-ink hover:bg-white/90 transition-all"
            >
              <img className="h-5 w-5" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
              <span>Google</span>
            </button>
          </div>
        </div>

        {/* Toggle Login / Register */}
        <div className="text-center mt-4">
          {mode === 'login' ? (
            <button 
              type="button" 
              onClick={() => { setMode('register-email'); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-primary hover:underline text-[14px]"
            >
              Chưa có Connect ID? Tạo ngay.
            </button>
          ) : (
            <button 
              type="button" 
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-primary hover:underline text-[14px]"
            >
              Đã có Connect ID? Đăng nhập.
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
