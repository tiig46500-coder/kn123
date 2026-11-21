import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ExternalLink, HandHeart, Leaf, Sparkles, Users } from 'lucide-react';
import type {
  Banner,
  GalleryItem,
  ProcessStep,
  Product,
  SiteSettings,
  WorkshopInfo,
} from '../types/domain';
import { OFFICIAL_FACEBOOK_URL, isProductPubliclyVisible } from '../utils/catalog';
import { PhotoLightbox } from '../components/PhotoLightbox';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

interface HomePageProps {
  products: Product[];
  gallery: GalleryItem[];
  processSteps: ProcessStep[];
  banners: Banner[];
  settings: SiteSettings | null;
  workshop: WorkshopInfo | null;
  onNavigate: (path: string) => void;
}

const CORE_VALUES = [
  {
    title: 'Nguyên liệu tự nhiên',
    description:
      'Nguồn xơ mướp già chọn lọc từ định hướng vùng trồng sinh thái, an toàn và có khả năng phân hủy sinh học.',
    image: '/images/projects/xo-muop-nguyen-trai.jpg',
    icon: Leaf,
  },
  {
    title: 'Sáng tạo thủ công',
    description:
      'Mỗi sản phẩm được cắt rập, ép nhiệt, may viền và thêu đắp tỉ mỉ bởi bàn tay khéo léo của đội ngũ Lạng Xanh.',
    image: '/images/products/tui-theu-la-dao.jpg',
    icon: Sparkles,
  },
  {
    title: 'Tinh thần sống xanh',
    description:
      'Gợi mở lựa chọn thay thế vật dụng nhựa dùng một lần trong bếp, phòng tắm, quà tặng và du lịch lưu trú.',
    image: '/images/products/bo-san-pham-gia-dung.jpg',
    icon: HandHeart,
  },
  {
    title: 'Kết nối cộng đồng',
    description:
      'Lan tỏa bản sắc Xứ Lạng qua hoa hồi, hoa đào và hoạt động trải nghiệm workshop cùng học sinh, gia đình.',
    image: '/assets/aistudio/image_df5e262a.png',
    icon: Users,
  },
];

const HOME_TIMELINE_LABELS = [
  'Nguyên liệu',
  'Thu hoạch',
  'Sơ chế',
  'Chế tác',
  'Hoàn thiện',
  'Trưng bày sản phẩm',
];

