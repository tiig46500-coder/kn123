import { ArrowRight, ExternalLink, Leaf, Compass, HeartHandshake, Palette } from 'lucide-react';
import type { SiteSettings } from '../types/domain';
import { OFFICIAL_FACEBOOK_URL } from '../utils/catalog';
import { SafeImage } from '../components/SafeImage';

interface AboutStoryPageProps {
  settings: SiteSettings | null;
  onNavigate: (path: string) => void;
}

export function AboutStoryPage({ settings, onNavigate }: AboutStoryPageProps) {
  const fbUrl = settings?.facebook_url || OFFICIAL_FACEBOOK_URL;

  const pillars = [
    { label: 'Thiên nhiên', icon: Leaf, desc: 'Tận dụng xơ mướp tự nhiên gần gũi và phân hủy sinh học.' },
    { label: 'Thủ công & Sáng tạo', icon: Palette, desc: 'Thiết kế đa dạng sản phẩm gia dụng, thời trang và trang trí.' },
    { label: 'Bản sắc Xứ Lạng', icon: Compass, desc: 'Lồng ghép hình ảnh hoa đào, hoa hồi và núi rừng quê hương.' },
    { label: 'Trách nhiệm cộng đồng', icon: HeartHandshake, desc: 'Lan tỏa thói quen tiêu dùng bền vững và giảm rác thải nhựa.' },
  ];

  const audiences = [
    'Người yêu thích sản phẩm thân thiện với môi trường.',
    'Người tiêu dùng quan tâm đến sản phẩm thủ công.',
    'Khách du lịch tìm kiếm quà lưu niệm bản sắc Xứ Lạng.',
    'Gia đình và học sinh tham gia trải nghiệm workshop xanh.',
    'Homestay, resort, quán cà phê hướng tới mô hình lưu trú bền vững.',
    'Các đơn vị, trường học và doanh nghiệp có nhu cầu đặt quà tặng.',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#63865A] font-semibold">
            Câu chuyện Lạng Xanh
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#244B35] leading-tight text-balance">
            {settings?.story_headline || 'HÀNH TRÌNH KHỞI NGUỒN TỪ XƠ MƯỚP'}
          </h1>
          <div className="space-y-4 text-base text-[#36493B] leading-relaxed whitespace-pre-line">
            {settings?.story_body ||
              'Lạng Xanh hướng tới xây dựng chuỗi giá trị từ vùng trồng mướp sinh thái, hợp tác với người dân địa phương và ứng dụng công nghệ chế tác để phát triển những sản phẩm gia dụng, thời trang và trang trí từ xơ mướp.\n\nTừ một nguyên liệu quen thuộc, dự án mong muốn mở ra những cách sử dụng mới, tạo thêm giá trị cho tài nguyên bản địa và lan tỏa lối sống thân thiện với môi trường.'}
          </div>
          <p className="text-sm font-semibold text-[#8A684B]">
            Đơn vị thực hiện:{' '}
            {settings?.school_unit ||
              'Nhóm học sinh Trường THPT Dân tộc nội trú tỉnh Lạng Sơn'}
          </p>
        </div>

        <div className="lg:col-span-5 rounded-2xl overflow-hidden shadow-md bg-white border border-[#244B35]/10">
          <SafeImage
            src="/images/projects/nhom-hoc-sinh-lang-xanh.jpg"
            alt="Nhóm học sinh thực hiện dự án Lạng Xanh"
            loading="eager"
            className="w-full h-full object-cover aspect-[4/3]"
          />
        </div>
      </section>

      {/* Alternating editorial blocks */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white rounded-3xl p-6 sm:p-10 border border-[#244B35]/10">
        <div className="lg:col-span-6 rounded-2xl overflow-hidden aspect-[4/3]">
          <SafeImage
            src="/images/projects/gian-hang-lang-xanh.jpg"
            alt="Không gian trưng bày sản phẩm Lạng Xanh"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="lg:col-span-6 space-y-4">
          <h2 className="font-display text-3xl font-bold text-[#244B35]">
            “Biến điều bình dị từ thiên nhiên thành những giá trị xanh cho cuộc sống.”
          </h2>
          <p className="text-base text-[#4A5A4E] leading-relaxed">
            Không dừng lại ở những miếng rửa chén hay bông tắm quen thuộc, đội ngũ Lạng Xanh
            không ngừng thử nghiệm để nâng tầm sợi xơ mướp thành túi xách thời trang thêu tay,
            đèn ngủ tỏa sáng ấm áp hay tranh nghệ thuật khắc họa nét đẹp Lạng Sơn.
          </p>
          <p className="text-sm italic text-[#63865A]">
            “Sống xanh từ những điều gần gũi nhất.”
          </p>
        </div>
      </section>

      {/* Brand Pillars */}
      <section className="space-y-8">
        <h2 className="font-display text-3xl font-bold text-[#244B35]">
          Định hướng thương hiệu Lạng Xanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="bg-white p-6 rounded-2xl border border-[#244B35]/10 space-y-3"
              >
                <Icon className="w-6 h-6 text-[#63865A]" />
                <h3 className="font-display text-xl font-bold text-[#244B35]">
                  {item.label}
                </h3>
                <p className="text-sm text-[#4A5A4E] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Target Audiences */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-5">
          <h2 className="font-display text-3xl font-bold text-[#244B35]">
            Sản phẩm & Trải nghiệm dành cho ai?
          </h2>
          <ul className="space-y-3 text-base text-[#36493B]">
            {audiences.map((aud) => (
              <li key={aud} className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#63865A] shrink-0" />
                <span>{aud}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/san-pham')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#244B35] text-[#F7F4EA] text-sm font-semibold hover:bg-[#1B3A29] transition-colors cursor-pointer"
            >
              <span>Khám phá sản phẩm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-[#244B35]/30 text-[#244B35] text-sm font-semibold hover:bg-white transition-colors"
            >
              <span>Liên hệ hợp tác qua Facebook</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-md aspect-[4/3]">
          <SafeImage
            src="/images/products/tranh-hoa-dao-lang-son.jpg"
            alt="Tranh hoa đào Lạng Sơn bằng xơ mướp"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </div>
  );
}
