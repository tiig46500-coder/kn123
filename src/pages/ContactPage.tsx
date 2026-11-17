import { useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle, School } from 'lucide-react';
import type { SiteSettings } from '../types/domain';
import { OFFICIAL_FACEBOOK_URL } from '../utils/catalog';
import { SafeImage } from '../components/SafeImage';

interface ContactPageProps {
  settings: SiteSettings | null;
}

export function ContactPage({ settings }: ContactPageProps) {
  const fbUrl = settings?.facebook_url || OFFICIAL_FACEBOOK_URL;
  const [topic, setTopic] = useState('Đặt mua sản phẩm');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  const composed = `Xin chào Lạng Xanh, tôi muốn liên hệ về: ${topic}${note.trim() ? ` — ${note.trim()}` : ''}.`;

  const handleCopyAndOpen = async () => {
    try {
      await navigator.clipboard.writeText(composed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#63865A] font-semibold">
          Liên hệ chính thức
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#244B35]">
          Kết nối với Lạng Xanh
        </h1>
        <p className="text-base text-[#4A5A4E] leading-relaxed">
          Mọi yêu cầu đặt mua sản phẩm, tư vấn quà tặng đặt riêng cho homestay/quán cà phê
          hoặc đăng ký tham gia workshop Trạm Xanh Xứ Lạng được tiếp nhận trực tiếp qua
          Fanpage Facebook chính thức của dự án.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Official Facebook & School Unit */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-[#244B35]/10 space-y-5 shadow-xs">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#63865A]">
              <MessageCircle className="w-4 h-4" />
              <span>Kênh đặt hàng & tư vấn duy nhất</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-[#244B35]">
              Fanpage Facebook Lạng Xanh
            </h2>
            <p className="text-sm sm:text-base text-[#4A5A4E] leading-relaxed">
              Nhấn nút bên dưới để mở trang Facebook chính thức của Lạng Xanh trong tab
              mới và nhắn tin trực tiếp cho nhóm dự án.
            </p>

            {/* Helpful message composer */}
            <div className="p-4 rounded-2xl bg-[#F7F4EA] border border-[#244B35]/10 space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-topic"
                  className="block text-xs font-semibold text-[#244B35]"
                >
                  Chủ đề cần tư vấn
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 bg-white text-sm text-[#1E2E23]"
                >
                  <option value="Đặt mua sản phẩm">Đặt mua sản phẩm</option>
                  <option value="Đặt quà tặng cho cơ sở lưu trú / quán cà phê">
                    Đặt quà tặng cho cơ sở lưu trú / quán cà phê
                  </option>
                  <option value="Đăng ký workshop Trạm Xanh Xứ Lạng">
                    Đăng ký workshop Trạm Xanh Xứ Lạng
                  </option>
                  <option value="Hợp tác truyền thông & dự án">
                    Hợp tác truyền thông & dự án
                  </option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-note"
                  className="block text-xs font-semibold text-[#244B35]"
                >
                  Nội dung ghi chú (không bắt buộc)
                </label>
                <input
                  id="contact-note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Tên sản phẩm, số lượng hoặc thời gian dự kiến..."
                  className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 bg-white text-sm text-[#1E2E23]"
                />
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-xs text-[#4A5A4E] italic line-clamp-2">
                  “{composed}”
                </p>
                <button
                  type="button"
                  onClick={handleCopyAndOpen}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#244B35] shrink-0 hover:underline cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép mẫu</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#244B35] text-[#F7F4EA] text-sm font-semibold hover:bg-[#1B3A29] transition-colors w-full sm:w-auto"
            >
              <span>Mở Facebook Lạng Xanh ngay</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#244B35]/10 flex items-start gap-4">
            <School className="w-6 h-6 text-[#63865A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-[#244B35]">
                Đơn vị thực hiện dự án
              </h3>
              <p className="text-sm text-[#36493B]">
                {settings?.school_unit ||
                  'Nhóm học sinh Trường THPT Dân tộc nội trú tỉnh Lạng Sơn'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: TikTok QR & Team Showcase */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#244B35]/10 text-center space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#244B35]">
              Kênh TikTok chính thức
            </h2>
            <div className="max-w-[240px] mx-auto rounded-2xl overflow-hidden border border-[#244B35]/10">
              <SafeImage
                src="/images/branding/tiktok-qr-lang-xanh.jpg"
                alt="Mã QR TikTok @langxanhkhoinghiep2026"
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="text-xs text-[#4A5A4E]">
              Quét mã QR để theo dõi video chế tác và hoạt động của Lạng Xanh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
