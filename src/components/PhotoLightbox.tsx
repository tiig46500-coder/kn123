import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { wrapGalleryIndex } from '../utils/catalog';
import { SafeImage } from './SafeImage';

export interface LightboxImage {
  image_url: string;
  alt_text?: string;
  caption?: string;
}

interface PhotoLightboxProps {
  images: LightboxImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export function PhotoLightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
  onIndexChange,
}: PhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setIndex(initialIndex);
    setZoomed(false);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setIndex((prev) => {
          const next = wrapGalleryIndex(prev, -1, images.length);
          onIndexChange?.(next);
          return next;
        });
        setZoomed(false);
      } else if (e.key === 'ArrowRight') {
        setIndex((prev) => {
          const next = wrapGalleryIndex(prev, 1, images.length);
          onIndexChange?.(next);
          return next;
        });
        setZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, images.length, onClose, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  const current = images[index] ?? images[0];

  const go = (delta: number) => {
    const next = wrapGalleryIndex(index, delta, images.length);
    setIndex(next);
    setZoomed(false);
    onIndexChange?.(next);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trình xem ảnh phóng to"
      className="fixed inset-0 z-50 bg-[#111B14]/95 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6"
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between text-[#F7F4EA]">
        <span className="text-sm font-medium tabular-nums">
          {index + 1} / {images.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? 'Thu nhỏ ảnh' : 'Phóng to ảnh'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
          >
            {zoomed ? (
              <>
                <ZoomOut className="w-4 h-4" />
                <span>Thu nhỏ</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-4 h-4" />
                <span>Phóng to</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng xem ảnh"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Image */}
      <div
        className="relative flex-1 flex items-center justify-center my-4 overflow-hidden select-none"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
          const diff = endX - touchStartX.current;
          if (Math.abs(diff) > 40) {
            go(diff < 0 ? 1 : -1);
          }
          touchStartX.current = null;
        }}
      >
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Ảnh trước"
            className="absolute left-1 sm:left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div
          className={`max-h-[75vh] max-w-5xl w-full h-full flex items-center justify-center transition-transform duration-200 ${
            zoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
          }`}
          onClick={() => setZoomed((z) => !z)}
        >
          <SafeImage
            src={current.image_url}
            alt={current.alt_text || current.caption || 'Hình ảnh sản phẩm Lạng Xanh'}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Ảnh tiếp theo"
            className="absolute right-1 sm:right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Caption */}
      <div className="text-center text-sm text-[#E9DFC9] max-w-2xl mx-auto">
        {current.caption || current.alt_text || ''}
      </div>
    </div>
  );
}
