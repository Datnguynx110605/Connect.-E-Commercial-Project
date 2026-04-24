import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, XCircle, RotateCcw, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { formatVND } from '../data/mock';
import { useAppContext } from '../context/AppContext';
import { getOrderHistory, cancelOrder } from '../api/orders';
import { OrderDto } from '../api/types';
import { useNotification } from '../components/Notification/NotificationContext';
import { ConfirmationModal } from '../components/Modal/ConfirmationModal';

const STATUS_LABEL: Record<string, string> = {
  Pending: 'Chờ xác nhận',
  Processing: 'Đang xử lý',
  Shipping: 'Đang giao hàng',
  Completed: 'Đã giao',
  Cancelled: 'Đã hủy',
};

const STATUS_CLASS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipping: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

export const MyOrders = () => {
  const { user } = useAppContext();
  const { success, error } = useNotification();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    getOrderHistory()
      .then((data) => setOrders(Array.isArray(data) ? data : [data]))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleCancel = async () => {
    if (!orderToCancel) return;
    const orderId = orderToCancel;
    setCancellingId(orderId);
    setOrderToCancel(null);
    try {
      const updated = await cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.orderID === orderId ? updated : o))
      );
      success('Đã hủy đơn hàng thành công');
    } catch {
      error('Không thể hủy đơn hàng. Vui lòng thử lại.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>

        <ConfirmationModal
          isOpen={!!orderToCancel}
          onClose={() => setOrderToCancel(null)}
          onConfirm={handleCancel}
          title="Hủy đơn hàng"
          message="Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác."
          confirmLabel="Hủy đơn"
          cancelLabel="Quay lại"
          variant="danger"
          isLoading={cancellingId === orderToCancel}
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-blue-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <Package size={64} className="text-gray-300" />
            <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.orderID} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                {/* Order Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <span className="font-bold text-gray-900 mr-4">#{order.orderID}</span>
                    <span className="text-sm text-gray-500">
                      Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-medium w-max ${STATUS_CLASS[order.orderStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
                  </div>
                </div>

                <div className="p-6">
                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {order.orderItems.map((item) => (
                      <div key={item.productID} className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package size={28} className="text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 leading-tight mb-1">
                            Sản phẩm #{item.productID}
                          </p>
                          <p className="text-sm font-medium mt-1">x{item.quantity}</p>
                        </div>
                        <div className="font-bold text-gray-900">
                          {formatVND(item.unitPrice * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-gray-100 pt-6 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        Thanh toán: <span className="font-medium text-gray-700">{order.paymentMethod}</span>
                        {' · '}
                        <span className={order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}>
                          {order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 mb-1">Tổng tiền đơn hàng</p>
                      <p className="text-xl font-bold text-red-600">{formatVND(order.orderTotalPrice)}</p>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                      {order.orderStatus === 'Pending' && (
                        <button
                          onClick={() => setOrderToCancel(order.orderID)}
                          disabled={cancellingId === order.orderID}
                          className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {cancellingId === order.orderID
                            ? <Loader2 size={18} className="animate-spin" />
                            : <XCircle size={18} />}
                          Hủy đơn
                        </button>
                      )}
                      {order.orderStatus === 'Shipping' && (
                        <button className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-blue-600 border border-transparent text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                          <Truck size={18} /> Theo dõi
                        </button>
                      )}
                      {order.orderStatus === 'Completed' && (
                        <button
                          onClick={() => navigate('/products')}
                          className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gray-900 border border-transparent text-white px-6 py-2.5 rounded-xl font-medium hover:bg-black transition-colors"
                        >
                          <RotateCcw size={18} /> Mua lại
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
