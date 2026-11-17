import { useState } from 'react';
import type { GalleryItem } from '../types/domain';
import { PhotoLightbox } from '../components/PhotoLightbox';
import { SafeImage } from '../components/SafeImage';

interface GalleryPageProps {
  items: GalleryItem[];
}

const ALBUMS = [
  'Tất cả',
  'Vùng nguyên liệu',
  'Sản phẩm gia dụng',
  'Sản phẩm thời trang',
  'Sản phẩm trang trí',
  'Quy trình chế tác',
  'Workshop',
  'Hoạt động nhóm',
];

export function GalleryPage({ items }: GalleryPageProps) {
  const [activeAlbum, setActiveAlbum] = useState('Tất cả');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filtered =
    activeAlbum === 'Tất cả'
      ? items
      : items.filter((item) => item.album === activeAlbum);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#63865A] font-semibold">
          Tư liệu thực tế
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#244B35]">
          Thư viện hình ảnh dự án Lạng Xanh
        </h1>
        <p className="text-base text-[#4A5A4E] leading-relaxed">
          Lưu giữ những hình ảnh chân thực về nguồn nguyên liệu xơ mướp, quy trình chế tác,
          các dòng sản phẩm và hoạt động của nhóm học sinh dự án.
        </p>
      </div>

      {/* Album Filter Tabs */}
      <div
        role="tablist"
        aria-label="Lọc album hình ảnh"
        className="flex flex-wrap gap-2"
      >
        {ALBUMS.map((album) => {
          const active = activeAlbum === album;
          return (
            <button
              key={album}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveAlbum(album)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-[#244B35] text-[#F7F4EA]'
                  : 'bg-white border border-[#244B35]/15 text-[#244B35] hover:bg-[#E9DFC9]/70'
              }`}
            >
              {album}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#244B35]/10 p-12 text-center text-sm text-[#4A5A4E]">
          Chưa có hình ảnh trong album này.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }}
              aria-label={`Mở ảnh ${item.title}`}
              className="group bg-white rounded-2xl border border-[#244B35]/10 overflow-hidden text-left shadow-xs hover:shadow-md transition-all cursor-zoom-in flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#E9DFC9]/30">
                <SafeImage
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-1">
                <p className="text-xs font-medium text-[#63865A]">{item.album}</p>
                <h2 className="font-display text-lg font-bold text-[#1E2E23]">
                  {item.title}
                </h2>
                {item.caption && (
                  <p className="text-xs text-[#4A5A4E] line-clamp-2">{item.caption}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <PhotoLightbox
        images={filtered.map((f) => ({
          image_url: f.image_url,
          alt_text: f.title,
          caption: `${f.album} · ${f.caption || f.title}`,
        }))}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
