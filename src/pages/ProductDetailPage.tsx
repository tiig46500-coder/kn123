import { useState } from 'react';
import { Check, ChevronRight, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import type { Product, SiteSettings } from '../types/domain';
import {
  OFFICIAL_FACEBOOK_URL,
  buildFacebookOrderMessage,
  formatAvailabilityLabel,
  formatPriceVND,
  getRelatedProducts,
  resolveOrderedImages,
} from '../utils/catalog';
import { ProductCard } from '../components/ProductCard';
import { ProductGallery } from '../components/ProductGallery';

interface ProductDetailPageProps {
  product: Product | undefined;
  allProducts: Product[];
  settings: SiteSettings | null;
  onNavigate: (path: string) => void;
}

export function ProductDetailPage({
  product,
  allProducts,
  settings,
  onNavigate,
}: ProductDetailPageProps) {
  const [copied, setCopied] = useState(false);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold text-[#244B35]">
          Không tìm thấy sản phẩm
        </h1>
        <p className="text-sm text-[#4A5A4E]">
          Sản phẩm bạn tìm kiếm hiện chưa có hoặc đã được cập nhật sang đường dẫn khác.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/san-pham')}
          className="px-5 py-2.5 rounded-lg bg-[#244B35] text-[#F7F4EA] text-sm font-semibold cursor-pointer"
        >
          Quay lại danh sách sản phẩm
        </button>
      </div>
    );
  }

  const fbUrl = settings?.facebook_url || OFFICIAL_FACEBOOK_URL;
  const orderedImages = resolveOrderedImages(product);
  const related = getRelatedProducts(product, allProducts, 4);
  const orderMessage = buildFacebookOrderMessage(product.name);
  const highlightList = product.highlights
    ? product.highlights
        .split(/[·\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(orderMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav aria-label="Đường dẫn trang" className="flex flex-wrap items-center gap-1.5 text-xs text-[#4A5A4E]">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
          className="hover:text-[#244B35]"
        >
          Trang chủ
        </a>
        <ChevronRight className="w-3.5 h-3.5" />
        <a
          href="/san-pham"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/san-pham');
          }}
          className="hover:text-[#244B35]"
        >
          Sản phẩm
        </a>
        {product.category_name && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <a
              href={`/danh-muc/${product.category_slug}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`/danh-muc/${product.category_slug}`);
              }}
              className="hover:text-[#244B35]"
            >
              {product.category_name}
            </a>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#244B35] font-semibold">{product.name}</span>
      </nav>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left: Multi-Image Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery
            key={product.id}
            productName={product.name}
            images={orderedImages}
          />
        </div>

        {/* Right: Contiguous Purchase & Specification Module */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#244B35]/10 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#63865A]">
              <span>{product.category_name || 'Sản phẩm Lạng Xanh'}</span>
              <span aria-hidden="true">·</span>
              <span>{formatAvailabilityLabel(product.availability)}</span>
              {product.sku && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">Mã: {product.sku}</span>
                </>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1E2E23] leading-tight">
              {product.name}
            </h1>

            <p className="text-2xl font-bold text-[#244B35] tabular-nums pt-1">
              {formatPriceVND(product.price)}
            </p>
          </div>

          <p className="text-sm sm:text-base text-[#36493B] leading-relaxed">
            {product.full_description || product.short_description}
          </p>

          {/* Highlights */}
          {highlightList.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#244B35]/10">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[#63865A]">
                Đặc điểm nổi bật
              </h2>
              <ul className="space-y-1.5 text-sm text-[#36493B]">
                {highlightList.map((hl) => (
                  <li key={hl} className="flex items-start gap-2">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#63865A] shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specs & Material */}
          <dl className="space-y-3 pt-2 border-t border-[#244B35]/10 text-sm">
            {product.material && (
              <div>
                <dt className="text-xs font-semibold text-[#8A684B]">Chất liệu</dt>
                <dd className="text-[#1E2E23] mt-0.5">{product.material}</dd>
              </div>
            )}
            {product.specifications && (
              <div>
                <dt className="text-xs font-semibold text-[#8A684B]">Quy cách</dt>
                <dd className="text-[#1E2E23] mt-0.5">{product.specifications}</dd>
              </div>
            )}
          </dl>

          {/* Facebook Order CTA + Pre-filled Copy Message */}
          <div className="space-y-3 pt-4 border-t border-[#244B35]/10">
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#244B35] text-[#F7F4EA] text-sm font-semibold hover:bg-[#1B3A29] transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Đặt mua sản phẩm qua Facebook</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="p-3.5 rounded-xl bg-[#F7F4EA] border border-[#244B35]/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#244B35]">
                  Mẫu tin nhắn đặt hàng nhanh:
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#244B35] hover:text-[#63865A] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#244B35]" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#4A5A4E] italic">“{orderMessage}”</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-8 border-t border-[#244B35]/10 space-y-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-bold text-[#244B35]">
              CÓ THỂ BẠN CŨNG YÊU THÍCH
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('/san-pham')}
              className="text-sm font-semibold text-[#244B35] hover:underline cursor-pointer"
            >
              Xem thêm sản phẩm
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onNavigate={onNavigate}
                facebookUrl={fbUrl}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
