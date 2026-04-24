import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1560851240-099afcad338b?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Technology Devices"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-6 text-white">
          Connect.
        </h1>
        <p className="text-xl md:text-2xl text-white md:leading-relaxed max-w-2xl mb-12">
          Connect. is a project of Nguyen Tien Dat<br className="hidden md:block" />
          I hope you will enjoy your shopping experience!
        </p>
        <Link
          to="/home"
          className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-100 transition-all hover:scale-105 active:scale-95"
        >
          Bắt đầu mua sắm <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 text-sm font-medium text-white">
        <span>Giao hàng toàn quốc</span>
        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
        <span>Bảo hành chính hãng 100%</span>
        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
        <span>Hỗ trợ 24/7</span>
      </div>
    </div>
  );
};
