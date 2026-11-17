import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Category, Product, SiteSettings, SortOption } from '../types/domain';
import { OFFICIAL_FACEBOOK_URL, filterAndSortProducts } from '../utils/catalog';
import { ProductCard } from '../components/ProductCard';

interface ProductsPageProps {
  categories: Category[];
  products: Product[];
  initialCategorySlug?: string;
  settings: SiteSettings | null;
  onNavigate: (path: string) => void;
}

export function ProductsPage({
  categories,
  products,
  initialCategorySlug = 'all',
  settings,
  onNavigate,
}: ProductsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategorySlug);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');

  useEffect(() => {
    setSelectedCategory(initialCategorySlug);
  }, [initialCategorySlug]);

  const fbUrl = settings?.facebook_url || OFFICIAL_FACEBOOK_URL;

  const filtered = filterAndSortProducts(products, {
    categorySlug: selectedCategory,
    query,
    sort,
    includeHidden: false,
  });

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      onNavigate('/san-pham');
    } else {
      onNavigate(`/danh-muc/${slug}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="max-w-3xl space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-[#63865A] font-semibold">
          Gian hàng Lạng Xanh
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#244B35]">
          {activeCategoryObj
            ? `${activeCategoryObj.group_code ? activeCategoryObj.group_code + ' – ' : ''}${activeCategoryObj.name}`
            : 'Tất cả sản phẩm từ xơ mướp'}
        </h1>
        <p className="text-base text-[#4A5A4E] leading-relaxed">
          {activeCategoryObj?.description ||
            'Khám phá các dòng sản phẩm gia dụng, thời trang, trang trí và quà tặng thủ công chế tác từ xơ mướp tự nhiên Xứ Lạng.'}
        </p>
      </div>

      {/* Category Filter Bar + Search + Sort */}
      <div className="bg-white rounded-2xl border border-[#244B35]/10 p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <label htmlFor="product-search" className="sr-only">
              Tìm sản phẩm
            </label>
            <Search className="w-4 h-4 text-[#63865A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm sản phẩm bạn yêu thích..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#244B35]/20 bg-[#F7F4EA]/50 text-sm text-[#1E2E23] placeholder:text-[#63865A]/70 focus:outline-none focus:ring-2 focus:ring-[#244B35]"
            />
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#63865A]" />
            <label htmlFor="product-sort" className="text-xs font-medium text-[#4A5A4E]">
              Sắp xếp:
            </label>
            <select
              id="product-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg border border-[#244B35]/20 bg-[#F7F4EA]/50 text-sm text-[#1E2E23] focus:outline-none focus:ring-2 focus:ring-[#244B35]"
            >
              <option value="newest">Sản phẩm mới cập nhật</option>
              <option value="name-asc">Tên A–Z</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {/* Category Segmented Tabs */}
        <div
          role="tablist"
          aria-label="Lọc theo danh mục sản phẩm"
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => handleCategoryClick('all')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#244B35] text-[#F7F4EA]'
                : 'bg-[#F7F4EA] text-[#244B35] hover:bg-[#E9DFC9]'
            }`}
          >
            Tất cả sản phẩm
          </button>
          {categories.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#244B35] text-[#F7F4EA]'
                    : 'bg-[#F7F4EA] text-[#244B35] hover:bg-[#E9DFC9]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[#4A5A4E] tabular-nums">
        <span>Hiển thị {filtered.length} sản phẩm</span>
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-[#244B35] font-semibold hover:underline cursor-pointer"
          >
            Xóa từ khóa tìm kiếm
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#244B35]/10 p-12 text-center space-y-3">
          <p className="font-display text-2xl font-semibold text-[#244B35]">
            Chưa tìm thấy sản phẩm phù hợp
          </p>
          <p className="text-sm text-[#4A5A4E]">
            Vui lòng thử lại với từ khóa khác hoặc chọn danh mục “Tất cả sản phẩm”.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              handleCategoryClick('all');
            }}
            className="px-5 py-2.5 rounded-lg bg-[#244B35] text-[#F7F4EA] text-sm font-semibold cursor-pointer"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              facebookUrl={fbUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
