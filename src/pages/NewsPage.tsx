import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import type { Article } from '../types/domain';
import { SafeImage } from '../components/SafeImage';

interface NewsPageProps {
  articles: Article[];
}

export function NewsPage({ articles }: NewsPageProps) {
  const [selected, setSelected] = useState<Article | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#63865A] font-semibold">
          Nhật ký dự án
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#244B35]">
          Tin tức & Hoạt động Lạng Xanh
        </h1>
        <p className="text-base text-[#4A5A4E] leading-relaxed">
          Cập nhật các hoạt động sáng tạo sản phẩm, sự kiện trưng bày và hành trình lan tỏa
          lối sống xanh của nhóm học sinh Trường THPT Dân tộc nội trú tỉnh Lạng Sơn.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#244B35]/10 p-12 text-center text-sm text-[#4A5A4E]">
          Hiện chưa có bài viết nào được đăng tải.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {articles.map((art) => (
            <article
              key={art.id}
              className="bg-white rounded-2xl border border-[#244B35]/10 overflow-hidden flex flex-col shadow-xs"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#E9DFC9]/30">
                <SafeImage
                  src={art.cover_image}
                  alt={art.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-1 space-y-3">
                <div className="inline-flex items-center gap-1.5 text-xs text-[#63865A] tabular-nums">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{art.published_at}</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-[#1E2E23] leading-snug">
                  {art.title}
                </h2>
                <p className="text-sm text-[#4A5A4E] line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>
                <div className="pt-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => setSelected(art)}
                    className="text-sm font-semibold text-[#244B35] hover:text-[#63865A] cursor-pointer"
                  >
                    Đọc chi tiết →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Article Reader Modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#F7F4EA] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#244B35]/15">
            <div className="sticky top-0 bg-[#F7F4EA]/95 backdrop-blur-sm px-6 py-4 border-b border-[#244B35]/10 flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-[#63865A] tabular-nums">
                {selected.published_at}
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Đóng bài viết"
                className="p-1.5 rounded-lg hover:bg-[#E9DFC9] text-[#244B35]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#244B35] leading-tight">
                {selected.title}
              </h2>
              {selected.cover_image && (
                <div className="rounded-2xl overflow-hidden aspect-[16/9]">
                  <SafeImage
                    src={selected.cover_image}
                    alt={selected.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-base text-[#1E2E23] leading-relaxed whitespace-pre-line">
                {selected.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
