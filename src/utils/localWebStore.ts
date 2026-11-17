import type {
  BootstrapData,
  Category,
  Product,
  ProductImage,
  SiteSettings,
  WorkshopInfo,
} from '../types/domain';
import { getFullSeedBootstrap, getPublicSeedBootstrap } from '../data/seedData';
import { slugifyVietnamese } from './catalog';

const WEB_STATE_KEY = 'langxanh_web_state_v1';
const WEB_ADMIN_CRED_KEY = 'langxanh_web_admin_cred_v1';
const WEB_ADMIN_SESSION_KEY = 'langxanh_web_admin_session_v1';

interface StoredWebState extends BootstrapData {
  nextIds: {
    product: number;
    productImage: number;
    category: number;
    gallery: number;
    article: number;
  };
  updatedAt: string;
}

interface LocalAdminCred {
  username: string;
  passHash: string;
}

export interface LocalProductInput {
  name: string;
  slug?: string;
  sku?: string;
  category_id: number;
  short_description?: string;
  full_description?: string;
  highlights?: string;
  price?: number | null;
  specifications?: string;
  material?: string;
  availability?: Product['availability'];
  featured?: number;
  is_active?: number;
  display_order?: number;
  images?: Array<{
    image_url: string;
    alt_text?: string;
    caption?: string;
    display_order?: number;
    is_cover?: number;
  }>;
}

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // ignore storage access errors
  }
  return null;
}

function buildInitialWebState(): StoredWebState {
  const full = getFullSeedBootstrap();
  const maxProdId = Math.max(0, ...full.products.map((p) => p.id));
  const maxImgId = Math.max(
    0,
    ...full.products.flatMap((p) => p.images.map((i) => i.id)),
  );
  const maxCatId = Math.max(0, ...full.categories.map((c) => c.id));
  const maxGalId = Math.max(0, ...full.gallery.map((g) => g.id));
  const maxArtId = Math.max(0, ...full.articles.map((a) => a.id));

  return {
    ...full,
    nextIds: {
      product: maxProdId + 1,
      productImage: maxImgId + 1,
      category: maxCatId + 1,
      gallery: maxGalId + 1,
      article: maxArtId + 1,
    },
    updatedAt: new Date().toISOString(),
  };
}

function readStoredState(): StoredWebState | null {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(WEB_STATE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredWebState;
    if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.categories)) {
      return parsed;
    }
  } catch {
    // corrupted local state, ignore
  }
  return null;
}

