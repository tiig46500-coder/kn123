import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type DatabaseType from 'better-sqlite3';
import type {
  BootstrapData,
  Product,
  ProductImage,
  SiteSettings,
  WorkshopInfo,
} from '../src/types/domain';
import { getFullSeedBootstrap } from '../src/data/seedData';
import { slugifyVietnamese } from '../src/utils/catalog';
import {
  DATA_DIR,
  IS_VERCEL,
  LEGACY_IMAGE_MAP,
  UPLOADS_DIR,
  ensureWritableDirs,
  getOrCreateSqliteSessionSecret,
  openSqliteDatabase,
} from './db';

export { DATA_DIR, IS_VERCEL, UPLOADS_DIR };

export interface AdminUserRecord {
  id: number;
  username: string;
  password_hash: string;
}

export interface ProductCreateInput {
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

export interface ProductUpdateInput {
  name?: string;
  sku?: string;
  category_id?: number;
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
}

interface JsonStoreState extends BootstrapData {
  adminUsers: AdminUserRecord[];
  sessionSecret: string;
  nextIds: {
    product: number;
    productImage: number;
    category: number;
    gallery: number;
    article: number;
  };
}

let sqliteDb: DatabaseType.Database | null = null;
let jsonState: JsonStoreState | null = null;
let initialized = false;

const JSON_STORE_PATH = path.join(DATA_DIR, 'langxanh-store.json');

function normalizeLegacyJsonStore(raw: string): JsonStoreState | null {
  let updated = raw;
  let changed = false;
  if (
    updated.includes('/assets/aistudio/') ||
    updated.includes('/images/products/tranh-hoa-dao-lang-son.jpg')
  ) {
    for (const [legacy, next] of Object.entries(LEGACY_IMAGE_MAP)) {
      if (updated.includes(legacy)) {
        updated = updated.split(legacy).join(next);
        changed = true;
      }
    }
  }
  const parsed = JSON.parse(updated) as JsonStoreState;
  if (parsed && Array.isArray(parsed.products)) {
    if (changed) {
      saveJsonStore(parsed);
    }
    return parsed;
  }
  return null;
}

function initJsonFallback(): JsonStoreState {
  ensureWritableDirs();
  if (fs.existsSync(JSON_STORE_PATH)) {
    try {
      const raw = fs.readFileSync(JSON_STORE_PATH, 'utf8');
      const normalized = normalizeLegacyJsonStore(raw);
      if (normalized) {
        return normalized;
      }
    } catch {
      // fall through to fresh seed
    }
  }

  const full = getFullSeedBootstrap();
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'LangXanh@2026';
  const baseSecret =
    process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
      ? process.env.SESSION_SECRET
      : crypto
          .createHash('sha256')
          .update(`${password}::langxanh_vercel_session_key`)
          .digest('hex');

  const maxProdId = Math.max(0, ...full.products.map((p) => p.id));
  const maxImgId = Math.max(
    0,
    ...full.products.flatMap((p) => p.images.map((i) => i.id)),
  );
  const maxCatId = Math.max(0, ...full.categories.map((c) => c.id));
  const maxGalId = Math.max(0, ...full.gallery.map((g) => g.id));
  const maxArtId = Math.max(0, ...full.articles.map((a) => a.id));

  const initial: JsonStoreState = {
    ...full,
    adminUsers: [
      {
        id: 1,
        username,
        password_hash: bcrypt.hashSync(password, 10),
      },
    ],
    sessionSecret: baseSecret,
    nextIds: {
      product: maxProdId + 1,
      productImage: maxImgId + 1,
      category: maxCatId + 1,
      gallery: maxGalId + 1,
      article: maxArtId + 1,
    },
  };
  saveJsonStore(initial);
  return initial;
}

function saveJsonStore(state: JsonStoreState) {
  try {
    ensureWritableDirs();
    fs.writeFileSync(JSON_STORE_PATH, JSON.stringify(state), 'utf8');
  } catch {
    // keep in-memory state if tmp write fails
  }
}

function ensureStoreReady() {
  if (initialized) return;
  initialized = true;
  if (
    process.env.NO_DATABASE === 'true' ||
    process.env.USE_DATABASE === 'false'
  ) {
    sqliteDb = null;
    jsonState = initJsonFallback();
    return;
  }
  try {
    sqliteDb = openSqliteDatabase();
  } catch (err) {
    console.warn(
      'SQLite unavailable in this runtime, using JSON store fallback:',
      err instanceof Error ? err.message : String(err),
    );
    sqliteDb = null;
    jsonState = initJsonFallback();
  }
}

function hydrateSqliteProducts(db: DatabaseType.Database, onlyActive: boolean): Product[] {
  const whereClause = onlyActive ? 'WHERE p.is_active = 1' : '';
  const rows = db
    .prepare(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ${whereClause}
       ORDER BY p.display_order ASC, p.id DESC`,
    )
    .all() as Array<Omit<Product, 'images'>>;

  const imgs = db
    .prepare(
      `SELECT * FROM product_images
       ORDER BY is_cover DESC, display_order ASC, id ASC`,
    )
    .all() as ProductImage[];

  const imgMap = new Map<number, ProductImage[]>();
  for (const img of imgs) {
    const pid = Number(img.product_id);
    const list = imgMap.get(pid) ?? [];
    list.push(img);
    imgMap.set(pid, list);
  }

  return rows.map((r) => ({
    ...r,
    images: imgMap.get(Number(r.id)) ?? [],
  }));
}

function isUploadUsedElsewhereSqlite(
  db: DatabaseType.Database,
  imageUrl: string,
  excludeProductId?: number,
): boolean {
  if (!imageUrl.startsWith('/uploads/')) return true;
  const prodImgCount = (
    db
      .prepare(
        excludeProductId
          ? 'SELECT COUNT(*) as c FROM product_images WHERE image_url = ? AND product_id != ?'
          : 'SELECT COUNT(*) as c FROM product_images WHERE image_url = ?',
      )
      .get(...(excludeProductId ? [imageUrl, excludeProductId] : [imageUrl])) as {
      c: number;
    }
  ).c;
  if (prodImgCount > 0) return true;

  const galCount = (
    db
      .prepare('SELECT COUNT(*) as c FROM gallery_items WHERE image_url = ?')
      .get(imageUrl) as { c: number }
  ).c;
  if (galCount > 0) return true;

  const artCount = (
    db
      .prepare('SELECT COUNT(*) as c FROM articles WHERE cover_image = ?')
      .get(imageUrl) as { c: number }
  ).c;
  if (artCount > 0) return true;

  const procCount = (
    db
      .prepare('SELECT COUNT(*) as c FROM process_steps WHERE image_url = ?')
      .get(imageUrl) as { c: number }
  ).c;
  if (procCount > 0) return true;

  const banCount = (
    db
      .prepare('SELECT COUNT(*) as c FROM banners WHERE image_url = ?')
      .get(imageUrl) as { c: number }
  ).c;
  return banCount > 0;
}

function unlinkLocalUploadFile(imageUrl: string) {
  if (!imageUrl.startsWith('/uploads/')) return;
  const filename = path.basename(imageUrl);
  const fullPath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch {
      // ignore fs cleanup error
    }
  }
}

export const store = {
  init() {
    ensureStoreReady();
  },

  getSessionSecret(): string {
    ensureStoreReady();
    if (sqliteDb) {
      return getOrCreateSqliteSessionSecret(sqliteDb);
    }
    return jsonState!.sessionSecret;
  },

  getAdminUser(username: string): AdminUserRecord | undefined {
    ensureStoreReady();
    if (sqliteDb) {
      return sqliteDb
        .prepare('SELECT * FROM admin_users WHERE username = ?')
        .get(username.trim()) as AdminUserRecord | undefined;
    }
    return jsonState!.adminUsers.find((u) => u.username === username.trim());
  },

  updateAdminPassword(username: string, nextHash: string) {
    ensureStoreReady();
    if (sqliteDb) {
      sqliteDb
        .prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?')
        .run(nextHash, username);
      return;
    }
    const user = jsonState!.adminUsers.find((u) => u.username === username);
    if (user) {
      user.password_hash = nextHash;
      saveJsonStore(jsonState!);
    }
  },

  getPublicBootstrap(): BootstrapData {
    ensureStoreReady();
    if (sqliteDb) {
      const categories = sqliteDb
        .prepare('SELECT * FROM categories ORDER BY display_order ASC, id ASC')
        .all() as BootstrapData['categories'];
      const products = hydrateSqliteProducts(sqliteDb, true);
      const gallery = sqliteDb
        .prepare('SELECT * FROM gallery_items ORDER BY display_order ASC, id DESC')
        .all() as BootstrapData['gallery'];
      const articles = sqliteDb
        .prepare(
          'SELECT * FROM articles WHERE is_published = 1 ORDER BY published_at DESC, id DESC',
        )
        .all() as BootstrapData['articles'];
      const processSteps = sqliteDb
        .prepare('SELECT * FROM process_steps ORDER BY step_number ASC')
        .all() as BootstrapData['processSteps'];
      const banners = sqliteDb
        .prepare('SELECT * FROM banners WHERE is_active = 1')
        .all() as BootstrapData['banners'];
      const settingsRow = sqliteDb
        .prepare('SELECT value FROM site_settings WHERE key = ?')
        .get('site_settings') as { value: string } | undefined;
      const workshopRow = sqliteDb
        .prepare('SELECT value FROM site_settings WHERE key = ?')
        .get('workshop_info') as { value: string } | undefined;

      return {
        categories,
        products,
        gallery,
        articles,
        processSteps,
        banners,
        settings: settingsRow ? (JSON.parse(settingsRow.value) as SiteSettings) : null,
        workshop: workshopRow ? (JSON.parse(workshopRow.value) as WorkshopInfo) : null,
      };
    }

    const s = jsonState!;
    return {
      categories: [...s.categories].sort((a, b) => a.display_order - b.display_order || a.id - b.id),
      products: s.products
        .filter((p) => p.is_active === 1)
        .sort((a, b) => a.display_order - b.display_order || b.id - a.id),
      gallery: [...s.gallery].sort((a, b) => a.display_order - b.display_order || b.id - a.id),
      articles: s.articles
        .filter((a) => a.is_published === 1)
        .sort((a, b) => b.published_at.localeCompare(a.published_at) || b.id - a.id),
      processSteps: [...s.processSteps].sort((a, b) => a.step_number - b.step_number),
      banners: s.banners.filter((b) => b.is_active === 1),
      settings: s.settings,
      workshop: s.workshop,
    };
  },

  getAdminOverview(): BootstrapData {
    ensureStoreReady();
    if (sqliteDb) {
      const categories = sqliteDb
        .prepare('SELECT * FROM categories ORDER BY display_order ASC, id ASC')
        .all() as BootstrapData['categories'];
      const products = hydrateSqliteProducts(sqliteDb, false);
      const gallery = sqliteDb
        .prepare('SELECT * FROM gallery_items ORDER BY display_order ASC, id DESC')
        .all() as BootstrapData['gallery'];
      const articles = sqliteDb
        .prepare('SELECT * FROM articles ORDER BY published_at DESC, id DESC')
        .all() as BootstrapData['articles'];
      const processSteps = sqliteDb
        .prepare('SELECT * FROM process_steps ORDER BY step_number ASC')
        .all() as BootstrapData['processSteps'];
      const banners = sqliteDb
        .prepare('SELECT * FROM banners ORDER BY id ASC')
        .all() as BootstrapData['banners'];
      const settingsRow = sqliteDb
        .prepare('SELECT value FROM site_settings WHERE key = ?')
        .get('site_settings') as { value: string } | undefined;
      const workshopRow = sqliteDb
        .prepare('SELECT value FROM site_settings WHERE key = ?')
        .get('workshop_info') as { value: string } | undefined;

      return {
        categories,
        products,
        gallery,
        articles,
        processSteps,
        banners,
        settings: settingsRow ? (JSON.parse(settingsRow.value) as SiteSettings) : null,
        workshop: workshopRow ? (JSON.parse(workshopRow.value) as WorkshopInfo) : null,
      };
    }

    const s = jsonState!;
    return {
      categories: [...s.categories].sort((a, b) => a.display_order - b.display_order || a.id - b.id),
      products: [...s.products].sort((a, b) => a.display_order - b.display_order || b.id - a.id),
      gallery: [...s.gallery].sort((a, b) => a.display_order - b.display_order || b.id - a.id),
      articles: [...s.articles].sort((a, b) => b.published_at.localeCompare(a.published_at) || b.id - a.id),
      processSteps: [...s.processSteps].sort((a, b) => a.step_number - b.step_number),
      banners: [...s.banners].sort((a, b) => a.id - b.id),
      settings: s.settings,
      workshop: s.workshop,
    };
  },

  getPublicProductBySlug(slug: string): Product | null {
    ensureStoreReady();
    if (sqliteDb) {
      const row = sqliteDb
        .prepare(
          `SELECT p.*, c.name AS category_name, c.slug AS category_slug
           FROM products p
           LEFT JOIN categories c ON c.id = p.category_id
           WHERE p.slug = ? AND p.is_active = 1`,
        )
        .get(slug) as Omit<Product, 'images'> | undefined;
      if (!row) return null;
      const images = sqliteDb
        .prepare(
          'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_cover DESC, display_order ASC, id ASC',
        )
        .all(Number(row.id)) as ProductImage[];
      return { ...row, images };
    }
    return (
      jsonState!.products.find((p) => p.slug === slug && p.is_active === 1) ?? null
    );
  },

  createProduct(body: ProductCreateInput): { id: number; slug: string } {
    ensureStoreReady();
    const baseSlug = slugifyVietnamese(body.slug || body.name);
    const imgs = Array.isArray(body.images) ? body.images : [];
    const coverUrl =
      imgs.find((i) => i.is_cover === 1)?.image_url ?? imgs[0]?.image_url ?? '';

    if (sqliteDb) {
      let finalSlug = baseSlug || `san-pham-${Date.now()}`;
      const existingSlug = sqliteDb
        .prepare('SELECT id FROM products WHERE slug = ?')
        .get(finalSlug);
      if (existingSlug) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }

      const info = sqliteDb
        .prepare(
          `INSERT INTO products (
            name, slug, sku, category_id, short_description, full_description,
            highlights, price, specifications, material, availability,
            featured, is_active, display_order, cover_image
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          body.name.trim(),
          finalSlug,
          body.sku ?? '',
          Number(body.category_id),
          body.short_description ?? '',
          body.full_description ?? '',
          body.highlights ?? '',
          body.price !== null && body.price !== undefined && Number(body.price) > 0
            ? Number(body.price)
            : null,
          body.specifications ?? '',
          body.material ?? '',
          body.availability ?? 'contact',
          body.featured ? 1 : 0,
          body.is_active === 0 ? 0 : 1,
          Number(body.display_order ?? 0),
          coverUrl,
        );

      const productId = Number(info.lastInsertRowid);
      const insertImg = sqliteDb.prepare(
        'INSERT INTO product_images (product_id, image_url, alt_text, caption, display_order, is_cover) VALUES (?, ?, ?, ?, ?, ?)',
      );
      imgs.forEach((img, idx) => {
        const isCover = coverUrl === img.image_url && (img.is_cover === 1 || idx === 0) ? 1 : 0;
        insertImg.run(
          productId,
          img.image_url,
          img.alt_text || body.name.trim(),
          img.caption || '',
          img.display_order ?? idx + 1,
          isCover,
        );
      });

      return { id: productId, slug: finalSlug };
    }

    const s = jsonState!;
    let finalSlug = baseSlug || `san-pham-${Date.now()}`;
    if (s.products.some((p) => p.slug === finalSlug)) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }
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
      is_cover: coverUrl === img.image_url && (img.is_cover === 1 || idx === 0) ? 1 : 0,
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
    saveJsonStore(s);
    return { id: productId, slug: finalSlug };
  },

  updateProduct(id: number, body: ProductUpdateInput): boolean {
    ensureStoreReady();
    if (sqliteDb) {
      const existing = sqliteDb
        .prepare('SELECT * FROM products WHERE id = ?')
        .get(id) as Record<string, unknown> | undefined;
      if (!existing) return false;

      sqliteDb
        .prepare(
          `UPDATE products SET
            name = ?, sku = ?, category_id = ?, short_description = ?, full_description = ?,
            highlights = ?, price = ?, specifications = ?, material = ?, availability = ?,
            featured = ?, is_active = ?, display_order = ?, updated_at = datetime('now')
           WHERE id = ?`,
        )
        .run(
          body.name !== undefined ? body.name.trim() : existing.name,
          body.sku !== undefined ? body.sku : existing.sku,
          body.category_id !== undefined ? Number(body.category_id) : existing.category_id,
          body.short_description !== undefined
            ? body.short_description
            : existing.short_description,
          body.full_description !== undefined
            ? body.full_description
            : existing.full_description,
          body.highlights !== undefined ? body.highlights : existing.highlights,
          body.price !== undefined
            ? body.price !== null && Number(body.price) > 0
              ? Number(body.price)
              : null
            : existing.price,
          body.specifications !== undefined ? body.specifications : existing.specifications,
          body.material !== undefined ? body.material : existing.material,
          body.availability !== undefined ? body.availability : existing.availability,
          body.featured !== undefined ? (body.featured ? 1 : 0) : existing.featured,
          body.is_active !== undefined ? (body.is_active ? 1 : 0) : existing.is_active,
          body.display_order !== undefined
            ? Number(body.display_order)
            : existing.display_order,
          id,
        );
      return true;
    }

    const s = jsonState!;
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
    saveJsonStore(s);
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
    ensureStoreReady();
    const coverIndex = Math.max(
      0,
      images.findIndex((i) => i.is_cover === 1),
    );
    const coverUrl = images[coverIndex]?.image_url ?? '';

    if (sqliteDb) {
      const db = sqliteDb;
      const existing = db
        .prepare('SELECT id, name FROM products WHERE id = ?')
        .get(productId) as { id: number; name: string } | undefined;
      if (!existing) return null;

      const prevImages = db
        .prepare('SELECT image_url FROM product_images WHERE product_id = ?')
        .all(productId) as Array<{ image_url: string }>;

      const tx = db.transaction(() => {
        db.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);
        const insertImg = db.prepare(
          'INSERT INTO product_images (product_id, image_url, alt_text, caption, display_order, is_cover) VALUES (?, ?, ?, ?, ?, ?)',
        );
        images.forEach((img, idx) => {
          insertImg.run(
            productId,
            img.image_url,
            img.alt_text || existing.name,
            img.caption || '',
            idx + 1,
            idx === coverIndex ? 1 : 0,
          );
        });
        db.prepare(
          "UPDATE products SET cover_image = ?, updated_at = datetime('now') WHERE id = ?",
        ).run(coverUrl, productId);
      });
      tx();

      const nextUrls = new Set(images.map((i) => i.image_url));
      for (const prev of prevImages) {
        if (!nextUrls.has(prev.image_url) && !isUploadUsedElsewhereSqlite(db, prev.image_url, productId)) {
          unlinkLocalUploadFile(prev.image_url);
        }
      }
      return { cover_image: coverUrl };
    }

    const s = jsonState!;
    const idx = s.products.findIndex((p) => p.id === productId);
    if (idx === -1) return null;
    const prev = s.products[idx];
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
    saveJsonStore(s);
    return { cover_image: coverUrl };
  },

  deleteProduct(productId: number) {
    ensureStoreReady();
    if (sqliteDb) {
      const db = sqliteDb;
      const imgs = db
        .prepare('SELECT image_url FROM product_images WHERE product_id = ?')
        .all(productId) as Array<{ image_url: string }>;

      db.prepare('DELETE FROM products WHERE id = ?').run(productId);
      for (const img of imgs) {
        if (!isUploadUsedElsewhereSqlite(db, img.image_url, productId)) {
          unlinkLocalUploadFile(img.image_url);
        }
      }
      return;
    }

    const s = jsonState!;
    s.products = s.products.filter((p) => p.id !== productId);
    saveJsonStore(s);
  },

  createCategory(body: {
    name: string;
    group_code?: string;
    description?: string;
    display_order?: number;
  }): { id: number; slug: string } {
    ensureStoreReady();
    const slug = slugifyVietnamese(body.name) || `cat-${Date.now()}`;
    if (sqliteDb) {
      const info = sqliteDb
        .prepare(
          'INSERT INTO categories (name, slug, group_code, description, display_order) VALUES (?, ?, ?, ?, ?)',
        )
        .run(
          body.name.trim(),
          slug,
          body.group_code ?? '',
          body.description ?? '',
          body.display_order ?? 0,
        );
      return { id: Number(info.lastInsertRowid), slug };
    }
    const s = jsonState!;
    const id = s.nextIds.category++;
    s.categories.push({
      id,
      name: body.name.trim(),
      slug,
      group_code: body.group_code ?? '',
      description: body.description ?? '',
      display_order: Number(body.display_order ?? 0),
    });
    saveJsonStore(s);
    return { id, slug };
  },

  updateCategory(
    id: number,
    body: { name?: string; group_code?: string; description?: string; display_order?: number },
  ) {
    ensureStoreReady();
    if (sqliteDb) {
      sqliteDb
        .prepare(
          'UPDATE categories SET name = ?, group_code = ?, description = ?, display_order = ? WHERE id = ?',
        )
        .run(
          body.name ?? '',
          body.group_code ?? '',
          body.description ?? '',
          Number(body.display_order ?? 0),
          id,
        );
      return;
    }
    const s = jsonState!;
    const cat = s.categories.find((c) => c.id === id);
    if (cat) {
      cat.name = body.name ?? '';
      cat.group_code = body.group_code ?? '';
      cat.description = body.description ?? '';
      cat.display_order = Number(body.display_order ?? 0);
      saveJsonStore(s);
    }
  },

  createGalleryItem(body: {
    album: string;
    title: string;
    caption?: string;
    image_url: string;
  }): { id: number } {
    ensureStoreReady();
    if (sqliteDb) {
      const info = sqliteDb
        .prepare(
          'INSERT INTO gallery_items (album, title, caption, image_url, display_order) VALUES (?, ?, ?, ?, ?)',
        )
        .run(body.album, body.title, body.caption ?? '', body.image_url, 0);
      return { id: Number(info.lastInsertRowid) };
    }
    const s = jsonState!;
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
    saveJsonStore(s);
    return { id };
  },

  deleteGalleryItem(id: number) {
    ensureStoreReady();
    if (sqliteDb) {
      const item = sqliteDb
        .prepare('SELECT image_url FROM gallery_items WHERE id = ?')
        .get(id) as { image_url: string } | undefined;
      sqliteDb.prepare('DELETE FROM gallery_items WHERE id = ?').run(id);
      if (item && !isUploadUsedElsewhereSqlite(sqliteDb, item.image_url)) {
        unlinkLocalUploadFile(item.image_url);
      }
      return;
    }
    const s = jsonState!;
    s.gallery = s.gallery.filter((g) => g.id !== id);
    saveJsonStore(s);
  },

  createArticle(body: {
    title: string;
    summary?: string;
    content?: string;
    cover_image?: string;
    published_at?: string;
    is_published?: number;
  }): { id: number } {
    ensureStoreReady();
    const slug = `${slugifyVietnamese(body.title)}-${Date.now().toString().slice(-4)}`;
    const publishedAt = body.published_at || new Date().toISOString().slice(0, 10);
    const isPublished = body.is_published === 0 ? 0 : 1;

    if (sqliteDb) {
      const info = sqliteDb
        .prepare(
          'INSERT INTO articles (title, slug, summary, content, cover_image, published_at, is_published) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .run(
          body.title.trim(),
          slug,
          body.summary ?? '',
          body.content ?? '',
          body.cover_image ?? '',
          publishedAt,
          isPublished,
        );
      return { id: Number(info.lastInsertRowid) };
    }

    const s = jsonState!;
    const id = s.nextIds.article++;
    s.articles.push({
      id,
      title: body.title.trim(),
      slug,
      summary: body.summary ?? '',
      content: body.content ?? '',
      cover_image: body.cover_image ?? '',
      published_at: publishedAt,
      is_published: isPublished,
    });
    saveJsonStore(s);
    return { id };
  },

  updateArticle(
    id: number,
    body: {
      title?: string;
      summary?: string;
      content?: string;
      cover_image?: string;
      published_at?: string;
      is_published?: number;
    },
  ) {
    ensureStoreReady();
    if (sqliteDb) {
      sqliteDb
        .prepare(
          'UPDATE articles SET title = ?, summary = ?, content = ?, cover_image = ?, published_at = ?, is_published = ? WHERE id = ?',
        )
        .run(
          body.title ?? '',
          body.summary ?? '',
          body.content ?? '',
          body.cover_image ?? '',
          body.published_at ?? '',
          body.is_published ? 1 : 0,
          id,
        );
      return;
    }
    const s = jsonState!;
    const art = s.articles.find((a) => a.id === id);
    if (art) {
      art.title = body.title ?? '';
      art.summary = body.summary ?? '';
      art.content = body.content ?? '';
      art.cover_image = body.cover_image ?? '';
      art.published_at = body.published_at ?? '';
      art.is_published = body.is_published ? 1 : 0;
      saveJsonStore(s);
    }
  },

  deleteArticle(id: number) {
    ensureStoreReady();
    if (sqliteDb) {
      sqliteDb.prepare('DELETE FROM articles WHERE id = ?').run(id);
      return;
    }
    const s = jsonState!;
    s.articles = s.articles.filter((a) => a.id !== id);
    saveJsonStore(s);
  },

  updateProcessStep(
    id: number,
    body: { title?: string; description?: string; image_url?: string; caption?: string },
  ) {
    ensureStoreReady();
    if (sqliteDb) {
      sqliteDb
        .prepare(
          'UPDATE process_steps SET title = ?, description = ?, image_url = ?, caption = ? WHERE id = ?',
        )
        .run(
          body.title ?? '',
          body.description ?? '',
          body.image_url ?? '',
          body.caption ?? '',
          id,
        );
      return;
    }
    const s = jsonState!;
    const step = s.processSteps.find((p) => p.id === id);
    if (step) {
      step.title = body.title ?? '';
      step.description = body.description ?? '';
      step.image_url = body.image_url ?? '';
      step.caption = body.caption ?? '';
      saveJsonStore(s);
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
    ensureStoreReady();
    if (sqliteDb) {
      sqliteDb
        .prepare(
          'UPDATE banners SET title = ?, subtitle = ?, image_url = ?, cta_label = ?, cta_link = ?, is_active = ? WHERE id = ?',
        )
        .run(
          body.title ?? '',
          body.subtitle ?? '',
          body.image_url ?? '',
          body.cta_label ?? '',
          body.cta_link ?? '',
          body.is_active ? 1 : 0,
          id,
        );
      return;
    }
    const s = jsonState!;
    const ban = s.banners.find((b) => b.id === id);
    if (ban) {
      ban.title = body.title ?? '';
      ban.subtitle = body.subtitle ?? '';
      ban.image_url = body.image_url ?? '';
      ban.cta_label = body.cta_label ?? '';
      ban.cta_link = body.cta_link ?? '';
      ban.is_active = body.is_active ? 1 : 0;
      saveJsonStore(s);
    }
  },

  saveSettings(settings: SiteSettings) {
    ensureStoreReady();
    if (sqliteDb) {
      sqliteDb
        .prepare(
          'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        )
        .run('site_settings', JSON.stringify(settings));
      return;
    }
    const s = jsonState!;
    s.settings = settings;
    saveJsonStore(s);
  },

  saveWorkshop(workshop: WorkshopInfo) {
    ensureStoreReady();
    if (sqliteDb) {
      sqliteDb
        .prepare(
          'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        )
        .run('workshop_info', JSON.stringify(workshop));
      return;
    }
    const s = jsonState!;
    s.workshop = workshop;
    saveJsonStore(s);
  },
};
