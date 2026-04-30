import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Truck, Zap, CreditCard, DollarSign, Wallet } from 'lucide-react';
import { Order } from '../types';

export default function CheckoutPage() {
  const { cart, user, coupons, clearCart, addOrder } = useAppContext();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);

  // User Info (editable)
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [email, setEmail] = useState(user?.email || '');

  // Shipping
  const shippingMethods = [
    { id: 'standard', name: 'Standard Delivery', fee: 0, days: 5, icon: <Truck size={20} /> },
    { id: 'express', name: 'Express Delivery', fee: 15, days: 2, icon: <Zap size={20} /> }
  ];
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]);

  // Payment
  const paymentMethods = [
    { id: 'applepay', name: 'Apple Pay', icon: <img src="https://www.svgrepo.com/show/503460/apple-pay.svg" alt="Apple Pay" className="h-5" /> },
    { id: 'paypal', name: 'PayPal', icon: <img src="https://www.svgrepo.com/show/503478/paypal.svg" alt="PayPal" className="h-5" /> },
    { id: 'vnpay', name: 'VNPay', icon: <Wallet size={20} className="text-[#005BAA]" /> },
    { id: 'momo', name: 'MoMo', icon: <Wallet size={20} className="text-[#A50064]" /> },
    { id: 'cash', name: 'Cash on Delivery', icon: <DollarSign size={20} className="text-[#22c55e]" /> }
  ];
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = () => {
    setCouponError('');
    const coupon = coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
    
    if (!coupon) {
      setCouponError('Invalid coupon code.');
      return;
    }
    if (coupon.quantity <= 0) {
      setCouponError('Coupon has reached its usage limit.');
      return;
    }
    if (subtotal < coupon.minTotal) {
      setCouponError(`Minimum order amount of $${coupon.minTotal} required.`);
      return;
    }
    
    setAppliedCoupon(coupon);
  };

  const discountAmount = appliedCoupon ? (subtotal * (appliedCoupon.discountPercentage / 100)) : 0;
  const totalAmount = subtotal + selectedShipping.fee - discountAmount;

  const handlePlaceOrder = () => {
    if (!shippingAddress) {
      alert("Vui lòng cung cấp địa chỉ giao hàng.");
      return;
    }

    const predictableDate = new Date();
    predictableDate.setDate(predictableDate.getDate() + selectedShipping.days);

    const newOrder: Order = {
      id: `ord_${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.id || 'guest',
      items: cart.map(item => ({
        id: Math.random().toString(),
        name: item.name,
        image: item.image,
        price: item.salePrice,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedRom: item.selectedRom,
        selectedRam: item.selectedRam,
      })),
      totalAmount,
      shippingFee: selectedShipping.fee,
      shippingMethod: selectedShipping.name,
      predictableDayOfArrival: predictableDate.toISOString(),
      paymentMethod: selectedPayment,
      status: 'processing',
      createdAt: new Date().toISOString()
    };

    addOrder(newOrder);
    clearCart();
    navigate('/checkout/success', { state: { orderId: newOrder.id } });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-apple-body mb-4">Giỏ hàng của bạn đang trống.</p>
          <button onClick={() => navigate('/')} className="text-primary hover:underline">Tiếp tục Mua sắm</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative z-10">
      <div className="glass-panel !rounded-none pt-8 pb-8 px-4 mb-8 border-b-0 border-white/20">
        <div className="max-w-[1024px] mx-auto">
          <h1 className="text-apple-display-md">Thanh toán</h1>
        </div>
      </div>

      <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Checkout Forms */}
        <div className="flex-1 space-y-8">
          
          {/* User Info */}
          <section className="glass-panel p-8">
            <h2 className="text-apple-body-strong mb-6 text-xl">1. Thông tin Giao hàng</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] text-ink/70 mb-1 ml-1 font-semibold">Gửi xác nhận đến Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-md shadow-sm border border-white/50 rounded-[12px] focus:ring-1 focus:ring-primary focus:bg-white/80 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] text-ink/70 mb-1 ml-1 font-semibold">Địa chỉ giao hàng</label>
                <input 
                  type="text" 
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-md shadow-sm border border-white/50 rounded-[12px] focus:ring-1 focus:ring-primary focus:bg-white/80 transition-all outline-none"
                />
              </div>
            </div>
          </section>

          {/* Shipping Methods */}
          <section className="glass-panel p-8">
            <h2 className="text-apple-body-strong mb-6 text-xl">2. Phương thức Giao hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shippingMethods.map((method) => {
                const isSelected = selectedShipping.id === method.id;
                const arrivalDate = new Date();
                arrivalDate.setDate(arrivalDate.getDate() + method.days);
                
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedShipping(method)}
                    className={`flex flex-col items-start text-left p-6 rounded-[20px] transition-all duration-300 ${
                      isSelected 
                        ? 'glass-btn-active' 
                        : 'glass-btn border-transparent'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-full flex justify-center items-center backdrop-blur-md shadow-sm transition-all ${
                        isSelected ? 'bg-white/90 text-primary scale-110' : 'bg-white/50 text-ink-muted'
                      }`}>
                        {method.icon}
                      </div>
                    </div>
                    <span className={`font-semibold text-[17px] mb-2 ${isSelected ? 'text-primary' : 'text-ink'}`}>
                      {method.name}
                    </span>
                    <div className={`text-[14px] mb-3 flex-1 ${isSelected ? 'text-primary/70' : 'text-ink-muted'}`}>
                      Đến vào {arrivalDate.toLocaleDateString('vi-VN')}
                    </div>
                    <div className={`font-semibold text-[15px] ${isSelected ? 'text-primary' : 'text-ink'}`}>
                      {method.fee === 0 ? 'Miễn phí' : `${method.fee.toLocaleString('vi-VN')} ₫`}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Payment Methods */}
          <section className="glass-panel p-8">
            <h2 className="text-apple-body-strong mb-6 text-xl">3. Thanh toán</h2>
            <div className="space-y-3">
              {paymentMethods.map(method => (
                <button 
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full flex items-center justify-between p-5 rounded-[16px] transition-all duration-300 ${
                    selectedPayment === method.id 
                      ? 'glass-btn-active' 
                      : 'glass-btn border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex justify-center items-center backdrop-blur-md shadow-sm transition-all ${
                      selectedPayment === method.id ? 'bg-white/90 scale-110' : 'bg-white/50'
                    }`}>
                      {method.icon}
                    </div>
                    <span className={`font-semibold text-[15px] ${selectedPayment === method.id ? 'text-primary' : 'text-ink'}`}>
                      {method.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="glass-panel p-8 lg:sticky lg:top-[80px]">
            <h2 className="text-apple-display-md mb-6 text-2xl">Đơn hàng của bạn</h2>
            
            {/* Items */}
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {cart.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="flex gap-4">
                  <div className="w-16 h-16 bg-white/60 rounded-[12px] p-1 shrink-0 backdrop-blur shadow-sm">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1 text-[14px]">
                    <div className="font-semibold line-clamp-1">{item.name}</div>
                    <div className="text-ink-muted">SL: {item.quantity}</div>
                  </div>
                  <div className="font-semibold">{((item.salePrice || 0) * item.quantity).toLocaleString('vi-VN')} ₫</div>
                </div>
              ))}
            </div>

            {/* Coupons */}
            <div className="border-t border-ink/10 pt-6 mb-6">
              <h3 className="text-[14px] font-semibold mb-3">Mã giảm giá</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Nhập mã" 
                  className="flex-1 px-3 py-2 text-[14px] bg-white/50 backdrop-blur border border-white/50 rounded-[8px] focus:outline-none focus:border-primary shadow-sm transition-all"
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-ink text-white rounded-[8px] text-[14px] font-semibold hover:bg-ink/80 transition-all shadow-sm active:scale-95"
                >
                  Áp dụng
                </button>
              </div>
              {couponError && <p className="text-[#ef4444] text-[12px] mt-2">{couponError}</p>}
              {appliedCoupon && <p className="text-[#22c55e] text-[12px] mt-2">Mã '{appliedCoupon.code}' đã được áp dụng!</p>}
              

            </div>

            {/* Totals */}
            <div className="border-t border-ink/10 pt-6 space-y-3 mb-8 text-[14px]">
              <div className="flex justify-between">
                <span className="text-ink-muted">Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Vận chuyển</span>
                <span>{selectedShipping.fee === 0 ? 'Miễn phí' : `${selectedShipping.fee.toLocaleString('vi-VN')} ₫`}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-[#22c55e]">
                  <span>Giảm giá ({appliedCoupon.discountPercentage}%)</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-ink/10 pt-4 flex justify-between items-end mb-8">
              <span className="text-apple-body-strong">Tổng cộng</span>
              <span className="text-apple-display-md text-ink">{totalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>

            <button 
              onClick={handlePlaceOrder}
              className="w-full btn-primary py-[16px] text-lg font-semibold"
            >
              Đặt hàng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
