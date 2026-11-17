import { ExternalLink, Shield } from 'lucide-react';
import type { Category, SiteSettings } from '../types/domain';
import { OFFICIAL_FACEBOOK_URL } from '../utils/catalog';

interface FooterProps {
  categories: Category[];
  settings: SiteSettings | null;
  onNavigate: (path: string) => void;
}

export function Footer({ categories, settings, onNavigate }: FooterProps) {
  const fbUrl = settings?.facebook_url || OFFICIAL_FACEBOOK_URL;

  const handleLink = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="bg-[#244B35] text-[#F7F4EA] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/15">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/branding/logo-lang-xanh.jpg"
                alt="Logo Lạng Xanh"
                className="w-11 h-11 rounded-full object-cover bg-[#F7F4EA]"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-display text-2xl font-bold tracking-tight text-white">
                  LẠNG XANH
                </p>
                <p className="text-xs text-[#E9DFC9]/85">
                  Khởi nguồn giá trị kinh tế xanh từ xơ mướp
                </p>
              </div>
            </div>
            <p className="text-sm text-[#E9DFC9]/90 leading-relaxed">
              {settings?.primary_tagline ||
                'Biến điều bình dị từ thiên nhiên thành những giá trị xanh cho cuộc sống.'}
            </p>
            <p className="text-xs text-[#E9DFC9]/75 italic">
              “{settings?.secondary_tagline || 'Sống xanh từ những điều gần gũi nhất.'}”
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-display text-lg font-semibold text-white mb-4">
              Khám phá dự án
            </h3>
            <ul className="space-y-2.5 text-sm text-[#E9DFC9]/90">
              <li>
                <a
                  href="/gioi-thieu"
                  onClick={(e) => handleLink(e, '/gioi-thieu')}
                  className="hover:text-white transition-colors"
                >
                  Giới thiệu & Câu chuyện
                </a>
              </li>
              <li>
                <a
                  href="/quy-trinh"
                  onClick={(e) => handleLink(e, '/quy-trinh')}
                  className="hover:text-white transition-colors"
                >
                  Quy trình chế tác
                </a>
              </li>
              <li>
                <a
                  href="/tram-xanh"
                  onClick={(e) => handleLink(e, '/tram-xanh')}
                  className="hover:text-white transition-colors"
                >
                  Trạm Xanh Xứ Lạng
                </a>
              </li>
              <li>
                <a
                  href="/thu-vien"
                  onClick={(e) => handleLink(e, '/thu-vien')}
                  className="hover:text-white transition-colors"
                >
                  Thư viện hình ảnh
                </a>
              </li>
              <li>
                <a
                  href="/tin-tuc"
                  onClick={(e) => handleLink(e, '/tin-tuc')}
                  className="hover:text-white transition-colors"
                >
                  Tin tức & Hoạt động
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-lg font-semibold text-white mb-4">
              Danh mục sản phẩm
            </h3>
            <ul className="space-y-2.5 text-sm text-[#E9DFC9]/90">
              <li>
                <a
                  href="/san-pham"
                  onClick={(e) => handleLink(e, '/san-pham')}
                  className="hover:text-white transition-colors"
                >
                  Tất cả sản phẩm
                </a>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/danh-muc/${cat.slug}`}
                    onClick={(e) => handleLink(e, `/danh-muc/${cat.slug}`)}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Channels & Unit */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-white">
              Kết nối chính thức
            </h3>
            <p className="text-sm text-[#E9DFC9]/90 leading-relaxed">
              Đơn vị thực hiện:{' '}
              <span className="text-white font-medium">
                {settings?.school_unit ||
                  'Nhóm học sinh Trường THPT Dân tộc nội trú tỉnh Lạng Sơn'}
              </span>
            </p>
            <div className="flex flex-col gap-2.5">
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#F7F4EA] text-[#244B35] text-sm font-semibold hover:bg-white transition-colors"
              >
                <span>Fanpage Facebook Lạng Xanh</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-xs text-[#E9DFC9]/80">
                TikTok: {settings?.tiktok_handle || '@langxanhkhoinghiep2026'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E9DFC9]/80">
          <p>
            © {new Date().getFullYear()} Dự án Lạng Xanh · Bản sắc Xứ Lạng · Thủ công & Bền vững
          </p>
          <a
            href="/admin"
            onClick={(e) => handleLink(e, '/admin')}
            className="inline-flex items-center gap-1.5 text-[#E9DFC9]/80 hover:text-white transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Quản trị nội dung</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
