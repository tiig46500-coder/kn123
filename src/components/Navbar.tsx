import { useState } from 'react';
import { Menu, X, ExternalLink } from 'lucide-react';
import { OFFICIAL_FACEBOOK_URL } from '../utils/catalog';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  facebookUrl?: string;
}

const NAV_ITEMS = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Về Lạng Xanh', path: '/gioi-thieu' },
  { label: 'Sản phẩm', path: '/san-pham' },
  { label: 'Quy trình', path: '/quy-trinh' },
  { label: 'Trải nghiệm', path: '/tram-xanh' },
  { label: 'Thư viện', path: '/thu-vien' },
  { label: 'Liên hệ', path: '/lien-he' },
];

export function Navbar({
  currentPath,
  onNavigate,
  facebookUrl = OFFICIAL_FACEBOOK_URL,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    if (path === '/san-pham') {
      return (
        currentPath.startsWith('/san-pham') || currentPath.startsWith('/danh-muc')
      );
    }
    if (path === '/gioi-thieu') {
      return (
        currentPath.startsWith('/gioi-thieu') ||
        currentPath.startsWith('/cau-chuyen')
      );
    }
    return currentPath.startsWith(path);
  };

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setMobileOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F4EA]/95 backdrop-blur-md border-b border-[#244B35]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Brand Zone */}
        <a
          href="/"
          onClick={(e) => handleNav(e, '/')}
          className="flex items-center gap-2.5 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244B35] rounded-md py-1"
        >
          <img
            src="/images/branding/logo-lang-xanh.jpg"
            alt="Logo Lạng Xanh"
            className="w-9 h-9 rounded-full object-cover border border-[#244B35]/15"
            referrerPolicy="no-referrer"
          />
          <span className="font-display text-2xl font-bold tracking-tight text-[#244B35] whitespace-nowrap">
            Lạng Xanh
          </span>
        </a>

        {/* Navigation Links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium text-[#2C3E31]"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleNav(e, item.path)}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                  active
                    ? 'text-[#244B35] border-[#244B35] font-semibold'
                    : 'border-transparent hover:text-[#244B35] hover:border-[#63865A]/50'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <a
            href="/san-pham"
            onClick={(e) => handleNav(e, '/san-pham')}
            className="px-4 py-2 text-xs font-semibold tracking-wide bg-[#244B35] text-[#F7F4EA] rounded-lg hover:bg-[#1B3A29] transition-colors whitespace-nowrap shrink-0"
          >
            Khám phá sản phẩm
          </a>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Đặt mua qua Facebook Lạng Xanh"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#244B35] border border-[#244B35]/25 rounded-lg hover:bg-[#E9DFC9]/60 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Facebook</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          className="lg:hidden p-2 rounded-lg text-[#244B35] hover:bg-[#E9DFC9]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244B35]"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#244B35]/10 bg-[#F7F4EA] px-4 py-4 space-y-2 shadow-lg">
          <nav aria-label="Menu di động" className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNav(e, item.path)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#244B35] text-[#F7F4EA]'
                      : 'text-[#1E2E23] hover:bg-[#E9DFC9]/70'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href="/tin-tuc"
              onClick={(e) => handleNav(e, '/tin-tuc')}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#1E2E23] hover:bg-[#E9DFC9]/70"
            >
              Tin tức & Hoạt động
            </a>
          </nav>
          <div className="pt-3 border-t border-[#244B35]/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href="/san-pham"
              onClick={(e) => handleNav(e, '/san-pham')}
              className="w-full text-center px-4 py-2.5 text-sm font-semibold bg-[#244B35] text-[#F7F4EA] rounded-lg"
            >
              Khám phá sản phẩm
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold border border-[#244B35]/30 text-[#244B35] rounded-lg bg-white"
            >
              <span>Đặt mua Facebook</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
