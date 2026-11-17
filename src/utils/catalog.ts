import type { Product, ProductImage, SortOption } from '../types/domain';

export const OFFICIAL_FACEBOOK_URL =
  'https://www.facebook.com/share/1E3CsadTwa/?mibextid=wwXIfr';

export function normalizeVietnamese(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function slugifyVietnamese(input: string): string {
  return normalizeVietnamese(input)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatPriceVND(price: number | null | undefined): string {
  if (price === null || price === undefined || price <= 0) {
    return 'Liên hệ tư vấn';
  }
  return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
}

export function formatAvailabilityLabel(
  availability: Product['availability'],
): string {
  switch (availability) {
    case 'in_stock':
      return 'Còn hàng';
    case 'out_of_stock':
      return 'Tạm hết hàng';
    case 'contact':
    default:
      return 'Liên hệ đặt hàng';
  }
}

export function buildFacebookOrderMessage(productName: string): string {
  return `Xin chào Lạng Xanh, tôi muốn tìm hiểu và đặt mua sản phẩm ${productName}.`;
}

export function isProductPubliclyVisible(product: Product): boolean {
  if (!product.is_active) return false;
  if (!product.name || !product.name.trim()) return false;
  if (!product.short_description || !product.short_description.trim()) {
    return false;
  }
  const hasCover = Boolean(product.cover_image && product.cover_image.trim());
  const hasImages = Array.isArray(product.images) && product.images.length > 0;
  return hasCover || hasImages;
}

export function resolveOrderedImages(product: Product): ProductImage[] {
  const imgs = Array.isArray(product.images) ? [...product.images] : [];
  imgs.sort((a, b) => {
    if (a.is_cover !== b.is_cover) return b.is_cover - a.is_cover;
    return a.display_order - b.display_order;
  });
  if (imgs.length === 0 && product.cover_image) {
    return [
      {
        id: 0,
        product_id: product.id,
        image_url: product.cover_image,
        alt_text: product.name,
        caption: product.name,
        display_order: 0,
        is_cover: 1,
      },
    ];
  }
  return imgs;
}

export function getCoverImageUrl(product: Product): string {
  if (product.cover_image && product.cover_image.trim()) {
    return product.cover_image;
  }
  const ordered = resolveOrderedImages(product);
  return ordered[0]?.image_url ?? '';
}

export function filterAndSortProducts(
  products: Product[],
  options: {
    categorySlug?: string;
    query?: string;
    sort?: SortOption;
    includeHidden?: boolean;
  },
): Product[] {
  const {
    categorySlug = 'all',
    query = '',
    sort = 'newest',
    includeHidden = false,
  } = options;

  const normalizedQuery = normalizeVietnamese(query);

  const filtered = products.filter((p) => {
    if (!includeHidden && !isProductPubliclyVisible(p)) return false;

    if (categorySlug && categorySlug !== 'all') {
      if (p.category_slug !== categorySlug) return false;
    }

    if (normalizedQuery) {
      const hay = normalizeVietnamese(
        `${p.name} ${p.short_description} ${p.category_name ?? ''} ${p.material}`,
      );
      if (!hay.includes(normalizedQuery)) return false;
    }

    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (sort) {
      case 'name-asc':
        return a.name.localeCompare(b.name, 'vi');
      case 'price-asc': {
        const pa = a.price && a.price > 0 ? a.price : Number.MAX_SAFE_INTEGER;
        const pb = b.price && b.price > 0 ? b.price : Number.MAX_SAFE_INTEGER;
        if (pa !== pb) return pa - pb;
        return a.display_order - b.display_order;
      }
      case 'price-desc': {
        const pa = a.price && a.price > 0 ? a.price : -1;
        const pb = b.price && b.price > 0 ? b.price : -1;
        if (pa !== pb) return pb - pa;
        return a.display_order - b.display_order;
      }
      case 'newest':
      default: {
        const da = Date.parse(a.updated_at || a.created_at || '') || 0;
        const db = Date.parse(b.updated_at || b.created_at || '') || 0;
        if (db !== da) return db - da;
        return a.display_order - b.display_order;
      }
    }
  });

  return sorted;
}

export function wrapGalleryIndex(current: number, delta: number, total: number): number {
  if (total <= 0) return 0;
  return (current + delta + total) % total;
}

export function reorderArray<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items];
  }
  const copy = [...items];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

export function getRelatedProducts(
  currentProduct: Product,
  allProducts: Product[],
  limit = 4,
): Product[] {
  const visible = allProducts.filter(
    (p) => p.id !== currentProduct.id && isProductPubliclyVisible(p),
  );
  const sameCategory = visible.filter(
    (p) => p.category_id === currentProduct.category_id,
  );
  const others = visible.filter(
    (p) => p.category_id !== currentProduct.category_id,
  );
  return [...sameCategory, ...others].slice(0, limit);
}
