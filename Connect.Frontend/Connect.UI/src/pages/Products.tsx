import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { getAllProducts } from '../api/products';
import { getAllCategories } from '../api/categories';
import { ProductDto, CategoryDto } from '../api/types';

export const Products = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  useEffect(() => {
    Promise.all([getAllProducts(), getAllCategories()])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedCategoryId = useMemo(() => {
    if (selectedCategory === 'All') return null;
    return categories.find((c) => c.categoryName === selectedCategory)?.categoryID ?? null;
  }, [selectedCategory, categories]);

  const filteredProducts = useMemo(() => {
    let result = selectedCategoryId !== null
      ? products.filter((p) => p.categoryID === selectedCategoryId)
      : products;

    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.finalPrice - b.finalPrice);
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.finalPrice - a.finalPrice);
    return result;
  }, [products, selectedCategoryId, sortBy]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">

        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-6">Bộ lọc tìm kiếm</h2>

            <div className="mb-8">
              <h3 className="font-semibold mb-3 text-sm uppercase text-gray-500 tracking-wider">Danh mục</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === 'All'}
                    onChange={() => setSelectedCategory('All')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Tất cả</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat.categoryID} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat.categoryName}
                      onChange={() => setSelectedCategory(cat.categoryName)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{cat.categoryName}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-3 text-sm uppercase text-gray-500 tracking-wider">Mức giá</h3>
              <div className="space-y-2">
                {['Dưới 10 triệu', 'Từ 10 - 20 triệu', 'Trên 20 triệu'].map((price) => (
                  <label key={price} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700">{price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-3 text-sm uppercase text-gray-500 tracking-wider">RAM</h3>
              <div className="flex flex-wrap gap-2">
                {['4GB', '8GB', '12GB', '16GB'].map((ram) => (
                  <button key={ram} className="px-3 py-1.5 border border-gray-200 rounded hover:border-blue-500 text-sm">{ram}</button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase text-gray-500 tracking-wider">ROM</h3>
              <div className="flex flex-wrap gap-2">
                {['128GB', '256GB', '512GB', '1TB'].map((rom) => (
                  <button key={rom} className="px-3 py-1.5 border border-gray-200 rounded hover:border-blue-500 text-sm">{rom}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-600 font-medium">
              Tìm thấy <span className="font-bold text-black">{filteredProducts.length}</span> sản phẩm
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.productID} product={product} />
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
