import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import type { Category, Product } from '../types/domain';
import { reorderArray } from '../utils/catalog';
import { filesToPersistedDataUrls, localWebStore } from '../utils/localWebStore';
import { SafeImage } from './SafeImage';

export interface EditableImage {
  id?: number;
  image_url: string;
  alt_text: string;
  caption: string;
  is_cover: number;
}

interface AdminProductModalProps {
  product: Product | null; // null = create new
  categories: Category[];
  browserOnlyMode?: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export function AdminProductModal({
  product,
  categories,
  browserOnlyMode = false,
  onClose,
  onSaved,
}: AdminProductModalProps) {
  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [categoryId, setCategoryId] = useState<number>(
    product?.category_id ?? categories[0]?.id ?? 1,
  );
  const [shortDesc, setShortDesc] = useState(product?.short_description ?? '');
  const [fullDesc, setFullDesc] = useState(product?.full_description ?? '');
  const [highlights, setHighlights] = useState(product?.highlights ?? '');
  const [priceStr, setPriceStr] = useState(
    product?.price && product.price > 0 ? String(product.price) : '',
  );
  const [specs, setSpecs] = useState(product?.specifications ?? '');
  const [material, setMaterial] = useState(product?.material ?? '');
  const [availability, setAvailability] = useState<Product['availability']>(
    product?.availability ?? 'in_stock',
  );
  const [featured, setFeatured] = useState(Boolean(product?.featured));
  const [isActive, setIsActive] = useState(
    product ? Boolean(product.is_active) : true,
  );
  const [displayOrder, setDisplayOrder] = useState(
    String(product?.display_order ?? 0),
  );

  const [images, setImages] = useState<EditableImage[]>(() => {
    if (product?.images && product.images.length > 0) {
      return product.images.map((i) => ({
        id: i.id,
        image_url: i.image_url,
        alt_text: i.alt_text,
        caption: i.caption,
        is_cover: i.is_cover,
      }));
    }
    if (product?.cover_image) {
      return [
        {
          image_url: product.cover_image,
          alt_text: product.name,
          caption: '',
          is_cover: 1,
        },
      ];
    }
    return [];
  });

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const parseJsonSafe = async <T,>(res: Response): Promise<T | null> => {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    try {
      return (await res.json()) as T;
    } catch {
      return null;
    }
  };

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');
    setUploading(true);
    try {
      if (browserOnlyMode) {
        const urls = await filesToPersistedDataUrls(files);
        setImages((prev) => {
          const hasCover = prev.some((i) => i.is_cover === 1);
          const added: EditableImage[] = urls.map((url, idx) => ({
            image_url: url,
            alt_text: name.trim() || 'Sản phẩm Lạng Xanh',
            caption: '',
            is_cover: !hasCover && idx === 0 ? 1 : 0,
          }));
          return [...prev, ...added];
        });
        return;
      }

      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await parseJsonSafe<{ urls?: string[]; error?: string }>(res);
      if (!res.ok) {
        setError(
          data?.error ||
            (res.status === 413
              ? 'Dung lượng ảnh vượt quá giới hạn 4MB của máy chủ.'
              : 'Tải ảnh lên thất bại.'),
        );
        return;
      }
      const urls = data?.urls ?? [];
      setImages((prev) => {
        const hasCover = prev.some((i) => i.is_cover === 1);
        const added: EditableImage[] = urls.map((url, idx) => ({
          image_url: url,
          alt_text: name.trim() || 'Sản phẩm Lạng Xanh',
          caption: '',
          is_cover: !hasCover && idx === 0 ? 1 : 0,
        }));
        return [...prev, ...added];
      });
    } catch {
      setError('Không thể xử lý tệp ảnh đã chọn.');
    } finally {
      setUploading(false);
    }
  };

