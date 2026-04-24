import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { formatVND } from '../data/mock';
import { getAllCoupons } from '../api/coupons';
import { CouponDto } from '../api/types';
import { createOrder } from '../api/orders';
import { redirectToVNPAY } from '../api/payments';
import { getMyCart } from '../api/carts';

export const Checkout = () => {
  const { cart, user, clearCart } = useAppContext();
  const navigate = useNavigate();

  const [shippingMethod, setShippingMethod] = useState(30000);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [selectedCouponCode, setSelectedCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDto | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getAllCoupons()
      .then(data => setCoupons(Array.isArray(data) ? data : []))
      .catch(() => setCoupons([]));
  }, []);

  const totalProductAmount = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, totalProductAmount + shippingMethod - discountAmount);

  const handleApplyCoupon = () => {
    if (!selectedCouponCode) {
      setAppliedCoupon(null);
      return;
    }
    const coupon = coupons.find(c => c.couponCode.toUpperCase() === selectedCouponCode.toUpperCase());
    if (coupon) {
      if (coupon.couponQuantity <= 0) {
        alert('Mã giảm giá đã hết lượt sử dụng.');
        return;
      }
      if (new Date(coupon.expiryDate) < new Date()) {
        alert('Mã giảm giá đã hết hạn.');
        return;
      }
      setAppliedCoupon(coupon);
    } else {
      alert('Mã giảm giá không hợp lệ hoặc không tồn tại.');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Fetch authoritative backend cart; fall back to local cart if backend cart is empty/errors
      let items: Array<{ productID: number; unitPrice: number; quantity: number }>;
      try {
        const backendCart = await getMyCart();
        const validCart = Array.isArray(backendCart) ? backendCart : [];
        if (validCart.length > 0) {
          items = validCart.map(item => ({
            productID: item.productID,
            unitPrice: item.cartUnitPrice,
            quantity: item.cartQuantity,
          }));
        } else {
          // Backend cart is empty — use local cart items (user may not be logged in)
          items = cart.map(item => ({ productID: item.productID, unitPrice: item.finalPrice, quantity: item.quantity }));
        }
      } catch {
        // Backend returned 500 "Cart not found" — fall back to local cart
        items = cart.map(item => ({ productID: item.productID, unitPrice: item.finalPrice, quantity: item.quantity }));
      }

      if (items.length === 0) {
        alert('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
        setIsProcessing(false);
        return;
      }

      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const shippingEnum = shippingMethod === 30000 ? 0 : shippingMethod === 50000 ? 1 : 2;
      const paymentEnum = paymentMethod === 'cash' ? 0 : paymentMethod === 'banking' ? 1 : 2;

      const orderData = {
        quantity: totalQuantity,
        couponID: appliedCoupon?.couponID,
        orderShippingMethod: shippingEnum,
        orderPaymentMethod: paymentEnum,
        items,
      };

      const order = await createOrder(orderData);
      clearCart();

      if (paymentMethod === 'vnpay') {
        await redirectToVNPAY(order.orderID);
      } else {
        navigate('/checkout-success');
      }
    } catch (err: any) {
      console.error('Failed to create order', err);
      const msg = err?.message || 'Đã xảy ra lỗi khi đặt hàng.';
      alert(msg);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>
        
        <form onSubmit={handleCheckout} className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-8">
            {/* User Info */}
            <section className="bg-white p-6 rounded-3xl border border-gray-100">
              <h2 className="text-xl font-bold mb-4">1. Thông tin giao hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input required type="text" defaultValue={user?.userName} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Nhập họ và tên" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input required type="tel" defaultValue={user?.phoneNumber} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" placeholder="Nhập số điện thoại" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                  <input required type="text" defaultValue={user?.address} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" placeholder="Nhập địa chỉ đầy đủ" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Tùy chọn)</label>
                  <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none min-h-[100px]" placeholder="Ghi chú về đơn hàng"></textarea>
                </div>
              </div>
            </section>

            {/* Shipping Method */}
            <section className="bg-white p-6 rounded-3xl border border-gray-100">
              <h2 className="text-xl font-bold mb-4">2. Phương thức giao hàng</h2>
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${shippingMethod === 30000 ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shippingMethod === 30000} onChange={() => setShippingMethod(30000)} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <div>
                      <span className="font-medium text-gray-900 block">Giao hàng tiêu chuẩn</span>
                      <span className="text-sm text-gray-500">Dự kiến giao 2-3 ngày</span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">30.000 ₫</span>
                </label>
                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${shippingMethod === 50000 ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shippingMethod === 50000} onChange={() => setShippingMethod(50000)} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <div>
                      <span className="font-medium text-gray-900 block">Giao hàng nhanh</span>
                      <span className="text-sm text-gray-500">Dự kiến giao ngày mai</span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">50.000 ₫</span>
                </label>
                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${shippingMethod === 80000 ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shippingMethod === 80000} onChange={() => setShippingMethod(80000)} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <div>
                      <span className="font-medium text-gray-900 block">Giao hàng hỏa tốc</span>
                      <span className="text-sm text-gray-500">Dự kiến giao trong 2h</span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">80.000 ₫</span>
                </label>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white p-6 rounded-3xl border border-gray-100">
              <h2 className="text-xl font-bold mb-4">3. Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="text-blue-600 focus:ring-blue-500 w-4 h-4 mr-3" />
                  <span className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'banking' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'banking'} onChange={() => setPaymentMethod('banking')} className="text-blue-600 focus:ring-blue-500 w-4 h-4 mr-3" />
                  <span className="font-medium text-gray-900">Chuyển khoản trực tuyến</span>
                </label>
                <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'vnpay' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} className="text-blue-600 focus:ring-blue-500 w-4 h-4 mr-3" />
                  <span className="font-medium text-gray-900">Thanh toán qua VNPAY</span>
                </label>
              </div>
            </section>
          </div>

          {/* Sticky Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-gray-50 p-6 rounded-3xl sticky top-24">
              <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.productID} className="flex gap-3 items-center">
                    <div className="w-16 h-16 bg-white rounded-lg p-1 border border-gray-100 flex-shrink-0 relative">
                      <img src={item.imageURL} alt={item.productName} className="w-full h-full object-contain" />
                      <span className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.color} {item.ram && ` - ${item.ram}GB`}</p>
                    </div>
                    <div className="font-semibold text-sm">{formatVND(item.finalPrice * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="mb-6 space-y-3">
                <select 
                  value={selectedCouponCode}
                  onChange={(e) => setSelectedCouponCode(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-gray-600"
                >
                  <option value="">Chọn mã giảm giá có sẵn...</option>
                  {coupons.filter(c => c.couponQuantity > 0 && new Date(c.expiryDate) > new Date()).map(c => (
                    <option key={c.couponID} value={c.couponCode}>
                      {c.couponCode} - Giảm {formatVND(c.discountAmount)}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={selectedCouponCode}
                    onChange={(e) => setSelectedCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                    placeholder="Hoặc nhập mã giảm giá" 
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 uppercase" 
                  />
                  <button type="button" onClick={handleApplyCoupon} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-900">Áp dụng</button>
                </div>
                {appliedCoupon && (
                  <p className="text-sm text-green-600 font-medium">Đã áp dụng mã: {appliedCoupon.couponCode}</p>
                )}
              </div>

              <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tạm tính ({cart.length} SP)</span>
                  <span className="font-medium text-gray-900">{formatVND(totalProductAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-gray-900">{formatVND(shippingMethod)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Giảm giá</span>
                    <span className="font-medium text-green-600">- {formatVND(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-gray-900">Tổng cộng</span>
                  <span className="text-2xl font-bold text-red-600">{formatVND(totalAmount)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};
