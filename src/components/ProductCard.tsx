import { ExternalLink, Images } from 'lucide-react';
import type { Product } from '../types/domain';
import {
  OFFICIAL_FACEBOOK_URL,
  formatAvailabilityLabel,
  formatPriceVND,
  getCoverImageUrl,
  resolveOrderedImages,
} from '../utils/catalog';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
  facebookUrl?: string;
}

export function ProductCard({
  product,
  onNavigate,
  facebookUrl = OFFICIAL_FACEBOOK_URL,
}: ProductCardProps) {
  const cover = getCoverImageUrl(product);
  const images = resolveOrderedImages(product);
  const photoCount = images.length;

  const handleDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(`/san-pham/${product.slug}`);
  };

  return (
    <article className="group flex flex-col h-full bg-white rounded-xl border border-[#244B35]/10 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <a
        href={`/san-pham/${product.slug}`}
        onClick={handleDetail}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#E9DFC9]/35 block"
      >
        <SafeImage
          src={cover}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {photoCount > 1 && (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1E2E23]/75 backdrop-blur-xs text-[#F7F4EA] text-xs font-medium tabular-nums">
            <Images className="w-3.5 h-3.5" />
            <span>Xem {photoCount} ảnh</span>
          </span>
        )}
      </a>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 text-xs text-[#63865A] font-medium mb-1.5">
          <span>{product.category_name || 'Sản phẩm xanh'}</span>
          <span aria-hidden="true">·</span>
          <span>{formatAvailabilityLabel(product.availability)}</span>
        </div>

        <h3 className="font-display text-xl font-semibold text-[#1E2E23] leading-snug mb-2">
          <a
            href={`/san-pham/${product.slug}`}
            onClick={handleDetail}
            className="hover:text-[#244B35] transition-colors"
          >
            {product.name}
          </a>
        </h3>

        <p className="text-sm text-[#4A5A4E] line-clamp-2 leading-relaxed mb-4">
          {product.short_description}
        </p>

        <div className="mt-auto pt-3 border-t border-[#244B35]/10 space-y-3">
          <p className="text-sm font-semibold text-[#244B35] tabular-nums">
            {formatPriceVND(product.price)}
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={`/san-pham/${product.slug}`}
              onClick={handleDetail}
              className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold rounded-lg border border-[#244B35]/25 text-[#244B35] hover:bg-[#F7F4EA] transition-colors whitespace-nowrap"
            >
              Chi tiết
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Đặt mua ${product.name} qua Facebook`}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-[#244B35] text-[#F7F4EA] hover:bg-[#1B3A29] transition-colors whitespace-nowrap"
            >
              <span>Đặt mua</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
