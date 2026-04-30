import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Authentication logic here
    login({
      id: Math.random().toString(36).substr(2, 9),
      username: isLogin ? (formData.email.split('@')[0] || 'User') : formData.username,
      email: formData.email,
      address: formData.address || '123 Apple Park Way, Cupertino'
    });
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-44px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-10">
        <div>
          <h2 className="text-center text-apple-display-md text-ink">
            {isLogin ? 'Đăng nhập vào Connect.' : 'Tạo Connect ID của bạn.'}
          </h2>
          <p className="mt-2 text-center text-apple-body text-ink-muted">
            {isLogin ? 'Chào mừng trở lại.' : 'Một tài khoản để truy cập mọi dịch vụ Connect.'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="Họ và tên"
                  className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            )}
            
            <div>
              <input
                name="email"
                type="email"
                required
                placeholder="Connect ID (Email)"
                className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <input
                name="password"
                type="password"
                required
                placeholder="Mật khẩu"
                className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="Xác nhận mật khẩu"
                    className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    name="address"
                    type="text"
                    required
                    placeholder="Địa chỉ giao hàng"
                    className="w-full px-4 py-3 rounded-[12px] bg-white/50 backdrop-blur-md border border-white/50 focus:outline-none focus:border-primary focus:bg-white/80 transition-all shadow-sm text-[17px]"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <button type="submit" className="w-full btn-primary py-[14px]">
              {isLogin ? 'Đăng nhập' : 'Tiếp tục'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/10" />
            </div>
            <div className="relative flex justify-center text-[12px]">
              <span className="px-3 bg-white/50 backdrop-blur-md text-ink-muted rounded-full shadow-sm">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="w-full inline-flex justify-center py-2 px-4 border border-white/50 shadow-sm rounded-[12px] bg-white/70 backdrop-blur text-apple-body-strong text-ink hover:bg-white/90 transition-all">
              <img className="h-5 w-5" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
            </button>
            <button className="w-full inline-flex justify-center py-2 px-4 border border-white/50 shadow-sm rounded-[12px] bg-white/70 backdrop-blur text-apple-body-strong text-ink hover:bg-white/90 transition-all">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline text-[14px]"
          >
            {isLogin ? "Chưa có Connect ID? Tạo ngay." : "Đã có Connect ID? Đăng nhập."}
          </button>
        </div>
      </div>
    </div>
  );
}
