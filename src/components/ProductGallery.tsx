import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import type { ProductImage } from '../types/domain';
import { wrapGalleryIndex } from '../utils/catalog';
import { PhotoLightbox } from './PhotoLightbox';
import { SafeImage } from './SafeImage';

interface ProductGalleryProps {
  productName: string;
  images: ProductImage[];
}

export function ProductGallery({ productName, images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const safeImages =
    images.length > 0
      ? images
      : [
          {
            id: 0,
            product_id: 0,
            image_url: '',
            alt_text: productName,
            caption: productName,
            display_order: 0,
            is_cover: 1,
          },
        ];

  const current = safeImages[activeIndex] ?? safeImages[0];

  const step = (delta: number) => {
    setActiveIndex((prev) => wrapGalleryIndex(prev, delta, safeImages.length));
  };

  return (
    <div className="space-y-4">
      {/* Main Photo Viewport */}
      <div
        className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white border border-[#244B35]/10 shadow-sm group"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null || safeImages.length <= 1) return;
          const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
          const diff = endX - touchStartX.current;
          if (Math.abs(diff) > 40) {
            step(diff < 0 ? 1 : -1);
          }
          touchStartX.current = null;
        }}
      >
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`Xem phóng to ảnh ${activeIndex + 1} của ${productName}`}
          className="w-full h-full block cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244B35]"
        >
          <SafeImage
            key={current.image_url}
            src={current.image_url}
            alt={current.alt_text || productName}
            loading="eager"
            className="w-full h-full object-cover transition-opacity duration-200"
          />
        </button>

        {/* Index Badge */}
        <span
          data-testid="gallery-counter"
          className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#1E2E23]/75 text-[#F7F4EA] text-xs font-medium tabular-nums"
        >
          {activeIndex + 1}/{safeImages.length}
        </span>

        {/* Zoom Icon */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Phóng to ảnh sản phẩm"
          className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-white text-[#244B35] shadow-xs transition-colors"
        >
          <Expand className="w-4 h-4" />
        </button>

        {/* Prev / Next Arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Ảnh trước"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#244B35] shadow-md transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Ảnh tiếp theo"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#244B35] shadow-md transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Caption */}
      {current.caption && (
        <p className="text-xs text-[#4A5A4E] italic px-1">{current.caption}</p>
      )}

      {/* Thumbnails Strip */}
      {safeImages.length > 1 && (
        <div
          role="list"
          aria-label="Danh sách ảnh thu nhỏ sản phẩm"
          className="flex gap-3 overflow-x-auto pb-1"
        >
          {safeImages.map((img, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={`${img.id}-${img.image_url}-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Chọn ảnh ${idx + 1}: ${img.caption || productName}`}
                aria-current={active ? 'true' : undefined}
                className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  active
                    ? 'border-[#244B35] ring-2 ring-[#244B35]/20'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <SafeImage
                  src={img.image_url}
                  alt={img.alt_text || `${productName} ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox */}
      <PhotoLightbox
        images={safeImages}
        initialIndex={activeIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={(idx) => setActiveIndex(idx)}
      />
    </div>
  );
}
