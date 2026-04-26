import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { formatVND, formatStorage } from '../data/mock';
import { getAllCoupons } from '../api/coupons';
import { CouponDto } from '../api/types';
import { createOrder } from '../api/orders';
import { redirectToVNPAY } from '../api/payments';
import { getMyCart } from '../api/carts';
import { useNotification } from '../components/Notification/NotificationContext';
import { CouponTable } from '../components/Coupon/CouponTable';
import { Ticket, Truck, Zap, Rocket, Banknote, QrCode } from 'lucide-react';
import { VNPayLogo } from '../components/Icons/VNPayLogo';

export const Checkout = () => {
  const { cart, user, clearCart, refreshCart } = useAppContext();
  const { success, error, warning } = useNotification();
  const navigate = useNavigate();

  const [shippingMethod, setShippingMethod] = useState(30000);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [selectedCouponCode, setSelectedCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDto | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    refreshCart();
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
        warning('Mã giảm giá đã hết lượt sử dụng.', 'Coupon không khả dụng');
        return;
      }
      if (new Date(coupon.expiryDate) < new Date()) {
        warning('Mã giảm giá đã hết hạn.', 'Coupon hết hạn');
        return;
      }
      if (totalProductAmount < coupon.minimumPriceRequired) {
        warning(`Đơn hàng cần tối thiểu ${formatVND(coupon.minimumPriceRequired)} để áp dụng mã này.`, 'Không đủ điều kiện');
        return;
      }
      setAppliedCoupon(coupon);
      success('Đã áp dụng mã giảm giá thành công');
    } else {
      error('Mã giảm giá không hợp lệ hoặc không tồn tại.');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);

    try {
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
          items = cart.map(item => ({ productID: item.productID, unitPrice: item.finalPrice, quantity: item.quantity }));
        }
      } catch {
        items = cart.map(item => ({ productID: item.productID, unitPrice: item.finalPrice, quantity: item.quantity }));
      }

      if (items.length === 0) {
        warning('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
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
      error(msg, 'Lỗi đặt hàng');
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

            <section className="bg-white p-6 rounded-3xl border border-gray-100">
              <h2 className="text-xl font-bold mb-6">2. Phương thức giao hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 30000, label: 'Tiêu chuẩn', sub: '2-3 ngày', icon: <Truck size={24} />, enum: 0 },
                  { id: 50000, label: 'Giao nhanh', sub: '24h - 48h', icon: <Zap size={24} />, enum: 1 },
                  { id: 80000, label: 'Hỏa tốc', sub: 'Trong 2h', icon: <Rocket size={24} />, enum: 2 }
                ].map((method) => (
                  <label 
                    key={method.id}
                    className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${shippingMethod === method.id ? 'border-blue-600 bg-blue-50/50 shadow-blue-100' : 'border-gray-100 bg-white hover:border-blue-200'}`}
                  >
                    <input 
                      type="radio" 
                      name="shipping" 
                      checked={shippingMethod === method.id} 
                      onChange={() => setShippingMethod(method.id)} 
                      className="absolute top-4 right-4 text-blue-600 w-4 h-4" 
                    />
                    <div className={`mb-4 w-12 h-12 rounded-xl flex items-center justify-center ${shippingMethod === method.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {method.icon}
                    </div>
                    <span className="font-bold text-gray-900 block mb-1">{method.label}</span>
                    <span className="text-xs text-gray-500 mb-3">{method.sub}</span>
                    <span className="mt-auto font-bold text-blue-600">{formatVND(method.id)}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-3xl border border-gray-100">
              <h2 className="text-xl font-bold mb-6">3. Phương thức thanh toán</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'cash', label: 'Tiền mặt (COD)', icon: <Banknote size={24} />, sub: 'Thanh toán khi nhận' },
                  { id: 'banking', label: 'Chuyển khoản', icon: <QrCode size={24} />, sub: 'Quét mã QR' },
                  { id: 'vnpay', label: 'VNPAY', icon: <VNPayLogo size={44} />, sub: 'Cổng thanh toán' }
                ].map((method) => (
                  <label 
                    key={method.id}
                    className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${paymentMethod === method.id ? 'border-blue-600 bg-blue-50/50 shadow-blue-100' : 'border-gray-100 bg-white hover:border-blue-200'}`}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === method.id} 
                      onChange={() => setPaymentMethod(method.id)} 
                      className="absolute top-4 right-4 text-blue-600 w-4 h-4" 
                    />
                    <div className={`mb-4 w-12 h-12 rounded-xl flex items-center justify-center ${method.id === 'vnpay' ? '' : (paymentMethod === method.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500')}`}>
                      {method.icon}
                    </div>
                    <span className="font-bold text-gray-900 block mb-1">{method.label}</span>
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{method.sub}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-3xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <Ticket size={24} />
                </div>
                <h2 className="text-xl font-bold">4. Mã giảm giá ưu đãi</h2>
              </div>
              
              {coupons.length > 0 && (
                <CouponTable 
                  coupons={coupons}
                  totalProductAmount={totalProductAmount}
                  onApply={(coupon) => {
                    setAppliedCoupon(coupon);
                    setSelectedCouponCode(coupon.couponCode);
                    success('Đã áp dụng mã giảm giá thành công');
                  }}
                  appliedCouponId={appliedCoupon?.couponID}
                  manualCode={selectedCouponCode}
                  onManualCodeChange={setSelectedCouponCode}
                  onManualApply={handleApplyCoupon}
                />
              )}
              {coupons.length === 0 && (
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
                        placeholder="Nhập mã giảm giá..." 
                        className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all uppercase font-bold" 
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleApplyCoupon}
                      className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-black transition-all"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="w-full lg:w-[400px]">
            <div className="bg-gray-50 p-6 rounded-3xl sticky top-24">
              <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.cartID} className="flex gap-3 items-center">
                    <div className="w-16 h-16 bg-white rounded-lg p-1 border border-gray-100 flex-shrink-0 relative">
                      <img src={item.imageURL} alt={item.productName} className="w-full h-full object-contain" />
                      <span className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        {item.color} 
                        {item.ram > 0 && ` · ${formatStorage(item.ram)} RAM`} 
                        {item.rom > 0 && ` · ${formatStorage(item.rom)} ROM`}
                      </p>
                    </div>
                    <div className="font-semibold text-sm">{formatVND(item.finalPrice * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="mb-6 space-y-3">
                {appliedCoupon && (
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <Ticket size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Đã áp dụng mã</p>
                        <p className="font-bold text-green-700">{appliedCoupon.couponCode}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setAppliedCoupon(null);
                        setSelectedCouponCode('');
                      }}
                      className="text-xs text-green-600 hover:underline font-bold"
                    >
                      Gỡ bỏ
                    </button>
                  </div>
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