export function HomePage({
  products,
  gallery,
  processSteps,
  banners,
  settings,
  workshop,
  onNavigate,
}: HomePageProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const heroBanner = banners.find((b) => b.key === 'hero_main');
  const fbUrl = settings?.facebook_url || OFFICIAL_FACEBOOK_URL;

  const visibleProducts = products.filter(isProductPubliclyVisible);
  const featuredProducts = visibleProducts
    .filter((p) => p.featured === 1)
    .slice(0, 8);
  const displayProducts =
    featuredProducts.length >= 6
      ? featuredProducts
      : visibleProducts.slice(0, 8);

  const timelineSteps = HOME_TIMELINE_LABELS.map((label, idx) => {
    const step = processSteps[idx] ?? processSteps[processSteps.length - 1];
    return {
      label,
      description: step?.description || '',
      image_url:
        step?.image_url ||
        (idx === 5
          ? '/images/projects/gian-hang-lang-xanh.jpg'
          : '/images/projects/xo-muop-nguyen-trai.jpg'),
    };
  });

  const masonryItems = gallery.slice(0, 6);

  return (
    <div>
      {/* 4.1 Banner Hero */}
      <section
        ref={heroRef}
        className="relative min-h-[78vh] lg:min-h-[84vh] flex items-center overflow-hidden bg-[#1D3B2A]"
      >
        <motion.div style={{ y: bgY }} className="absolute inset-0">
          <SafeImage
            src={heroBanner?.image_url || '/images/projects/gian-hang-lang-xanh.jpg'}
            alt="Gian hàng trưng bày sản phẩm xơ mướp Lạng Xanh"
            loading="eager"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#183324]/92 via-[#244B35]/78 to-[#244B35]/40" />
        </motion.div>

        {/* Subtle drifting botanical leaves */}
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 120 120"
          className="hidden md:block absolute top-14 right-16 w-20 h-20 text-[#E9DFC9]/20 pointer-events-none"
          animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            fill="currentColor"
            d="M95 20C55 22 25 52 22 95c43-3 73-33 73-75zM36 82c12-18 28-34 46-46-12 18-28 34-46 46z"
          />
        </motion.svg>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl space-y-6 text-[#F7F4EA]">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#E9DFC9] font-medium">
              Dự án khởi nghiệp xanh · Xứ Lạng
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] text-balance">
              {heroBanner?.title || 'LẠNG XANH'}
            </h1>
            <p className="font-display text-2xl sm:text-3xl text-[#E9DFC9] italic font-medium leading-snug">
              “{heroBanner?.subtitle || 'Khởi nguồn giá trị kinh tế xanh từ xơ mướp.'}”
            </p>
            <p className="text-base sm:text-lg text-[#F7F4EA]/90 leading-relaxed max-w-xl">
              Từ nguồn nguyên liệu tự nhiên gần gũi với đời sống, Lạng Xanh sáng tạo nên những
              sản phẩm gia dụng, thời trang và trang trí mang tinh thần sống xanh. Mỗi sản
              phẩm là một hành trình kết nối thiên nhiên, sự khéo léo và khát vọng phát triển
              quê hương Xứ Lạng.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/san-pham')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#F7F4EA] text-[#244B35] text-sm font-semibold hover:bg-white transition-colors shadow-lg cursor-pointer"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/cau-chuyen')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-[#F7F4EA]/50 text-[#F7F4EA] text-sm font-semibold hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span>Tìm hiểu hành trình</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4.2 Giới thiệu nhanh về dự án */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-md bg-[#E9DFC9]/40 min-h-[320px]">
            <SafeImage
              src="/images/projects/nhom-hoc-sinh-lang-xanh.jpg"
              alt="Nhóm học sinh Trường THPT Dân tộc nội trú tỉnh Lạng Sơn thực hiện dự án Lạng Xanh"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#63865A] font-semibold">
              Về dự án Lạng Xanh
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#244B35] leading-tight text-balance">
              {settings?.intro_headline ||
                'TỪ XƠ MƯỚP TỰ NHIÊN ĐẾN NHỮNG GIÁ TRỊ SÁNG TẠO'}
            </h2>
            <p className="text-base text-[#36493B] leading-relaxed">
              {settings?.intro_body ||
                'Lạng Xanh phát triển chuỗi giá trị từ vùng trồng mướp sinh thái, kết hợp chế tác xơ mướp thành các sản phẩm gia dụng, thời trang và trang trí. Dự án đồng thời hướng tới xây dựng không gian du lịch nông nghiệp và workshop để khách hàng được tự tay trải nghiệm quá trình sáng tạo sản phẩm từ thiên nhiên.'}
            </p>
            <p className="text-sm text-[#8A684B] font-medium">
              Đơn vị thực hiện:{' '}
              {settings?.school_unit ||
                'Nhóm học sinh Trường THPT Dân tộc nội trú tỉnh Lạng Sơn'}
            </p>
            <div>
              <button
                type="button"
                onClick={() => onNavigate('/cau-chuyen')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#244B35] text-[#F7F4EA] text-sm font-semibold hover:bg-[#1B3A29] transition-colors cursor-pointer"
              >
                <span>Đọc câu chuyện dự án</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4.3 Khu vực sản phẩm nổi bật */}
      <section className="bg-white/75 border-y border-[#244B35]/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#63865A] font-semibold mb-2">
                Bộ sưu tập tuyển chọn
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#244B35]">
                Sản phẩm nổi bật từ xơ mướp
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/san-pham')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#244B35] hover:text-[#63865A] transition-colors shrink-0 cursor-pointer"
            >
              <span>Xem tất cả sản phẩm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
                facebookUrl={fbUrl}
              />
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => onNavigate('/san-pham')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#244B35] text-[#244B35] text-sm font-semibold hover:bg-[#244B35] hover:text-[#F7F4EA] transition-colors cursor-pointer"
            >
              <span>Xem tất cả sản phẩm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4.4 Giá trị khác biệt */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-[0.18em] text-[#63865A] font-semibold mb-2">
            Định hướng cốt lõi
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#244B35] text-balance">
            Bốn giá trị tạo nên bản sắc Lạng Xanh
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_VALUES.map((val) => {
            const Icon = val.icon;
            return (
              <div
                key={val.title}
                className="bg-white rounded-2xl border border-[#244B35]/10 overflow-hidden flex flex-col shadow-xs"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#E9DFC9]/30">
                  <SafeImage
                    src={val.image}
                    alt={val.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="inline-flex items-center gap-2 text-[#244B35] mb-2">
                    <Icon className="w-4 h-4 text-[#63865A] shrink-0" />
                    <h3 className="font-display text-xl font-bold">{val.title}</h3>
                  </div>
                  <p className="text-sm text-[#4A5A4E] leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4.5 Quy trình tạo nên sản phẩm */}
      <section className="bg-[#E9DFC9]/45 border-y border-[#244B35]/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#63865A] font-semibold mb-2">
                Từ giàn mướp đến thành phẩm
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#244B35]">
                Quy trình tạo nên sản phẩm
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/quy-trinh')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#244B35] hover:text-[#63865A] cursor-pointer"
            >
              <span>Xem quy trình chi tiết</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {timelineSteps.map((step, idx) => (
              <div
                key={step.label}
                className="bg-white rounded-xl border border-[#244B35]/10 overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#F7F4EA]">
                  <SafeImage
                    src={step.image_url}
                    alt={step.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1">
                  <p className="text-xs font-semibold text-[#8A684B] tabular-nums mb-1">
                    Bước 0{idx + 1}
                  </p>
                  <h3 className="font-display text-lg font-bold text-[#244B35] mb-1.5">
                    {step.label}
                  </h3>
                  <p className="text-xs text-[#4A5A4E] line-clamp-3 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4.6 Trải nghiệm Trạm Xanh Xứ Lạng */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-[#244B35] text-[#F7F4EA] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-lg">
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#E9DFC9] font-semibold">
              Du lịch nông nghiệp & Thủ công
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight text-balance">
              {workshop?.title || 'Trạm Xanh Xứ Lạng'}
            </h2>
            <p className="text-base text-[#E9DFC9]/95 leading-relaxed">
              {workshop?.intro ||
                'Không gian trải nghiệm thực tế nơi học sinh, gia đình và du khách được trực tiếp tìm hiểu quy trình xử lý xơ mướp và tự tay sáng tạo món quà lưu niệm từ thiên nhiên.'}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/tram-xanh')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F7F4EA] text-[#244B35] text-sm font-semibold hover:bg-white transition-colors cursor-pointer"
              >
                <span>Tìm hiểu chương trình</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                <span>Đăng ký trải nghiệm</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 min-h-[300px]">
            <SafeImage
              src={workshop?.hero_image || '/images/projects/tram-xanh-workshop.jpg'}
              alt="Hoạt động workshop và trưng bày Trạm Xanh Xứ Lạng"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4.7 Thư viện hình ảnh Masonry */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#63865A] font-semibold mb-2">
              Khoảnh khắc thực tế
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#244B35]">
              Thư viện hình ảnh dự án
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/thu-vien')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#244B35] hover:text-[#63865A] cursor-pointer"
          >
            <span>Xem toàn bộ thư viện</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {masonryItems.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }}
              aria-label={`Phóng to ảnh ${item.title}`}
              className="block w-full break-inside-avoid rounded-xl overflow-hidden border border-[#244B35]/10 bg-white shadow-xs hover:shadow-md transition-shadow group cursor-zoom-in text-left"
            >
              <SafeImage
                src={item.image_url}
                alt={item.title}
                className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            </button>
          ))}
        </div>

        <PhotoLightbox
          images={masonryItems.map((m) => ({
            image_url: m.image_url,
            alt_text: m.title,
            caption: `${m.album} — ${m.caption || m.title}`,
          }))}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </section>
    </div>
  );
}
