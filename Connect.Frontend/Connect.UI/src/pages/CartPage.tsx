import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useAppContext();
  const navigate = useNavigate();

  const totalAmount = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[calc(100vh-44px)] flex flex-col items-center justify-center p-4">
        <h1 className="text-apple-display-lg mb-4">Giỏ hàng của bạn đang trống.</h1>
        <p className="text-apple-body text-ink-muted mb-8 text-center max-w-md">
          Đăng nhập để xem bạn có sản phẩm nào đã lưu không. Hoặc tiếp tục mua sắm.
        </p>
        <Link to="/" className="btn-primary">Tiếp tục Mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
      <div className="flex items-end justify-between mb-10 pb-6 border-b border-ink/10">
        <h1 className="text-apple-display-md">Xem lại giỏ hàng của bạn.</h1>
        <button onClick={clearCart} className="text-[14px] text-ink-muted hover:text-[#ef4444] flex items-center gap-1">
          <Trash2 size={16} /> Xóa tất cả
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Cart Items */}
        <div className="flex-1 glass-panel p-8">
          <div className="space-y-6">
            {cart.map((item, idx) => (
              <div key={`${item.productId}-${idx}`} className="flex gap-6 pb-6 border-b border-ink/10 last:border-0 last:pb-0">
                <Link to={`/product/${item.productId}`} className="w-24 h-24 shrink-0 bg-white/50 rounded-[12px] p-2">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
              </Link>
              
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/product/${item.productId}`} className="text-apple-body-strong text-ink hover:underline">
                    {item.name}
                  </Link>
                  <div className="text-apple-body-strong">{item.salePrice.toLocaleString('vi-VN')} ₫</div>
                </div>
                
                <div className="text-[14px] text-ink-muted mb-4 space-y-1">
                  {item.selectedColor && <div>Màu sắc: {item.selectedColor}</div>}
                  {item.selectedRom && <div>Dung lượng: {item.selectedRom}</div>}
                  {item.selectedRam && <div>Bộ nhớ: {item.selectedRam}</div>}
                  <div>Còn lại: {item.stock}</div>
                </div>
                
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white/50 backdrop-blur-md border border-white/50 rounded-[8px] shadow-sm">
                      <button 
                        onClick={() => updateCartQuantity(item.productId, { color: item.selectedColor, ram: item.selectedRam, rom: item.selectedRom }, -1)}
                        className="p-2 text-ink-muted hover:text-ink disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-[14px]">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.productId, { color: item.selectedColor, ram: item.selectedRam, rom: item.selectedRom }, 1)}
                        className="p-2 text-ink-muted hover:text-ink disabled:opacity-30"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.productId, { color: item.selectedColor, ram: item.selectedRam, rom: item.selectedRom })}
                    className="text-[14px] text-[#0066cc] hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="w-full lg:w-[340px] shrink-0">
          <div className="glass-panel p-6 lg:sticky lg:top-[80px]">
            <h2 className="text-apple-body-strong mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 text-[14px] mb-6">
              <div className="flex justify-between">
                <span className="text-ink-muted">Tạm tính</span>
                <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Vận chuyển</span>
                <span>Tính lúc thanh toán</span>
              </div>
            </div>
            
            <div className="border-t border-ink/10 pt-4 mb-8 flex justify-between items-end">
              <span className="text-apple-body-strong">Tổng cộng</span>
              <span className="text-apple-display-md text-ink">{totalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary py-[14px]"
            >
              Thanh toán
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
