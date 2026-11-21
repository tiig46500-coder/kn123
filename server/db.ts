import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import type DatabaseType from 'better-sqlite3';
import {
  SEED_ARTICLES,
  SEED_BANNERS,
  SEED_CATEGORIES,
  SEED_GALLERY,
  SEED_PROCESS_STEPS,
  SEED_PRODUCTS,
  SEED_SITE_SETTINGS,
  SEED_WORKSHOP_INFO,
} from '../src/data/seedData';

const require = createRequire(import.meta.url);

export const IS_VERCEL = Boolean(process.env.VERCEL);
export const LEGACY_IMAGE_MAP: Record<string, string> = {
  '/assets/aistudio/IMG_2937_3a4239a7.JPG': '/images/branding/logo-lang-xanh.jpg',
  '/assets/aistudio/IMG_2943_370b061f.JPG': '/images/branding/tiktok-qr-lang-xanh.jpg',
  '/assets/aistudio/IMG_2936_74249a8c.JPG': '/images/branding/kenh-truyen-thong-lang-xanh.jpg',
  '/assets/aistudio/IMG_2938_17ddc505.JPG': '/images/projects/gian-hang-lang-xanh.jpg',
  '/assets/aistudio/IMG_2947_2842f8e1.JPG': '/images/projects/nhom-hoc-sinh-lang-xanh.jpg',
  '/assets/aistudio/IMG_2939_6a7f8407.JPG': '/images/projects/tram-xanh-workshop.jpg',
  '/assets/aistudio/IMG_2911_b4b69a3c.JPG': '/images/projects/xo-muop-nguyen-trai.jpg',
  '/assets/aistudio/IMG_2941_26ed93b8.JPG': '/images/projects/so-che-xo-muop.jpg',
  '/assets/aistudio/IMG_2924_e79a4bbf.JPG': '/images/projects/tam-soi-xo-muop.jpg',
  '/assets/aistudio/IMG_2917_bd44012f.JPG': '/images/projects/tam-lot-ep-phang.jpg',
  '/assets/aistudio/IMG_2918_df24381f.JPG': '/images/projects/ep-nhiet-dinh-hinh.jpg',
  '/assets/aistudio/IMG_2944_53094930.JPG': '/images/projects/kiem-thu-thoang-khi.jpg',
  '/assets/aistudio/IMG_2942_d37c8ab6.JPG': '/images/products/mieng-rua-chen-giot-nuoc.jpg',
  '/assets/aistudio/IMG_2925_289f01b5.JPG': '/images/products/bo-san-pham-gia-dung.jpg',
  '/assets/aistudio/IMG_2948_de6ea717.JPG': '/images/products/mieng-rua-chen-bau-duc.jpg',
  '/assets/aistudio/IMG_2904_f2913d8b.JPG': '/images/products/bong-tam-trai-tim.jpg',
  '/assets/aistudio/IMG_2912_bf6e653d.JPG': '/images/products/tui-rut-hoa-hoi-bong-tam.jpg',
  '/assets/aistudio/IMG_2915_902d0be2.JPG': '/images/products/tui-tote-gau-vit.jpg',
  '/assets/aistudio/IMG_2916_3544c755.JPG': '/images/products/bo-doi-tui-tote-deo-cheo.jpg',
  '/assets/aistudio/IMG_2932_9309b428.JPG': '/images/products/tui-theu-la-dao.jpg',
  '/assets/aistudio/IMG_2908_17ae1555.JPG': '/images/products/tui-deo-cheo-trai-tim.jpg',
  '/assets/aistudio/IMG_2909_6dca3dec.JPG': '/images/products/can-canh-tui-deo-cheo.jpg',
  '/assets/aistudio/IMG_2931_293bbaef.JPG': '/images/products/quat-cam-tay-hoa-do.jpg',
  '/assets/aistudio/IMG_2933_f36d9f63.JPG': '/images/products/cap-quat-cam-tay.jpg',
  '/assets/aistudio/IMG_2929_993eb9f6.JPG': '/images/products/dep-xo-muop-khay-may.jpg',
  '/assets/aistudio/IMG_2910_000b2368.JPG': '/images/products/mu-non-xo-muop.jpg',
  '/assets/aistudio/IMG_2921_e13f1ee5.JPG': '/images/products/den-ngu-hoa-nam-canh.jpg',
  '/assets/aistudio/IMG_2920_ff345bef.JPG': '/images/products/den-lap-phuong-gan-la.jpg',
  '/assets/aistudio/IMG_2919_a242b100.JPG': '/images/products/den-chop-chuon-chuon.jpg',
  '/assets/aistudio/IMG_2935_a46de42d.JPG': '/images/products/den-cay-thong-xo-muop.jpg',
  '/assets/aistudio/IMG_2934_5384f946.JPG': '/images/products/den-ban-anh-sang-am.jpg',
  '/assets/aistudio/IMG_2902_30bb284e.JPG': '/images/products/bo-den-mini-that-no.jpg',
  '/assets/aistudio/IMG_2867_03337256.JPG': '/assets/aistudio/image_df5e262a.png',
  '/images/products/tranh-hoa-dao-lang-son.jpg': '/assets/aistudio/image_df5e262a.png',
  '/assets/aistudio/IMG_2897_9f966b31.JPG': '/images/products/bo-hoa-sen-xo-muop.jpg',
  '/assets/aistudio/IMG_2898_f42f6d60.JPG': '/images/products/bo-hoa-vang-kem.jpg',
  '/assets/aistudio/IMG_2899_dccf280d.JPG': '/images/products/bo-hoa-hong-trang-kem.jpg',
  '/assets/aistudio/IMG_2900_81911ce2.JPG': '/images/products/bo-hoa-cuc-la-xanh.jpg',
  '/assets/aistudio/IMG_2901_380e5ba6.JPG': '/images/products/bo-hoa-dang-cao.jpg',
  '/assets/aistudio/IMG_2913_642fa159.JPG': '/images/gallery/ong-cam-but-bookmark.jpg',
};
export const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), 'langxanh-data')
  : path.resolve(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

export function ensureWritableDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function openSqliteDatabase(): DatabaseType.Database {
  ensureWritableDirs();
  const Database = require('better-sqlite3') as typeof DatabaseType;
  const dbPath = path.join(DATA_DIR, 'langxanh.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      group_code TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      display_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT NOT NULL DEFAULT '',
      category_id INTEGER NOT NULL,
      short_description TEXT NOT NULL DEFAULT '',
      full_description TEXT NOT NULL DEFAULT '',
      highlights TEXT NOT NULL DEFAULT '',
      price INTEGER,
      specifications TEXT NOT NULL DEFAULT '',
      material TEXT NOT NULL DEFAULT '',
      availability TEXT NOT NULL DEFAULT 'contact',
      featured INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      cover_image TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      alt_text TEXT NOT NULL DEFAULT '',
      caption TEXT NOT NULL DEFAULT '',
      display_order INTEGER NOT NULL DEFAULT 0,
      is_cover INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gallery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      album TEXT NOT NULL,
      title TEXT NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      published_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_published INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS process_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      step_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      caption TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      cta_label TEXT NOT NULL DEFAULT '',
      cta_link TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  seedSqliteIfEmpty(db);
  migrateLegacyImagePaths(db);
  return db;
}

export function getOrCreateSqliteSessionSecret(db: DatabaseType.Database): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  if (IS_VERCEL) {
    const base = process.env.ADMIN_PASSWORD || 'LangXanh@2026';
    return crypto
      .createHash('sha256')
      .update(`${base}::langxanh_vercel_session_key`)
      .digest('hex');
  }
  const row = db
    .prepare('SELECT value FROM site_settings WHERE key = ?')
    .get('__session_secret') as { value: string } | undefined;
  if (row?.value) {
    return row.value;
  }
  const secret = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)').run(
    '__session_secret',
    secret,
  );
  return secret;
}

