import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-[calc(100vh-44px)] flex items-center justify-center bg-canvas p-4">
      <div className="max-w-md w-full glass-panel p-10 text-center">
        <div className="flex justify-center mb-6 text-[#22c55e]">
          <CheckCircle size={64} strokeWidth={1.5} />
        </div>
        <h1 className="text-apple-display-md mb-2">Cảm ơn bạn!</h1>
        <p className="text-apple-body text-ink-muted mb-8">
          Đơn hàng của bạn đã được đặt thành công. 
          {orderId && <span className="block mt-2">Mã đơn hàng: <strong className="text-ink">{orderId}</strong></span>}
        </p>
        
        <div className="space-y-4">
          <Link to="/orders" className="block w-full btn-primary py-[14px]">
            Xem Đơn hàng của Tôi
          </Link>
          <Link to="/" className="block w-full btn-secondary py-[14px]">
            Tiếp tục Mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