function writeStoredState(state: StoredWebState): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    state.updatedAt = new Date().toISOString();
    storage.setItem(WEB_STATE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function ensureState(): StoredWebState {
  return readStoredState() ?? buildInitialWebState();
}

export function hasLocalWebOverrides(): boolean {
  return readStoredState() !== null;
}

export function getEffectivePublicBootstrap(): BootstrapData {
  const saved = readStoredState();
  if (!saved) {
    return getPublicSeedBootstrap();
  }
  return filterPublicBootstrap(saved);
}

export function filterPublicBootstrap(state: BootstrapData): BootstrapData {
  return {
    categories: [...state.categories].sort(
      (a, b) => a.display_order - b.display_order || a.id - b.id,
    ),
    products: state.products
      .filter((p) => p.is_active === 1)
      .sort((a, b) => a.display_order - b.display_order || b.id - a.id),
    gallery: [...state.gallery].sort(
      (a, b) => a.display_order - b.display_order || b.id - a.id,
    ),
    articles: state.articles
      .filter((a) => a.is_published === 1)
      .sort((a, b) => b.published_at.localeCompare(a.published_at) || b.id - a.id),
    processSteps: [...state.processSteps].sort(
      (a, b) => a.step_number - b.step_number,
    ),
    banners: state.banners.filter((b) => b.is_active === 1),
    settings: state.settings,
    workshop: state.workshop,
  };
}

export function getLocalAdminOverview(): BootstrapData {
  const s = ensureState();
  return {
    categories: [...s.categories].sort(
      (a, b) => a.display_order - b.display_order || a.id - b.id,
    ),
    products: [...s.products].sort(
      (a, b) => a.display_order - b.display_order || b.id - a.id,
    ),
    gallery: [...s.gallery].sort(
      (a, b) => a.display_order - b.display_order || b.id - a.id,
    ),
    articles: [...s.articles].sort(
      (a, b) => b.published_at.localeCompare(a.published_at) || b.id - a.id,
    ),
    processSteps: [...s.processSteps].sort((a, b) => a.step_number - b.step_number),
    banners: [...s.banners].sort((a, b) => a.id - b.id),
    settings: s.settings,
    workshop: s.workshop,
  };
}

export function saveSnapshotToLocalWebStore(data: BootstrapData): boolean {
  const maxProdId = Math.max(0, ...data.products.map((p) => p.id));
  const maxImgId = Math.max(
    0,
    ...data.products.flatMap((p) => (p.images ?? []).map((i) => i.id)),
  );
  const maxCatId = Math.max(0, ...data.categories.map((c) => c.id));
  const maxGalId = Math.max(0, ...data.gallery.map((g) => g.id));
  const maxArtId = Math.max(0, ...data.articles.map((a) => a.id));

  return writeStoredState({
    ...data,
    nextIds: {
      product: maxProdId + 1,
      productImage: maxImgId + 1,
      category: maxCatId + 1,
      gallery: maxGalId + 1,
      article: maxArtId + 1,
    },
    updatedAt: new Date().toISOString(),
  });
}

export function resetLocalWebStore(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(WEB_STATE_KEY);
}

export function exportLocalWebStoreJson(): string {
  const current = getLocalAdminOverview();
  return JSON.stringify(current, null, 2);
}

export function importLocalWebStoreJson(rawJson: string): {
  ok: boolean;
  error?: string;
} {
  try {
    const parsed = JSON.parse(rawJson) as Partial<BootstrapData>;
    if (
      !parsed ||
      !Array.isArray(parsed.categories) ||
      !Array.isArray(parsed.products) ||
      !Array.isArray(parsed.gallery) ||
      !Array.isArray(parsed.articles) ||
      !Array.isArray(parsed.processSteps) ||
      !Array.isArray(parsed.banners)
    ) {
      return { ok: false, error: 'Tệp sao lưu không đúng cấu trúc dữ liệu Lạng Xanh.' };
    }
    const saved = saveSnapshotToLocalWebStore({
      categories: parsed.categories,
      products: parsed.products,
      gallery: parsed.gallery,
      articles: parsed.articles,
      processSteps: parsed.processSteps,
      banners: parsed.banners,
      settings: parsed.settings ?? null,
      workshop: parsed.workshop ?? null,
    });
    if (!saved) {
      return {
        ok: false,
        error: 'Bộ nhớ trình duyệt đã đầy, không thể nhập toàn bộ dữ liệu.',
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Không thể đọc tệp JSON. Vui lòng kiểm tra lại định dạng.' };
  }
}

export const localWebStore = {
  createProduct(body: LocalProductInput): { id: number; slug: string } {
    const s = ensureState();
    const baseSlug = slugifyVietnamese(body.slug || body.name);
    let finalSlug = baseSlug || `san-pham-${Date.now()}`;
    if (s.products.some((p) => p.slug === finalSlug)) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }
    const imgs = Array.isArray(body.images) ? body.images : [];
    const coverUrl =
      imgs.find((i) => i.is_cover === 1)?.image_url ?? imgs[0]?.image_url ?? '';
    const productId = s.nextIds.product++;
    const cat = s.categories.find((c) => c.id === Number(body.category_id));
    const now = new Date().toISOString();

    const createdImages: ProductImage[] = imgs.map((img, idx) => ({
      id: s.nextIds.productImage++,
      product_id: productId,
      image_url: img.image_url,
      alt_text: img.alt_text || body.name.trim(),
      caption: img.caption || '',
      display_order: img.display_order ?? idx + 1,
      is_cover:
        coverUrl === img.image_url && (img.is_cover === 1 || idx === 0) ? 1 : 0,
      created_at: now,
    }));

    s.products.push({
      id: productId,
      name: body.name.trim(),
      slug: finalSlug,
      sku: body.sku ?? '',
      category_id: Number(body.category_id),
      category_name: cat?.name,
      category_slug: cat?.slug,
      short_description: body.short_description ?? '',
      full_description: body.full_description ?? '',
      highlights: body.highlights ?? '',
      price:
        body.price !== null && body.price !== undefined && Number(body.price) > 0
          ? Number(body.price)
          : null,
      specifications: body.specifications ?? '',
      material: body.material ?? '',
      availability: body.availability ?? 'contact',
      featured: body.featured ? 1 : 0,
      is_active: body.is_active === 0 ? 0 : 1,
      display_order: Number(body.display_order ?? 0),
      cover_image: coverUrl,
      images: createdImages,
      created_at: now,
      updated_at: now,
    });
    writeStoredState(s);
    return { id: productId, slug: finalSlug };
  },

  updateProduct(id: number, body: Partial<LocalProductInput>): boolean {
    const s = ensureState();
    const idx = s.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const prev = s.products[idx];
    const nextCatId =
      body.category_id !== undefined ? Number(body.category_id) : prev.category_id;
    const cat = s.categories.find((c) => c.id === nextCatId);

    s.products[idx] = {
      ...prev,
      name: body.name !== undefined ? body.name.trim() : prev.name,
      sku: body.sku !== undefined ? body.sku : prev.sku,
      category_id: nextCatId,
      category_name: cat?.name ?? prev.category_name,
      category_slug: cat?.slug ?? prev.category_slug,
      short_description:
        body.short_description !== undefined
          ? body.short_description
          : prev.short_description,
      full_description:
        body.full_description !== undefined
          ? body.full_description
          : prev.full_description,
      highlights: body.highlights !== undefined ? body.highlights : prev.highlights,
      price:
        body.price !== undefined
          ? body.price !== null && Number(body.price) > 0
            ? Number(body.price)
            : null
          : prev.price,
      specifications:
        body.specifications !== undefined ? body.specifications : prev.specifications,
      material: body.material !== undefined ? body.material : prev.material,
      availability:
        body.availability !== undefined ? body.availability : prev.availability,
      featured: body.featured !== undefined ? (body.featured ? 1 : 0) : prev.featured,
      is_active:
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : prev.is_active,
      display_order:
        body.display_order !== undefined
          ? Number(body.display_order)
          : prev.display_order,
      updated_at: new Date().toISOString(),
    };
    writeStoredState(s);
    return true;
  },

  replaceProductImages(
    productId: number,
    images: Array<{
      image_url: string;
      alt_text?: string;
      caption?: string;
      display_order?: number;
      is_cover?: number;
    }>,
  ): { cover_image: string } | null {
    const s = ensureState();
    const idx = s.products.findIndex((p) => p.id === productId);
    if (idx === -1) return null;
    const prev = s.products[idx];
    const coverIndex = Math.max(
      0,
      images.findIndex((i) => i.is_cover === 1),
    );
    const coverUrl = images[coverIndex]?.image_url ?? '';
    const now = new Date().toISOString();

    prev.images = images.map((img, i) => ({
      id: s.nextIds.productImage++,
      product_id: productId,
      image_url: img.image_url,
      alt_text: img.alt_text || prev.name,
      caption: img.caption || '',
      display_order: i + 1,
      is_cover: i === coverIndex ? 1 : 0,
      created_at: now,
    }));
    prev.cover_image = coverUrl;
    prev.updated_at = now;
    writeStoredState(s);
    return { cover_image: coverUrl };
  },

  deleteProduct(productId: number) {
    const s = ensureState();
    s.products = s.products.filter((p) => p.id !== productId);
    writeStoredState(s);
  },

  updateCategory(id: number, body: Partial<Category>) {
    const s = ensureState();
    const cat = s.categories.find((c) => c.id === id);
    if (cat) {
      cat.name = body.name ?? cat.name;
      cat.group_code = body.group_code ?? cat.group_code;
      cat.description = body.description ?? cat.description;
      cat.display_order =
        body.display_order !== undefined
          ? Number(body.display_order)
          : cat.display_order;
      s.products = s.products.map((p) =>
        p.category_id === id ? { ...p, category_name: cat.name } : p,
      );
      writeStoredState(s);
    }
  },

  createGalleryItem(body: {
    album: string;
    title: string;
    caption?: string;
    image_url: string;
  }): { id: number } {
    const s = ensureState();
    const id = s.nextIds.gallery++;
    s.gallery.push({
      id,
      album: body.album,
      title: body.title,
      caption: body.caption ?? '',
      image_url: body.image_url,
      display_order: 0,
      created_at: new Date().toISOString(),
    });
    writeStoredState(s);
    return { id };
  },

  deleteGalleryItem(id: number) {
    const s = ensureState();
    s.gallery = s.gallery.filter((g) => g.id !== id);
    writeStoredState(s);
  },

  createArticle(body: {
    title: string;
    summary?: string;
    content?: string;
    cover_image?: string;
    published_at?: string;
    is_published?: number;
  }): { id: number } {
    const s = ensureState();
    const id = s.nextIds.article++;
    const slug = `${slugifyVietnamese(body.title)}-${Date.now().toString().slice(-4)}`;
    s.articles.push({
      id,
      title: body.title.trim(),
      slug,
      summary: body.summary ?? '',
      content: body.content ?? '',
      cover_image: body.cover_image ?? '',
      published_at: body.published_at || new Date().toISOString().slice(0, 10),
      is_published: body.is_published === 0 ? 0 : 1,
    });
    writeStoredState(s);
    return { id };
  },

  deleteArticle(id: number) {
    const s = ensureState();
    s.articles = s.articles.filter((a) => a.id !== id);
    writeStoredState(s);
  },

  updateProcessStep(
    id: number,
    body: { title?: string; description?: string; image_url?: string; caption?: string },
  ) {
    const s = ensureState();
    const step = s.processSteps.find((p) => p.id === id);
    if (step) {
      step.title = body.title ?? step.title;
      step.description = body.description ?? step.description;
      step.image_url = body.image_url ?? step.image_url;
      step.caption = body.caption ?? step.caption;
      writeStoredState(s);
    }
  },

  updateBanner(
    id: number,
    body: {
      title?: string;
      subtitle?: string;
      image_url?: string;
      cta_label?: string;
      cta_link?: string;
      is_active?: number;
    },
  ) {
    const s = ensureState();
    const ban = s.banners.find((b) => b.id === id);
    if (ban) {
      ban.title = body.title ?? ban.title;
      ban.subtitle = body.subtitle ?? ban.subtitle;
      ban.image_url = body.image_url ?? ban.image_url;
      ban.cta_label = body.cta_label ?? ban.cta_label;
      ban.cta_link = body.cta_link ?? ban.cta_link;
      ban.is_active = body.is_active !== undefined ? (body.is_active ? 1 : 0) : ban.is_active;
      writeStoredState(s);
    }
  },

  saveSettings(settings: SiteSettings) {
    const s = ensureState();
    s.settings = settings;
    writeStoredState(s);
  },

  saveWorkshop(workshop: WorkshopInfo) {
    const s = ensureState();
    s.workshop = workshop;
    writeStoredState(s);
  },
};

function simpleHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `lx_${(h >>> 0).toString(16)}`;
}

function getLocalCred(): LocalAdminCred {
  const storage = getStorage();
  if (storage) {
    const raw = storage.getItem(WEB_ADMIN_CRED_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as LocalAdminCred;
        if (parsed.username && parsed.passHash) return parsed;
      } catch {
        // fallback to default
      }
    }
  }
  return {
    username: 'admin',
    passHash: simpleHash('LangXanh@2026'),
  };
}