function seedSqliteIfEmpty(db: DatabaseType.Database) {
  const adminCount = (
    db.prepare('SELECT COUNT(*) as c FROM admin_users').get() as { c: number }
  ).c;

  if (adminCount === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'LangXanh@2026';
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(
      'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
    ).run(username, hash);
  }

  const catCount = (
    db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number }
  ).c;

  if (catCount === 0) {
    const insertCat = db.prepare(
      'INSERT INTO categories (name, slug, group_code, description, display_order) VALUES (?, ?, ?, ?, ?)',
    );
    for (const c of SEED_CATEGORIES) {
      insertCat.run(c.name, c.slug, c.group_code, c.description, c.display_order);
    }
  }

  const prodCount = (
    db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number }
  ).c;

  if (prodCount === 0) {
    const cats = db
      .prepare('SELECT id, slug FROM categories')
      .all() as Array<{ id: number; slug: string }>;
    const catMap = new Map(cats.map((c) => [c.slug, c.id]));

    const insertProd = db.prepare(`
      INSERT INTO products (
        name, slug, sku, category_id, short_description, full_description,
        highlights, price, specifications, material, availability,
        featured, is_active, display_order, cover_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertImg = db.prepare(`
      INSERT INTO product_images (
        product_id, image_url, alt_text, caption, display_order, is_cover
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const p of SEED_PRODUCTS) {
      const catId = (p.category_slug && catMap.get(p.category_slug)) || p.category_id || 1;
      const info = insertProd.run(
        p.name,
        p.slug,
        p.sku,
        catId,
        p.short_description,
        p.full_description,
        p.highlights,
        p.price,
        p.specifications,
        p.material,
        p.availability,
        p.featured,
        p.is_active,
        p.display_order,
        p.cover_image,
      );
      const productId = Number(info.lastInsertRowid);
      p.images.forEach((img, idx) => {
        insertImg.run(
          productId,
          img.image_url,
          img.alt_text || `${p.name} - ${img.caption}`,
          img.caption,
          idx + 1,
          img.is_cover ? 1 : 0,
        );
      });
    }
  }

  const galleryCount = (
    db.prepare('SELECT COUNT(*) as c FROM gallery_items').get() as { c: number }
  ).c;

  if (galleryCount === 0) {
    const insertGal = db.prepare(
      'INSERT INTO gallery_items (album, title, caption, image_url, display_order) VALUES (?, ?, ?, ?, ?)',
    );
    SEED_GALLERY.forEach((item, i) => {
      insertGal.run(
        item.album,
        item.title,
        item.caption,
        item.image_url,
        item.display_order || i + 1,
      );
    });
  }

  const processCount = (
    db.prepare('SELECT COUNT(*) as c FROM process_steps').get() as { c: number }
  ).c;

  if (processCount === 0) {
    const insertStep = db.prepare(
      'INSERT INTO process_steps (step_number, title, description, image_url, caption) VALUES (?, ?, ?, ?, ?)',
    );
    for (const s of SEED_PROCESS_STEPS) {
      insertStep.run(s.step_number, s.title, s.description, s.image_url, s.caption);
    }
  }

  const articleCount = (
    db.prepare('SELECT COUNT(*) as c FROM articles').get() as { c: number }
  ).c;

  if (articleCount === 0) {
    const insertArt = db.prepare(
      'INSERT INTO articles (title, slug, summary, content, cover_image, published_at, is_published) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    for (const a of SEED_ARTICLES) {
      insertArt.run(
        a.title,
        a.slug,
        a.summary,
        a.content,
        a.cover_image,
        a.published_at,
        a.is_published,
      );
    }
  }

  const bannerCount = (
    db.prepare('SELECT COUNT(*) as c FROM banners').get() as { c: number }
  ).c;

  if (bannerCount === 0) {
    const insertBan = db.prepare(
      'INSERT INTO banners (key, title, subtitle, image_url, cta_label, cta_link, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    for (const b of SEED_BANNERS) {
      insertBan.run(
        b.key,
        b.title,
        b.subtitle,
        b.image_url,
        b.cta_label,
        b.cta_link,
        b.is_active,
      );
    }
  }

  const settingsRow = db
    .prepare('SELECT value FROM site_settings WHERE key = ?')
    .get('site_settings') as { value: string } | undefined;

  if (!settingsRow) {
    db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)').run(
      'site_settings',
      JSON.stringify(SEED_SITE_SETTINGS),
    );
  }

  const workshopRow = db
    .prepare('SELECT value FROM site_settings WHERE key = ?')
    .get('workshop_info') as { value: string } | undefined;

  if (!workshopRow) {
    db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)').run(
      'workshop_info',
      JSON.stringify(SEED_WORKSHOP_INFO),
    );
  }
}

