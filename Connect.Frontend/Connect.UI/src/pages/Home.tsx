import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { getAllProducts } from '../api/products';
import { getAllCategories } from '../api/categories';
import { ProductDto, CategoryDto } from '../api/types';

export const Home = () => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllProducts(), getAllCategories()])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  // Show the first featured product for the hero banner
  const hero = products[0];

  return (
    <Layout>
      <div className="bg-gray-50 pb-16">
        {/* Banner */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="relative rounded-3xl overflow-hidden bg-gray-900 aspect-[21/9] md:aspect-[3/1] flex items-center">
            <img
              src="https://images.unsplash.com/photo-1550009158-9ffcbcdbfc11?auto=format&fit=crop&q=80&w=1600"
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
            />
            <div className="relative z-10 px-8 md:px-16 w-full md:w-2/3">
              <span className="text-blue-400 font-bold tracking-wider uppercase text-sm mb-2 block">Ưu đãi độc quyền</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {hero ? hero.productName : 'Điện thoại cao cấp'}<br />Sẵn sàng trao tay.
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-md">Mua ngay để nhận bộ quà tặng trị giá 2.000.000đ.</p>
              <Link
                to={hero ? `/product/${hero.productID}` : '/products'}
                className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-blue-700 transition-colors inline-block"
              >
                Mua ngay
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Menu */}
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h3 className="text-xl font-bold mb-6 text-gray-900">Danh mục sản phẩm</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {categories.map((cat) => (
              <Link
                key={cat.categoryID}
                to={`/products?category=${encodeURIComponent(cat.categoryName)}`}
                className="flex-none px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 font-medium hover:text-blue-600 hover:border-blue-300 transition-colors snap-center"
              >
                {cat.categoryName}
              </Link>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Sản phẩm nổi bật</h3>
            <Link to="/products" className="text-blue-600 font-medium hover:underline">Xem tất cả</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-400 py-20">Chưa có sản phẩm nào.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.productID} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