  const handleSetCover = (idx: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_cover: i === idx ? 1 : 0,
      })),
    );
  };

  const handleMove = (from: number, to: number) => {
    setImages((prev) => reorderArray(prev, from, to));
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0 && !next.some((i) => i.is_cover === 1)) {
        next[0] = { ...next[0], is_cover: 1 };
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Vui lòng nhập tên sản phẩm.');
      return;
    }

    setSaving(true);
    try {
      const parsedPrice =
        priceStr.trim() && Number(priceStr) > 0 ? Number(priceStr) : null;
      const payload = {
        name: name.trim(),
        sku: sku.trim(),
        category_id: categoryId,
        short_description: shortDesc.trim(),
        full_description: fullDesc.trim(),
        highlights: highlights.trim(),
        price: parsedPrice,
        specifications: specs.trim(),
        material: material.trim(),
        availability,
        featured: featured ? 1 : 0,
        is_active: saveAsDraft ? 0 : isActive ? 1 : 0,
        display_order: Number(displayOrder) || 0,
        images: images.map((img, idx) => ({
          image_url: img.image_url,
          alt_text: img.alt_text || name.trim(),
          caption: img.caption,
          display_order: idx + 1,
          is_cover: img.is_cover,
        })),
      };

      if (browserOnlyMode) {
        if (product) {
          localWebStore.updateProduct(product.id, payload);
          localWebStore.replaceProductImages(product.id, payload.images);
        } else {
          localWebStore.createProduct(payload);
        }
        await onSaved();
        onClose();
        return;
      }

      if (product) {
        const res = await fetch(`/api/admin/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const d = await parseJsonSafe<{ error?: string }>(res);
          throw new Error(d?.error || 'Cập nhật sản phẩm thất bại.');
        }

        const imgRes = await fetch(`/api/admin/products/${product.id}/images`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: payload.images }),
        });
        if (!imgRes.ok) {
          const d = await parseJsonSafe<{ error?: string }>(imgRes);
          throw new Error(d?.error || 'Lưu bộ ảnh sản phẩm thất bại.');
        }
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const d = await parseJsonSafe<{ error?: string }>(res);
          throw new Error(d?.error || 'Thêm sản phẩm thất bại.');
        }
      }

      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product ? `Chỉnh sửa ${product.name}` : 'Thêm sản phẩm mới'}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-[#F7F4EA] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#244B35]/15">
        <div className="sticky top-0 z-10 bg-[#F7F4EA]/95 backdrop-blur-sm px-6 py-4 border-b border-[#244B35]/10 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-[#244B35]">
            {product ? `Chỉnh sửa: ${product.name}` : 'Thêm sản phẩm mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng biểu mẫu sản phẩm"
            className="p-2 rounded-lg hover:bg-[#E9DFC9] text-[#244B35]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-6">
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
            >
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="prod-name" className="block text-xs font-semibold text-[#244B35]">
                Tên sản phẩm *
              </label>
              <input
                id="prod-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 bg-white text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prod-cat" className="block text-xs font-semibold text-[#244B35]">
                Danh mục *
              </label>
              <select
                id="prod-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 bg-white text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.group_code ? `${c.group_code} – ` : ''}
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prod-sku" className="block text-xs font-semibold text-[#244B35]">
                Mã sản phẩm
              </label>
              <input
                id="prod-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ví dụ: LX-TT-01"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 bg-white text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prod-price" className="block text-xs font-semibold text-[#244B35]">
                Giá bán (VNĐ, bỏ trống nếu liên hệ)
              </label>
              <input
                id="prod-price"
                type="number"
                min="0"
                step="1000"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                placeholder="Ví dụ: 150000"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 bg-white text-sm tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prod-avail" className="block text-xs font-semibold text-[#244B35]">
                Trạng thái hàng
              </label>
              <select
                id="prod-avail"
                value={availability}
                onChange={(e) =>
                  setAvailability(e.target.value as Product['availability'])
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 bg-white text-sm"
              >
                <option value="in_stock">Còn hàng</option>
                <option value="contact">Liên hệ đặt hàng</option>
                <option value="out_of_stock">Tạm hết hàng</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prod-order" className="block text-xs font-semibold text-[#244B35]">
                Thứ tự hiển thị
              </label>
              <input
                id="prod-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 bg-white text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prod-short" className="block text-xs font-semibold text-[#244B35]">
              Mô tả ngắn *
            </label>
            <textarea
              id="prod-short"
              rows={2}
              required
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 bg-white text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prod-full" className="block text-xs font-semibold text-[#244B35]">
              Mô tả chi tiết
            </label>
            <textarea
              id="prod-full"
              rows={4}
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 bg-white text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="prod-mat" className="block text-xs font-semibold text-[#244B35]">
                Chất liệu
              </label>
              <input
                id="prod-mat"
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 bg-white text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="prod-spec" className="block text-xs font-semibold text-[#244B35]">
                Quy cách
              </label>
              <input
                id="prod-spec"
                type="text"
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 bg-white text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prod-hl" className="block text-xs font-semibold text-[#244B35]">
              Đặc điểm nổi bật (ngăn cách bởi dấu · hoặc xuống dòng)
            </label>
            <input
              id="prod-hl"
              type="text"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 bg-white text-sm"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-[#1E2E23] cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#244B35]"
              />
              <span>Sản phẩm nổi bật trên trang chủ</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-[#1E2E23] cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#244B35]"
              />
              <span>Hiển thị công khai trên website</span>
            </label>
          </div>

          {/* Multi-Image Manager */}
          <div className="bg-white rounded-2xl border border-[#244B35]/15 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold text-[#244B35]">
                  Bộ ảnh sản phẩm ({images.length} ảnh)
                </h3>
                <p className="text-xs text-[#4A5A4E]">
                  Tải nhiều ảnh cùng lúc, kéo thả hoặc dùng nút mũi tên để sắp xếp thứ tự
                  và chọn ảnh đại diện.
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#244B35] text-[#F7F4EA] text-xs font-semibold hover:bg-[#1B3A29] transition-colors cursor-pointer shrink-0">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImagePlus className="w-4 h-4" />
                )}
                <span>{uploading ? 'Đang tải ảnh...' : 'Tải nhiều ảnh lên'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => handleUploadFiles(e.target.files)}
                  className="sr-only"
                />
              </label>
            </div>

            {images.length === 0 ? (
              <div className="border-2 border-dashed border-[#244B35]/20 rounded-xl p-8 text-center text-sm text-[#4A5A4E]">
                Chưa có ảnh nào cho sản phẩm này. Hãy nhấn “Tải nhiều ảnh lên” để thêm
                ảnh từ máy tính.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={`${img.image_url}-${idx}`}
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex !== null && dragIndex !== idx) {
                        handleMove(dragIndex, idx);
                      }
                      setDragIndex(null);
                    }}
                    className={`flex gap-3 p-3 rounded-xl border transition-colors ${
                      img.is_cover === 1
                        ? 'border-[#244B35] bg-[#F7F4EA]'
                        : 'border-[#244B35]/15 bg-white'
                    }`}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[#E9DFC9]/40">
                      <SafeImage
                        src={img.image_url}
                        alt={img.alt_text || `Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) => {
                          const val = e.target.value;
                          setImages((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, caption: val } : item,
                            ),
                          );
                        }}
                        placeholder="Chú thích ảnh..."
                        aria-label={`Chú thích ảnh ${idx + 1}`}
                        className="w-full px-2.5 py-1.5 rounded border border-[#244B35]/20 text-xs"
                      />

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                            img.is_cover === 1
                              ? 'bg-[#244B35] text-white'
                              : 'bg-[#E9DFC9]/60 text-[#244B35] hover:bg-[#E9DFC9]'
                          }`}
                        >
                          <Star className="w-3 h-3" />
                          <span>
                            {img.is_cover === 1 ? 'Ảnh đại diện' : 'Chọn làm đại diện'}
                          </span>
                        </button>

                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, idx - 1)}
                          aria-label={`Đưa ảnh ${idx + 1} lên trước`}
                          className="p-1 rounded border border-[#244B35]/15 disabled:opacity-30 hover:bg-[#F7F4EA]"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => handleMove(idx, idx + 1)}
                          aria-label={`Đưa ảnh ${idx + 1} xuống sau`}
                          className="p-1 rounded border border-[#244B35]/15 disabled:opacity-30 hover:bg-[#F7F4EA]"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          aria-label={`Xóa ảnh ${idx + 1}`}
                          className="p-1 rounded text-red-700 hover:bg-red-50 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Footer */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-[#244B35]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#244B35]/20 text-sm font-medium text-[#244B35] hover:bg-white cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, true)}
              className="px-4 py-2.5 rounded-lg border border-[#8A684B]/40 text-sm font-semibold text-[#8A684B] bg-white hover:bg-[#E9DFC9]/40 cursor-pointer"
            >
              Lưu nháp
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#244B35] text-[#F7F4EA] text-sm font-semibold hover:bg-[#1B3A29] cursor-pointer"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{product ? 'Lưu thay đổi' : 'Tạo sản phẩm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
