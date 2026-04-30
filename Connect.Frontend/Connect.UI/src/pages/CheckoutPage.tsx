import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Truck, Zap, Rocket, DollarSign, Wallet, Loader2, Tag, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { ordersApi, couponsApi, paymentsApi, ApiError } from '../services/api';
import { Product, Coupon } from '../types';

export default function CheckoutPage() {
  const { cart, user, loadCart, getProduct } = useAppContext();
  const navigate = useNavigate();

  // Product info for display
  const [productMap, setProductMap] = useState<Map<number, Product>>(new Map());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load product details for cart items
  useEffect(() => {
    const loadProducts = async () => {
      if (cart.length === 0) return;
      const newMap = new Map<number, Product>();
      await Promise.all(
        cart.map(async (item) => {
          try {
            const product = await getProduct(item.productID);
            newMap.set(item.productID, product);
          } catch { /* ignore */ }
        })
      );
      setProductMap(newMap);
    };
    loadProducts();
  }, [cart, getProduct]);

  const subtotal = cart.reduce((acc, item) => acc + item.cartTotalPrice, 0);

  // Shipping
  const shippingMethods = [
    { id: 0, name: 'Tiêu chuẩn', fee: 30000, days: 5, icon: <Truck size={20} /> },
    { id: 1, name: 'Nhanh', fee: 50000, days: 2, icon: <Zap size={20} /> },
    { id: 2, name: 'Siêu tốc', fee: 80000, days: 1, icon: <Rocket size={20} /> },
  ];
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]);

  // Payment
  const paymentMethods = [
    { id: 0, name: 'Thanh toán khi nhận hàng', icon: <DollarSign size={20} className="text-[#22c55e]" /> },
    { id: 1, name: 'Chuyển khoản Ngân hàng', icon: <Wallet size={20} className="text-[#0066cc]" /> },
    { id: 2, name: 'VNPAY', icon: <Wallet size={20} className="text-[#005BAA]" /> },
  ];
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showCouponPanel, setShowCouponPanel] = useState(false);

  // Fetch coupons when panel opens
  useEffect(() => {
    if (!showCouponPanel || availableCoupons.length > 0) return;
    const fetchCoupons = async () => {
      setCouponsLoading(true);
      try {
        const result = await couponsApi.getAll(1, 50);
        setAvailableCoupons(result.items);
      } catch {
        // silently fail
      } finally {
        setCouponsLoading(false);
      }
    };
    fetchCoupons();
  }, [showCouponPanel, availableCoupons.length]);

  const validateAndApply = (coupon: Coupon): string | null => {
    if (coupon.couponQuantity <= 0) return 'Mã giảm giá đã hết lượt sử dụng.';
    if (new Date(coupon.expiryDate) < new Date()) return 'Mã giảm giá đã hết hạn.';
    if (subtotal < coupon.minimumPriceRequired)
      return `Đơn hàng tối thiểu ${coupon.minimumPriceRequired.toLocaleString('vi-VN')} ₫.`;
    if (coupon.discountAmount > subtotal + selectedShipping.fee)
      return 'Mức giảm vượt quá tổng đơn hàng.';
    return null;
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    setAppliedCoupon(null);
    setCouponLoading(true);
    try {
      const result = await couponsApi.getAll(1, 50);
      const coupon = result.items.find(
        (c) => c.couponCode.toLowerCase() === couponCode.toLowerCase()
      );
      if (!coupon) {
        setCouponError('Mã giảm giá không hợp lệ.');
        return;
      }
      const err = validateAndApply(coupon);
      if (err) { setCouponError(err); return; }
      setAppliedCoupon(coupon);
      setShowCouponPanel(false);
    } catch (err: any) {
      setCouponError(err.message || 'Không thể kiểm tra mã giảm giá.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSelectCoupon = (coupon: Coupon) => {
    setCouponError('');
    const err = validateAndApply(coupon);
    if (err) { setCouponError(err); return; }
    setAppliedCoupon(coupon);
    setCouponCode(coupon.couponCode);
    setShowCouponPanel(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const isCouponValid = (c: Coupon) =>
    c.couponQuantity > 0 &&
    new Date(c.expiryDate) >= new Date() &&
    subtotal >= c.minimumPriceRequired;

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = subtotal + selectedShipping.fee - discountAmount;

  const handlePlaceOrder = async () => {
    if (!user) { navigate('/login'); return; }
    setErrorMsg('');
    setLoading(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          productID: item.productID,
          unitPrice: item.cartUnitPrice,
          quantity: item.cartQuantity,
        })),
        couponID: appliedCoupon?.couponID || null,
        orderShippingMethod: selectedShipping.id,
        orderPaymentMethod: selectedPayment,
      };
      const order = await ordersApi.create(orderData);
      await loadCart();
      if (selectedPayment === 2) {
        try {
          const payment = await paymentsApi.createPaymentUrl(order.orderID);
          window.location.href = payment.paymentUrl;
          return;
        } catch (err: any) {
          console.error('Failed to create payment URL:', err);
        }
      }
      navigate('/checkout/success', { state: { orderId: order.orderID } });
    } catch (err: any) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-apple-body mb-4">Vui lòng đăng nhập để thanh toán.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">Đăng nhập</button>
        </div>
      </div>
    );
  }

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

      {errorMsg && (
        <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] rounded-[12px] px-4 py-3 text-[14px]">
            {errorMsg}
          </div>
        </div>
      )}

      <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Left Column */}
        <div className="flex-1 space-y-8">
          
          {/* User Info */}
          <section className="glass-panel p-8">
            <h2 className="text-apple-body-strong mb-6 text-xl">1. Thông tin Giao hàng</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] text-ink/70 mb-1 ml-1 font-semibold">Email</label>
                <div className="w-full px-4 py-3 bg-white/30 backdrop-blur-md shadow-sm border border-white/50 rounded-[12px] text-ink/70">{user.email}</div>
              </div>
              <div>
                <label className="block text-[12px] text-ink/70 mb-1 ml-1 font-semibold">Địa chỉ giao hàng</label>
                <div className="w-full px-4 py-3 bg-white/30 backdrop-blur-md shadow-sm border border-white/50 rounded-[12px] text-ink/70">
                  {user.address || 'Chưa có địa chỉ. Vui lòng cập nhật trong hồ sơ.'}
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-ink/70 mb-1 ml-1 font-semibold">Số điện thoại</label>
                <div className="w-full px-4 py-3 bg-white/30 backdrop-blur-md shadow-sm border border-white/50 rounded-[12px] text-ink/70">
                  {user.phoneNumber || 'Chưa có SĐT'}
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Methods */}
          <section className="glass-panel p-8">
            <h2 className="text-apple-body-strong mb-6 text-xl">2. Phương thức Giao hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shippingMethods.map((method) => {
                const isSelected = selectedShipping.id === method.id;
                const arrivalDate = new Date();
                arrivalDate.setDate(arrivalDate.getDate() + method.days);
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedShipping(method)}
                    className={`flex flex-col items-start text-left p-6 rounded-[20px] transition-all duration-300 ${
                      isSelected ? 'glass-btn-active' : 'glass-btn border-transparent'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-full flex justify-center items-center backdrop-blur-md shadow-sm transition-all ${
                        isSelected ? 'bg-white/90 text-primary scale-110' : 'bg-white/50 text-ink-muted'
                      }`}>
                        {method.icon}
                      </div>
                    </div>
                    <span className={`font-semibold text-[17px] mb-2 ${isSelected ? 'text-primary' : 'text-ink'}`}>{method.name}</span>
                    <div className={`text-[14px] mb-3 flex-1 ${isSelected ? 'text-primary/70' : 'text-ink-muted'}`}>
                      Đến vào {arrivalDate.toLocaleDateString('vi-VN')}
                    </div>
                    <div className={`font-semibold text-[15px] ${isSelected ? 'text-primary' : 'text-ink'}`}>
                      {method.fee.toLocaleString('vi-VN')} ₫
                    </div>
                  </button>
                );
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
                    selectedPayment === method.id ? 'glass-btn-active' : 'glass-btn border-transparent'
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

          {/* Coupon Section */}
          <section className="glass-panel p-8">
            <h2 className="text-apple-body-strong mb-6 text-xl">4. Mã giảm giá</h2>

            {/* Applied coupon badge */}
            {appliedCoupon && (
              <div className="flex items-center justify-between bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-[12px] px-4 py-3 mb-4">
                <div className="flex items-center gap-2 text-[#22c55e]">
                  <Check size={16} />
                  <span className="font-semibold text-[14px]">{appliedCoupon.couponCode}</span>
                  <span className="text-[13px]">— Giảm {appliedCoupon.discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                <button onClick={handleRemoveCoupon} className="text-[12px] text-ink-muted hover:text-[#ef4444] transition-colors">Xóa</button>
              </div>
            )}

            {/* Toggle panel button */}
            <button
              type="button"
              onClick={() => setShowCouponPanel(!showCouponPanel)}
              className="w-full flex items-center justify-between px-4 py-3 glass-btn rounded-[12px] text-[14px] font-semibold text-ink transition-all"
            >
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-primary" />
                <span>{appliedCoupon ? 'Thay đổi mã giảm giá' : 'Chọn hoặc nhập mã giảm giá'}</span>
              </div>
              {showCouponPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showCouponPanel && (
              <div className="mt-4 space-y-5">
                {/* Manual code entry */}
                <div>
                  <label className="block text-[12px] text-ink/70 mb-2 font-semibold">Nhập mã thủ công</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder="Nhập mã giảm giá..."
                      className="flex-1 px-3 py-2 text-[14px] bg-white/50 backdrop-blur border border-white/50 rounded-[8px] focus:outline-none focus:border-primary shadow-sm transition-all"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode}
                      className="px-4 py-2 bg-ink text-white rounded-[8px] text-[14px] font-semibold hover:bg-ink/80 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                  {couponError && <p className="text-[#ef4444] text-[12px] mt-2">{couponError}</p>}
                </div>

                {/* Coupon table */}
                <div>
                  <label className="block text-[12px] text-ink/70 mb-2 font-semibold">Mã khả dụng</label>
                  {couponsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 size={24} className="animate-spin text-primary" />
                    </div>
                  ) : availableCoupons.length === 0 ? (
                    <p className="text-[13px] text-ink-muted text-center py-6">Không có mã giảm giá nào.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-[12px] border border-white/40">
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr className="bg-white/40 backdrop-blur-md border-b border-white/30">
                            <th className="text-left px-4 py-3 font-semibold text-ink/70">Mã</th>
                            <th className="text-left px-4 py-3 font-semibold text-ink/70">Giảm</th>
                            <th className="text-left px-4 py-3 font-semibold text-ink/70 hidden sm:table-cell">Đơn tối thiểu</th>
                            <th className="text-left px-4 py-3 font-semibold text-ink/70 hidden md:table-cell">Hết hạn</th>
                            <th className="text-left px-4 py-3 font-semibold text-ink/70 hidden sm:table-cell">Lượt</th>
                            <th className="px-4 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/20">
                          {availableCoupons.map(coupon => {
                            const valid = isCouponValid(coupon);
                            const isApplied = appliedCoupon?.couponID === coupon.couponID;
                            return (
                              <tr
                                key={coupon.couponID}
                                className={`transition-colors ${valid ? 'hover:bg-white/30' : 'opacity-50'} ${isApplied ? 'bg-[#22c55e]/10' : 'bg-white/10'}`}
                              >
                                <td className="px-4 py-3">
                                  <span className="font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded-[6px]">
                                    {coupon.couponCode}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-[#22c55e]">
                                  -{coupon.discountAmount.toLocaleString('vi-VN')} ₫
                                </td>
                                <td className="px-4 py-3 text-ink-muted hidden sm:table-cell">
                                  {coupon.minimumPriceRequired.toLocaleString('vi-VN')} ₫
                                </td>
                                <td className="px-4 py-3 text-ink-muted hidden md:table-cell">
                                  {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-4 py-3 text-ink-muted hidden sm:table-cell">
                                  {coupon.couponQuantity}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {isApplied ? (
                                    <span className="text-[#22c55e] font-semibold flex items-center gap-1 justify-end">
                                      <Check size={14} /> Đã dùng
                                    </span>
                                  ) : (
                                    <button
                                      disabled={!valid}
                                      onClick={() => handleSelectCoupon(coupon)}
                                      className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold bg-primary text-white hover:bg-primary/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      Dùng
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="glass-panel p-8 lg:sticky lg:top-[80px]">
            <h2 className="text-apple-display-md mb-6 text-2xl">Đơn hàng của bạn</h2>
            
            {/* Items */}
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {cart.map((item) => {
                const product = productMap.get(item.productID);
                return (
                  <div key={item.cartID} className="flex gap-4">
                    <div className="w-16 h-16 bg-white/60 rounded-[12px] p-1 shrink-0 backdrop-blur shadow-sm">
                      <img
                        src={product?.imageURL?.[0] || 'https://via.placeholder.com/100'}
                        alt={product?.productName || 'Product'}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 text-[14px]">
                      <div className="font-semibold line-clamp-1">{product?.productName || `Sản phẩm #${item.productID}`}</div>
                      <div className="text-ink-muted">SL: {item.cartQuantity}</div>
                    </div>
                    <div className="font-semibold">{item.cartTotalPrice.toLocaleString('vi-VN')} ₫</div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="border-t border-ink/10 pt-6 space-y-3 mb-4 text-[14px]">
              <div className="flex justify-between">
                <span className="text-ink-muted">Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Vận chuyển ({selectedShipping.name})</span>
                <span>{selectedShipping.fee.toLocaleString('vi-VN')} ₫</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-[#22c55e]">
                  <span>Giảm giá ({appliedCoupon.couponCode})</span>
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
              disabled={loading}
              className="w-full btn-primary py-[16px] text-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : 'Đặt hàng'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
