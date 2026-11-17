import { ExternalLink, Sprout, Scissors, GraduationCap } from 'lucide-react';
import type { SiteSettings, WorkshopInfo } from '../types/domain';
import { OFFICIAL_FACEBOOK_URL } from '../utils/catalog';
import { SafeImage } from '../components/SafeImage';

interface WorkshopPageProps {
  workshop: WorkshopInfo | null;
  settings: SiteSettings | null;
}

export function WorkshopPage({ workshop, settings }: WorkshopPageProps) {
  const fbUrl = settings?.facebook_url || OFFICIAL_FACEBOOK_URL;
  const activities = workshop?.activities ?? [];
  const benefits = workshop?.educational_benefits ?? [];
  const galleryImages = workshop?.gallery_images ?? [];

  return (
    <div className="space-y-16 pb-10">
      {/* Large Hero Banner */}
      <section className="relative min-h-[55vh] flex items-end bg-[#1D3B2A] overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage
            src={workshop?.hero_image || '/images/projects/tram-xanh-workshop.jpg'}
            alt={workshop?.title || 'Trạm Xanh Xứ Lạng'}
            loading="eager"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#183324]/95 via-[#244B35]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full text-[#F7F4EA] space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#E9DFC9] font-semibold">
            Du lịch nông nghiệp & Workshop trải nghiệm
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-white max-w-3xl text-balance">
            {workshop?.title || 'Trạm Xanh Xứ Lạng'}
          </h1>
          <p className="text-base sm:text-lg text-[#E9DFC9] max-w-2xl leading-relaxed">
            {workshop?.subtitle ||
              'Tham quan không gian xanh & Workshop chế tác thủ công từ xơ mướp'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Intro */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#63865A]">
              <Sprout className="w-4 h-4" />
              <span>Không gian trải nghiệm xanh</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#244B35]">
              Tự tay sáng tạo quà lưu niệm từ thiên nhiên
            </h2>
            <p className="text-base text-[#36493B] leading-relaxed">
              {workshop?.intro}
            </p>
            <p className="text-sm text-[#4A5A4E] bg-white p-4 rounded-xl border border-[#244B35]/10">
              {workshop?.schedule_note}
            </p>
            <div className="pt-2">
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#244B35] text-[#F7F4EA] text-sm font-semibold hover:bg-[#1B3A29] transition-colors"
              >
                <span>Đăng ký trải nghiệm qua Facebook</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {(galleryImages.length > 0
              ? galleryImages
              : [
                  '/images/projects/tram-xanh-workshop.jpg',
                  '/images/projects/nhom-hoc-sinh-lang-xanh.jpg',
                  '/images/products/tranh-hoa-dao-lang-son.jpg',
                  '/images/products/den-chop-chuon-chuon.jpg',
                ]
            )
              .slice(0, 4)
              .map((img, i) => (
                <div
                  key={`${img}-${i}`}
                  className="rounded-2xl overflow-hidden aspect-[4/3] border border-[#244B35]/10 bg-white shadow-xs"
                >
                  <SafeImage
                    src={img}
                    alt={`Hoạt động workshop Lạng Xanh ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
          </div>
        </section>

        {/* Activities & Educational Benefits */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-[#244B35]/10 space-y-5">
            <div className="inline-flex items-center gap-2 text-[#244B35]">
              <Scissors className="w-5 h-5 text-[#63865A]" />
              <h2 className="font-display text-2xl font-bold">
                Hoạt động trải nghiệm chính
              </h2>
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-[#36493B]">
              {activities.map((act) => (
                <li key={act} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#63865A] shrink-0" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#244B35]/10 space-y-5">
            <div className="inline-flex items-center gap-2 text-[#244B35]">
              <GraduationCap className="w-5 h-5 text-[#63865A]" />
              <h2 className="font-display text-2xl font-bold">
                Giá trị giáo dục & môi trường
              </h2>
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-[#36493B]">
              {benefits.map((ben) => (
                <li key={ben} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#8A684B] shrink-0" />
                  <span>{ben}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
