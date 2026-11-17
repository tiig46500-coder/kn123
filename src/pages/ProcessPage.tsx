import { ArrowRight } from 'lucide-react';
import type { ProcessStep } from '../types/domain';
import { SafeImage } from '../components/SafeImage';

interface ProcessPageProps {
  steps: ProcessStep[];
  onNavigate: (path: string) => void;
}

export function ProcessPage({ steps, onNavigate }: ProcessPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#63865A] font-semibold">
          Quy trình chế tác thủ công
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#244B35]">
          Từ quả mướp tự nhiên đến sản phẩm xanh hoàn thiện
        </h1>
        <p className="text-base text-[#4A5A4E] leading-relaxed">
          Mỗi sản phẩm của Lạng Xanh đều trải qua các công đoạn chọn lọc, sơ chế và tạo
          hình tỉ mỉ nhằm giữ nguyên cấu trúc sợi xơ bền chắc và nét mộc mạc từ thiên nhiên.
        </p>
      </div>

      <div className="space-y-10">
        {steps.map((step, index) => {
          const reversed = index % 2 === 1;
          return (
            <div
              key={step.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-8 border border-[#244B35]/10 shadow-xs"
            >
              <div
                className={`lg:col-span-6 rounded-2xl overflow-hidden aspect-[4/3] bg-[#F7F4EA] ${
                  reversed ? 'lg:order-2' : ''
                }`}
              >
                <SafeImage
                  src={step.image_url}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div
                className={`lg:col-span-6 space-y-4 ${reversed ? 'lg:order-1' : ''}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A684B] tabular-nums">
                  Công đoạn 0{step.step_number}
                </p>
                <h2 className="font-display text-3xl font-bold text-[#244B35]">
                  {step.title}
                </h2>
                <p className="text-base text-[#36493B] leading-relaxed">
                  {step.description}
                </p>
                {step.caption && (
                  <p className="text-xs italic text-[#63865A]">{step.caption}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#244B35] text-[#F7F4EA] rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h2 className="font-display text-3xl font-bold text-white">
            Trải nghiệm trực tiếp quy trình tại Trạm Xanh Xứ Lạng
          </h2>
          <p className="text-sm text-[#E9DFC9]/90 leading-relaxed">
            Tìm hiểu cận cảnh công đoạn sơ chế và tự tay hoàn thiện một sản phẩm từ xơ mướp
            cùng nhóm học sinh Lạng Xanh.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('/tram-xanh')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F7F4EA] text-[#244B35] text-sm font-semibold hover:bg-white cursor-pointer"
          >
            <span>Khám phá Trạm Xanh</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/san-pham')}
            className="px-5 py-3 rounded-lg border border-white/30 text-white text-sm font-semibold hover:bg-white/10 cursor-pointer"
          >
            Xem sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}