function migrateLegacyImagePaths(db: DatabaseType.Database) {
  const tx = db.transaction(() => {
    const updProductCover = db.prepare(
      'UPDATE products SET cover_image = ? WHERE cover_image = ?',
    );
    const updProductImg = db.prepare(
      'UPDATE product_images SET image_url = ? WHERE image_url = ?',
    );
    const updGallery = db.prepare(
      'UPDATE gallery_items SET image_url = ? WHERE image_url = ?',
    );
    const updArticle = db.prepare(
      'UPDATE articles SET cover_image = ? WHERE cover_image = ?',
    );
    const updProcess = db.prepare(
      'UPDATE process_steps SET image_url = ? WHERE image_url = ?',
    );
    const updBanner = db.prepare(
      'UPDATE banners SET image_url = ? WHERE image_url = ?',
    );

    for (const [legacy, next] of Object.entries(LEGACY_IMAGE_MAP)) {
      updProductCover.run(next, legacy);
      updProductImg.run(next, legacy);
      updGallery.run(next, legacy);
      updArticle.run(next, legacy);
      updProcess.run(next, legacy);
      updBanner.run(next, legacy);
    }

    const workshopRow = db
      .prepare('SELECT value FROM site_settings WHERE key = ?')
      .get('workshop_info') as { value: string } | undefined;

    if (
      workshopRow?.value &&
      (workshopRow.value.includes('/assets/aistudio/') ||
        workshopRow.value.includes('/images/products/tranh-hoa-dao-lang-son.jpg'))
    ) {
      let updatedJson = workshopRow.value;
      for (const [legacy, next] of Object.entries(LEGACY_IMAGE_MAP)) {
        updatedJson = updatedJson.split(legacy).join(next);
      }
      db.prepare('UPDATE site_settings SET value = ? WHERE key = ?').run(
        updatedJson,
        'workshop_info',
      );
    }
  });
  tx();
}
