import React from 'react';
import { Ticket, Info, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { CouponDto } from '../../api/types';
import { formatVND } from '../../data/mock';

interface CouponTableProps {
  coupons: CouponDto[];
  totalProductAmount: number;
  onApply: (coupon: CouponDto) => void;
  appliedCouponId?: number;
}

export const CouponTable: React.FC<CouponTableProps & { manualCode: string; onManualCodeChange: (code: string) => void; onManualApply: () => void }> = ({
  coupons,
  totalProductAmount,
  onApply,
  appliedCouponId,
  manualCode,
  onManualCodeChange,
  onManualApply,
}) => {
  return (
    <div className="overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div className="p-6 border-b border-gray-50 bg-gray-50/30">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={manualCode}
              onChange={(e) => onManualCodeChange(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onManualApply();
                }
              }}
              placeholder="Nhập mã giảm giá khác..." 
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all uppercase font-bold tracking-wider" 
            />
          </div>
          <button 
            type="button" 
            onClick={onManualApply}
            className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            Áp dụng
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã giảm giá</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Giảm giá</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Điều kiện</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hạn dùng</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {coupons.map((coupon) => {
              const isExpired = new Date(coupon.expiryDate) < new Date();
              const isLowQuantity = coupon.couponQuantity <= 0;
              const isUnderMinPrice = totalProductAmount < coupon.minimumPriceRequired;
              const isInvalid = isExpired || isLowQuantity || isUnderMinPrice;
              const isApplied = appliedCouponId === coupon.couponID;

              return (
                <tr 
                  key={coupon.couponID} 
                  className={`group transition-all ${isInvalid ? 'opacity-40 grayscale-[0.5]' : 'hover:bg-blue-50/30'}`}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isInvalid ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                        <Ticket size={18} />
                      </div>
                      <span className="font-bold text-gray-900 tracking-wide uppercase">{coupon.couponCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-green-600 font-bold text-base">
                    -{formatVND(coupon.discountAmount)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-medium ${isUnderMinPrice ? 'text-red-500' : 'text-gray-600'}`}>
                        Tối thiểu {formatVND(coupon.minimumPriceRequired)}
                      </span>
                      {isUnderMinPrice && (
                        <span className="text-[10px] text-red-400 flex items-center gap-1">
                          <Info size={10} /> Còn thiếu {formatVND(coupon.minimumPriceRequired - totalProductAmount)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>{new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {isApplied ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-bold">
                        <CheckCircle2 size={16} />
                        Đã áp dụng
                      </span>
                    ) : isInvalid ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-sm font-bold">
                        <XCircle size={16} />
                        Không đủ đ.kiện
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onApply(coupon)}
                        className="px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                      >
                        Áp dụng
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
