import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Package, Truck, CheckCircle2, XCircle, Clock, Loader2, CreditCard } from 'lucide-react';
import { ordersApi, ApiError } from '../services/api';
import { Product } from '../types';
import { formatROM } from '../utils/formatUtils';


export default function MyOrdersPage() {
  const { orders, ordersLoading, loadOrders, user, getProduct } = useAppContext();
  const navigate = useNavigate();

  const [productMap, setProductMap] = useState<Map<number, Product>>(new Map());
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, loadOrders]);

  // Load product info for order items
  useEffect(() => {
    const loadProducts = async () => {
      const allProductIds = new Set<number>();
      orders.forEach(order => {
        order.orderItems.forEach(item => allProductIds.add(item.productID));
      });

      const newMap = new Map<number, Product>();
      await Promise.all(
        Array.from(allProductIds).map(async (id) => {
          try {
            const product = await getProduct(id);
            newMap.set(id, product);
          } catch { /* ignore */ }
        })
      );
      setProductMap(newMap);
    };

    if (orders.length > 0) {
      loadProducts();
    }
  }, [orders, getProduct]);

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    setCancellingId(orderId);
    setErrorMsg('');
    try {
      await ordersApi.cancel(orderId);
      await loadOrders();
    } catch (err: any) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Hủy đơn hàng thất bại.');
    } finally {
      setCancellingId(null);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Completed': return <span className="flex items-center gap-1 text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-full text-[12px] font-semibold"><CheckCircle2 size={12} /> Đã giao</span>;
      case 'Shipping': return <span className="flex items-center gap-1 text-primary bg-primary/10 px-3 py-1 rounded-full text-[12px] font-semibold"><Truck size={12} /> Đang giao</span>;
      case 'Cancelled': return <span className="flex items-center gap-1 text-[#ef4444] bg-[#ef4444]/10 px-3 py-1 rounded-full text-[12px] font-semibold"><XCircle size={12} /> Đã hủy</span>;
      case 'Processing': return <span className="flex items-center gap-1 text-[#f59e0b] bg-[#f59e0b]/10 px-3 py-1 rounded-full text-[12px] font-semibold"><Package size={12} /> Đang xử lý</span>;
      case 'Pending':
      default: return <span className="flex items-center gap-1 text-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1 rounded-full text-[12px] font-semibold"><Clock size={12} /> Chờ xác nhận</span>;
    }
  };

  const PaymentStatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Paid': return <span className="text-[#22c55e] text-[12px] font-semibold flex items-center gap-1"><CreditCard size={12} /> Đã thanh toán</span>;
      case 'Pending': return <span className="text-[#f59e0b] text-[12px] font-semibold flex items-center gap-1"><CreditCard size={12} /> Đang chờ</span>;
      default: return <span className="text-ink-muted text-[12px] font-semibold flex items-center gap-1"><CreditCard size={12} /> Chưa thanh toán</span>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-apple-body mb-4">Vui lòng đăng nhập để xem đơn hàng.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">Đăng nhập</button>
        </div>
      </div>
    );
  }

  if (ordersLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-apple-body mb-4">Bạn chưa có đơn hàng nào.</p>
          <Link to="/" className="text-primary hover:underline">Bắt đầu mua sắm</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10 min-h-screen">
      <div className="flex items-end justify-between mb-10 pb-6 border-b border-ink/10">
        <h1 className="text-apple-display-md">Đơn hàng của bạn</h1>
      </div>

      {errorMsg && (
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] rounded-[12px] px-4 py-3 text-[14px] mb-6">
          {errorMsg}
        </div>
      )}

      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order.orderID} className="glass-panel overflow-hidden">
            {/* Order Header */}
            <div className="bg-white/50 backdrop-blur px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ink/10">
              <div className="flex gap-8 text-[12px]">
                <div>
                  <div className="text-ink-muted mb-1 text-[11px] uppercase tracking-wider">Ngày đặt hàng</div>
                  <div className="font-semibold text-ink">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
                <div>
                  <div className="text-ink-muted mb-1 text-[11px] uppercase tracking-wider">Tổng cộng</div>
                  <div className="font-semibold text-ink">{order.orderFinalPrice.toLocaleString('vi-VN')} ₫</div>
                </div>
                <div>
                  <div className="text-ink-muted mb-1 text-[11px] uppercase tracking-wider">Mã đơn #</div>
                  <div className="font-semibold text-ink">{order.orderID}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={order.orderStatus} />
                <PaymentStatusBadge status={order.orderPaymentStatus} />
              </div>
            </div>

            {/* Order Content */}
            <div className="p-6">
              
              {/* Shipping info */}
              <div className="mb-6 pb-6 border-b border-ink/10">
                <div className="text-[14px] text-ink font-semibold mb-2">Chi tiết giao hàng</div>
                <div className="text-[12px] text-ink-muted space-y-1">
                  <div>Phương thức giao hàng: {order.orderShippingMethod}</div>
                  <div>Thanh toán: {order.orderPaymentMethod}</div>
                  <div>Số sản phẩm: {order.orderTotalItems}</div>
                  {order.couponID && <div>Mã giảm giá: #{order.couponID}</div>}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-6">
                {order.orderItems.map((item, idx) => {
                  const product = productMap.get(item.productID);
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="w-20 h-20 bg-white/50 backdrop-blur rounded-[8px] p-2 shrink-0 shadow-sm border border-white/50">
                        <img 
                          src={product?.imageURL?.[0] || 'https://via.placeholder.com/100'} 
                          alt={product?.productName || 'Product'} 
                          className="w-full h-full object-contain mix-blend-multiply" 
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-apple-body-strong mb-1">
                          {product?.productName || `Sản phẩm #${item.productID}`}
                        </h4>
                        {product && (
                          <div className="text-[12px] text-ink-muted space-y-1 mb-2">
                            <span>{product.color} • RAM: {product.ram}GB • ROM: {formatROM(product.rom)}</span>

                          </div>
                        )}
                        <div className="text-[12px] font-semibold text-ink">
                          SL: {item.quantity}  •  {item.unitPrice.toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Summary */}
              <div className="mt-6 pt-4 border-t border-ink/10 text-[13px] space-y-1 text-right">
                <div className="text-ink-muted">Giá sản phẩm: {order.orderTotalItemPrice.toLocaleString('vi-VN')} ₫</div>
                <div className="text-ink font-semibold text-[15px]">Tổng thanh toán: {order.orderFinalPrice.toLocaleString('vi-VN')} ₫</div>
              </div>
              
              {/* Actions */}
              <div className="max-w-[300px] ml-auto mt-6">
                {order.orderStatus === 'Pending' && (
                  <button 
                    onClick={() => handleCancelOrder(order.orderID)}
                    disabled={cancellingId === order.orderID}
                    className="w-full py-3 glass-btn text-[#ef4444] rounded-[16px] text-[14px] font-semibold flex justify-center border-transparent shadow-sm disabled:opacity-50"
                  >
                    {cancellingId === order.orderID ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      'Hủy Đơn hàng'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
