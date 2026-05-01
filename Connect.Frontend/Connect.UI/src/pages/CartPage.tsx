import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import { Product } from '../types';

export default function CartPage() {
  const { cart, cartLoading, removeCartItem, increaseCartItem, decreaseCartItem, user, getProduct } = useAppContext();
  const navigate = useNavigate();

  // Enrich cart items with product info
  const [productMap, setProductMap] = useState<Map<number, Product>>(new Map());
  const [enrichLoading, setEnrichLoading] = useState(false);

  useEffect(() => {
    const loadProductInfo = async () => {
      if (cart.length === 0) return;
      setEnrichLoading(true);
      const newMap = new Map<number, Product>();
      await Promise.all(
        cart.map(async (item) => {
          try {
            const product = await getProduct(item.productID);
            newMap.set(item.productID, product);
          } catch {
            // Product info not available
          }
        })
      );
      setProductMap(newMap);
      setEnrichLoading(false);
    };
    loadProductInfo();
  }, [cart, getProduct]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.cartQuantity * item.cartUnitPrice), 0);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-44px)] flex flex-col items-center justify-center p-4">
        <h1 className="text-apple-display-lg mb-4">Vui lòng đăng nhập.</h1>
        <p className="text-apple-body text-ink-muted mb-8 text-center max-w-md">
          Đăng nhập để xem giỏ hàng của bạn.
        </p>
        <Link to="/login" className="btn-primary">Đăng nhập</Link>
      </div>
    );
  }

  if (cartLoading || enrichLoading) {
    return (
      <div className="min-h-[calc(100vh-44px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[calc(100vh-44px)] flex flex-col items-center justify-center p-4">
        <h1 className="text-apple-display-lg mb-4">Giỏ hàng của bạn đang trống.</h1>
        <p className="text-apple-body text-ink-muted mb-8 text-center max-w-md">
          Tiếp tục mua sắm để thêm sản phẩm vào giỏ hàng.
        </p>
        <Link to="/" className="btn-primary">Tiếp tục Mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
      <div className="flex items-end justify-between mb-10 pb-6 border-b border-ink/10">
        <h1 className="text-apple-display-md">Xem lại giỏ hàng của bạn.</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Cart Items */}
        <div className="flex-1 glass-panel p-8">
          <div className="space-y-6">
            {cart.map((item) => {
              const product = productMap.get(item.productID);
              const productImage = product?.imageURL?.[0] || 'https://via.placeholder.com/100?text=Product';
              const productName = product?.productName || `Sản phẩm #${item.productID}`;
              const productColor = product?.color;
              const productRam = product?.ram;
              const productRom = product?.rom;

              return (
                <div key={item.cartID} className="flex gap-6 pb-6 border-b border-ink/10 last:border-0 last:pb-0">
                  <Link to={`/product/${item.productID}`} className="w-32 h-32 shrink-0 bg-white/60 rounded-[16px] overflow-hidden block">
                    <img src={productImage} alt={productName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </Link>
                
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/product/${item.productID}`} className="text-apple-body-strong text-ink hover:underline">
                        {productName}
                      </Link>
                      <div className="text-apple-body-strong">{item.cartUnitPrice.toLocaleString('vi-VN')} ₫</div>
                    </div>
                    
                    <div className="text-[14px] text-ink-muted mb-4 space-y-1">
                      {productColor && <div>Màu sắc: {productColor}</div>}
                      {productRom && <div>Dung lượng: {productRom}GB</div>}
                      {productRam && <div>Bộ nhớ: {productRam}GB</div>}
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white/50 backdrop-blur-md border border-white/50 rounded-[8px] shadow-sm">
                          <button 
                            onClick={() => decreaseCartItem(item.cartID)}
                            className="p-2 text-ink-muted hover:text-ink disabled:opacity-30"
                            disabled={item.cartQuantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-[14px]">{item.cartQuantity}</span>
                          <button 
                            onClick={() => increaseCartItem(item.cartID)}
                            className="p-2 text-ink-muted hover:text-ink disabled:opacity-30"
                            disabled={item.cartQuantity >= 10}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-[13px] text-ink-muted">
                          Tổng: {(item.cartQuantity * item.cartUnitPrice).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => removeCartItem(item.cartID)}
                        className="text-[14px] text-[#0066cc] hover:underline flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="w-full lg:w-[340px] shrink-0">
          <div className="glass-panel p-6 lg:sticky lg:top-[80px]">
            <h2 className="text-apple-body-strong mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 text-[14px] mb-6">
              <div className="flex justify-between">
                <span className="text-ink-muted">Tạm tính ({cart.reduce((s, i) => s + i.cartQuantity, 0)} sản phẩm)</span>
                <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Vận chuyển</span>
                <span>Tính lúc thanh toán</span>
              </div>
            </div>
            
            <div className="border-t border-ink/10 pt-4 mb-8 flex justify-between items-end">
              <span className="text-apple-body-strong">Tổng cộng</span>
              <span className="text-apple-lead text-ink">{totalAmount.toLocaleString('vi-VN')} ₫</span>
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
