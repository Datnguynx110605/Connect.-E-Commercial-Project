import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Layout } from '../components/Layout';

export const CheckoutSuccess = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Đặt hàng thành công!</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto line-relaxed">
          Cảm ơn bạn đã mua hàng. Mã đơn hàng của bạn là <span className="font-bold text-black">#ORD-{Math.floor(Math.random() * 100000)}</span>. Chúng tôi sẽ sớm liên hệ xác nhận và tiến hành giao hàng.
        </p>

        <div className="bg-gray-50 rounded-3xl p-6 text-left mb-8 max-w-sm mx-auto">
          <h3 className="font-bold text-gray-900 mb-4">Tóm tắt thông tin</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-500">Phí vận chuyển:</span>
              <span className="font-medium text-gray-900">Giao hàng tiêu chuẩn</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">Thanh toán:</span>
              <span className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/orders" className="w-full sm:w-auto bg-gray-100 text-gray-900 px-8 py-3.5 rounded-full font-medium hover:bg-gray-200 transition-colors">
            Xem đơn hàng
          </Link>
          <Link to="/home" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-blue-700 transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </Layout>
  );
};
