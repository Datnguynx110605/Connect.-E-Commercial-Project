import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Package, Truck, CheckCircle2, XCircle, RotateCw } from 'lucide-react';

export default function MyOrdersPage() {
  const { orders, user, updateOrderStatus, addToCart } = useAppContext();
  const navigate = useNavigate();

  // Show orders for current user, or guest orders if not logged in (assuming guest orders are currently stored with 'guest' userId)
  const userOrders = orders.filter(o => o.userId === (user?.id || 'guest'));

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      updateOrderStatus(orderId, 'cancelled');
    }
  };

  const handleBuyAgain = (orderItems: any[]) => {
    // Add all items to cart
    orderItems.forEach(item => {
      addToCart({
        id: Math.random().toString(),
        productId: item.productId || 'p1', // fallback since items might not have productId if generated randomly
        name: item.name,
        image: item.image,
        originalPrice: item.price,
        salePrice: item.price,
        stock: 99,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedRam: item.selectedRam,
        selectedRom: item.selectedRom
      });
    });
    navigate('/cart');
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed': return <span className="flex items-center gap-1 text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-full text-[12px] font-semibold"><CheckCircle2 size={12} /> Đã giao</span>;
      case 'shipping': return <span className="flex items-center gap-1 text-primary bg-primary/10 px-3 py-1 rounded-full text-[12px] font-semibold"><Truck size={12} /> Đang giao</span>;
      case 'cancelled': return <span className="flex items-center gap-1 text-[#ef4444] bg-[#ef4444]/10 px-3 py-1 rounded-full text-[12px] font-semibold"><XCircle size={12} /> Đã hủy</span>;
      default: return <span className="flex items-center gap-1 text-[#f59e0b] bg-[#f59e0b]/10 px-3 py-1 rounded-full text-[12px] font-semibold"><Package size={12} /> Đang xử lý</span>;
    }
  };

  if (userOrders.length === 0) {
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

      <div className="space-y-8">
        {userOrders.map((order) => (
          <div key={order.id} className="glass-panel overflow-hidden">
            {/* Order Header */}
            <div className="bg-white/50 backdrop-blur px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ink/10">
              <div className="flex gap-8 text-[12px]">
                <div>
                  <div className="text-ink-muted mb-1 text-[11px] uppercase tracking-wider">Ngày đặt hàng</div>
                  <div className="font-semibold text-ink">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
                <div>
                  <div className="text-ink-muted mb-1 text-[11px] uppercase tracking-wider">Tổng cộng</div>
                  <div className="font-semibold text-ink">{order.totalAmount.toLocaleString('vi-VN')} ₫</div>
                </div>
                <div>
                  <div className="text-ink-muted mb-1 text-[11px] uppercase tracking-wider">Mã đơn #</div>
                  <div className="font-semibold text-ink">{order.id}</div>
                </div>
              </div>
              <div>
                <StatusBadge status={order.status} />
              </div>
            </div>

            {/* Order Content */}
            <div className="p-6">
              
              {/* Shipping info */}
              <div className="mb-6 pb-6 border-b border-ink/10">
                <div className="text-[14px] text-ink font-semibold mb-2">Chi tiết giao hàng</div>
                <div className="text-[12px] text-ink-muted space-y-1">
                  <div>Dự kiến đến: {new Date(order.predictableDayOfArrival).toLocaleDateString('vi-VN')}</div>
                  <div>Phương thức: {order.shippingMethod}</div>
                  <div>Thanh toán: {order.paymentMethod}</div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-20 h-20 bg-white/50 backdrop-blur rounded-[8px] p-2 shrink-0 shadow-sm border border-white/50">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-apple-body-strong mb-1">{item.name}</h4>
                      <div className="text-[12px] text-ink-muted space-y-1 mb-2">
                        {item.selectedColor && <span>Màu sắc: {item.selectedColor} • </span>}
                        {item.selectedRom && <span>Dung lượng: {item.selectedRom} • </span>}
                        {item.selectedRam && <span>Bộ nhớ: {item.selectedRam}</span>}
                      </div>
                      <div className="text-[12px] font-semibold text-ink">
                        SL: {item.quantity}  •  {item.price.toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Actions */}
              <div className="max-w-[300px] ml-auto mt-6">
                {order.status === 'processing' && (
                  <button 
                    onClick={() => handleCancelOrder(order.id)}
                    className="w-full py-3 glass-btn text-[#ef4444] rounded-[16px] text-[14px] font-semibold flex justify-center border-transparent shadow-sm"
                  >
                    Hủy Đơn hàng
                  </button>
                )}
                {order.status === 'completed' && (
                  <button 
                    onClick={() => handleBuyAgain(order.items)}
                    className="w-full py-3 btn-primary text-white rounded-[16px] text-[14px] font-semibold flex items-center justify-center gap-2"
                  >
                    <RotateCw size={14} /> Mua lại
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
