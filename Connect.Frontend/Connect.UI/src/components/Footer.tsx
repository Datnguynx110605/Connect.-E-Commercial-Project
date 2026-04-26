export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 text-sm mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect.</h2>
          <p className="text-gray-400 mb-4">
            Nền tảng thương mại điện tử chuyên biệt mang đến trải nghiệm mua sắm thiết bị công nghệ tốt nhất.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4 uppercase text-xs tracking-wider">Thông tin liên hệ</h3>
          <ul className="space-y-2">
            <li>Địa chỉ: 36 Thanh Hoa An Rau Ma </li>
            <li>Hotline: 1836 1836 18 36</li>
            <li>Email: doancuatiendat@gmail.com</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4 uppercase text-xs tracking-wider">Chính sách</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo hành</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Chính sách đổi trả</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Bảo mật thông tin</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn thanh toán</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4 uppercase text-xs tracking-wider">Kết nối với chúng tôi</h3>
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer text-white">FB</div>
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors cursor-pointer text-white">TW</div>
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer text-white">IG</div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Connect. All rights reserved.</p>
      </div>
    </footer>
  );
};
