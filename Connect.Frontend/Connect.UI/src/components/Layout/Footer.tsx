import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="glass-panel !rounded-none !border-x-0 !border-b-0 border-t border-white/50 pt-8 pb-10 px-4 mt-auto">
      <div className="max-w-[980px] mx-auto pt-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-[#86868b] text-[12px] leading-[1.33]">
          <div>
            <h3 className="font-semibold text-[#1d1d1f] mb-2">Mua sắm và Tìm hiểu</h3>
            <ul className="space-y-2">
              <li><Link to="/category/Mac" className="hover:underline">Mac</Link></li>
              <li><Link to="/category/iPad" className="hover:underline">iPad</Link></li>
              <li><Link to="/category/iPhone" className="hover:underline">iPhone</Link></li>
              <li><Link to="/category/Watch" className="hover:underline">Watch</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[#1d1d1f] mb-2">Tài khoản</h3>
            <ul className="space-y-2">
              <li><Link to="/profile" className="hover:underline">Quản lý Hồ sơ</Link></li>
              <li><Link to="/orders" className="hover:underline">Theo dõi Đơn hàng</Link></li>
              <li><Link to="/cart" className="hover:underline">Giỏ hàng Khách hàng</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[#1d1d1f] mb-2">Cửa hàng Connect</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="hover:underline">Tìm Cửa hàng</Link></li>
              <li><Link to="#" className="hover:underline">Genius Bar</Link></li>
              <li><Link to="#" className="hover:underline">Hôm nay tại Connect</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[#1d1d1f] mb-2">Về Connect Enterprise</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="hover:underline">Phòng tin tức</Link></li>
              <li><Link to="#" className="hover:underline">Lãnh đạo Connect</Link></li>
              <li><Link to="#" className="hover:underline">Cơ hội Nghề nghiệp</Link></li>
              <li><Link to="#" className="hover:underline">Nhà đầu tư</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ink/10 pt-4 flex flex-col md:flex-row justify-between items-center text-[12px] text-[#86868b]">
          <p>Bản quyền © 2026 Connect Inc. Cấp quyền bảo hộ.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link to="#" className="hover:underline border-r border-[#d2d2d7] pr-4">Chính sách Bảo mật</Link>
            <Link to="#" className="hover:underline border-r border-[#d2d2d7] pr-4">Điều khoản</Link>
            <Link to="#" className="hover:underline border-r border-[#d2d2d7] pr-4">Chính sách Mua bán</Link>
            <Link to="#" className="hover:underline">Pháp lý</Link>
          </div>
          <p className="mt-2 md:mt-0">Việt Nam</p>
        </div>

      </div>
    </footer>
  );
}