export function verifyLocalAdminLogin(username: string, password: string): boolean {
  const cred = getLocalCred();
  if (
    username.trim() === cred.username &&
    simpleHash(password) === cred.passHash
  ) {
    const storage = getStorage();
    storage?.setItem(
      WEB_ADMIN_SESSION_KEY,
      JSON.stringify({ username: cred.username, ts: Date.now() }),
    );
    return true;
  }
  return false;
}

export function getLocalAdminSession(): { authenticated: boolean; username: string } {
  const storage = getStorage();
  if (!storage) return { authenticated: false, username: '' };
  const raw = storage.getItem(WEB_ADMIN_SESSION_KEY);
  if (!raw) return { authenticated: false, username: '' };
  try {
    const parsed = JSON.parse(raw) as { username?: string; ts?: number };
    if (parsed.username && parsed.ts && Date.now() - parsed.ts < 7 * 24 * 60 * 60 * 1000) {
      return { authenticated: true, username: parsed.username };
    }
  } catch {
    // ignore
  }
  return { authenticated: false, username: '' };
}

export function clearLocalAdminSession(): void {
  getStorage()?.removeItem(WEB_ADMIN_SESSION_KEY);
}

export function changeLocalAdminPassword(
  currentPassword: string,
  newPassword: string,
): { ok: boolean; error?: string } {
  const cred = getLocalCred();
  if (simpleHash(currentPassword) !== cred.passHash) {
    return { ok: false, error: 'Mật khẩu hiện tại không đúng.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
  }
  const storage = getStorage();
  storage?.setItem(
    WEB_ADMIN_CRED_KEY,
    JSON.stringify({ username: cred.username, passHash: simpleHash(newPassword) }),
  );
  return { ok: true };
}

export async function filesToPersistedDataUrls(files: FileList): Promise<string[]> {
  const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh.'));
      reader.readAsDataURL(file);
    });

  const compressImage = async (file: File): Promise<string> => {
    const rawUrl = await readAsDataUrl(file);
    if (typeof document === 'undefined') return rawUrl;
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 1200;
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          const ratio = Math.min(maxSide / width, maxSide / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed.length < rawUrl.length ? compressed : rawUrl);
        } catch {
          resolve(rawUrl);
        }
      };
      img.onerror = () => resolve(rawUrl);
      img.src = rawUrl;
    });
  };

  return Promise.all(Array.from(files).map(compressImage));
}
