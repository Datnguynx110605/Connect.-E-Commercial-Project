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

  const hero = products[0];

  return (
    <Layout>
      <div className="bg-gray-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="relative rounded-3xl overflow-hidden bg-gray-900 aspect-[21/9] md:aspect-[3/1] flex items-center">
            <img
              src="https://images.unsplash.com/photo-1532795986-dbef1643a596?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Banner"
              className="absolute inset-0 w-full h-full object"
            />
          </div>
        </div>

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
