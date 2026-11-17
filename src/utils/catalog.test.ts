import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildFacebookOrderMessage,
  filterAndSortProducts,
  formatPriceVND,
  getRelatedProducts,
  isProductPubliclyVisible,
  normalizeVietnamese,
  reorderArray,
  resolveOrderedImages,
  slugifyVietnamese,
  wrapGalleryIndex,
} from './catalog';
import { getFullSeedBootstrap, getPublicSeedBootstrap } from '../data/seedData';
import type { Product } from '../types/domain';

const makeProduct = (overrides: Partial<Product>): Product => ({
  id: 1,
  name: 'Túi xách xơ mướp',
  slug: 'tui-xach-xo-muop',
  sku: 'LX-01',
  category_id: 2,
  category_name: 'Thời trang',
  category_slug: 'thoi-trang',
  short_description: 'Thiết kế sáng tạo từ chất liệu tự nhiên.',
  full_description: 'Mô tả chi tiết.',
  highlights: 'Thủ công tỉ mỉ',
  price: 180000,
  specifications: '30x25 cm',
  material: 'Xơ mướp tự nhiên',
  availability: 'in_stock',
  featured: 1,
  is_active: 1,
  display_order: 1,
  cover_image: '/images/products/tui-tote-gau-vit.jpg',
  images: [],
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-10T00:00:00Z',
  ...overrides,
});

test('normalizeVietnamese and slugifyVietnamese handle diacritics cleanly', () => {
  assert.equal(normalizeVietnamese('Đèn Trang Trí Xơ Mướp'), 'den trang tri xo muop');
  assert.equal(slugifyVietnamese('Miếng rửa chén bát xơ mướp!'), 'mieng-rua-chen-bat-xo-muop');
});

test('isProductPubliclyVisible hides inactive or imageless products', () => {
  assert.equal(isProductPubliclyVisible(makeProduct({ is_active: 0 })), false);
  assert.equal(
    isProductPubliclyVisible(makeProduct({ cover_image: '', images: [] })),
    false,
  );
  assert.equal(
    isProductPubliclyVisible(makeProduct({ short_description: '   ' })),
    false,
  );
  assert.equal(isProductPubliclyVisible(makeProduct({})), true);
});

test('filterAndSortProducts searches accent-insensitively and sorts by price', () => {
  const products = [
    makeProduct({ id: 1, name: 'Túi xách xơ mướp', price: 220000, category_slug: 'thoi-trang' }),
    makeProduct({ id: 2, name: 'Miếng rửa chén bát', price: 25000, category_slug: 'gia-dung' }),
    makeProduct({ id: 3, name: 'Đèn trang trí', price: null, category_slug: 'trang-tri' }),
  ];

  const searchRes = filterAndSortProducts(products, { query: 'tui xach' });
  assert.equal(searchRes.length, 1);
  assert.equal(searchRes[0].id, 1);

  const ascRes = filterAndSortProducts(products, { sort: 'price-asc' });
  assert.deepEqual(
    ascRes.map((p) => p.id),
    [2, 1, 3],
  );

  const descRes = filterAndSortProducts(products, { sort: 'price-desc' });
  assert.deepEqual(
    descRes.map((p) => p.id),
    [1, 2, 3],
  );
});

test('resolveOrderedImages puts cover image first and respects display_order', () => {
  const product = makeProduct({
    images: [
      {
        id: 11,
        product_id: 1,
        image_url: '/img-2.jpg',
        alt_text: '2',
        caption: '2',
        display_order: 2,
        is_cover: 0,
      },
      {
        id: 12,
        product_id: 1,
        image_url: '/img-1.jpg',
        alt_text: '1',
        caption: '1',
        display_order: 3,
        is_cover: 1,
      },
      {
        id: 13,
        product_id: 1,
        image_url: '/img-3.jpg',
        alt_text: '3',
        caption: '3',
        display_order: 1,
        is_cover: 0,
      },
    ],
  });

  const ordered = resolveOrderedImages(product);
  assert.deepEqual(
    ordered.map((i) => i.id),
    [12, 13, 11],
  );
});

test('wrapGalleryIndex and reorderArray behave deterministically', () => {
  assert.equal(wrapGalleryIndex(0, -1, 5), 4);
  assert.equal(wrapGalleryIndex(4, 1, 5), 0);
  assert.deepEqual(reorderArray(['a', 'b', 'c'], 0, 2), ['b', 'c', 'a']);
});

test('getRelatedProducts prefers same category and excludes current product', () => {
  const current = makeProduct({ id: 1, category_id: 2 });
  const list = [
    current,
    makeProduct({ id: 2, category_id: 2, name: 'Quạt' }),
    makeProduct({ id: 3, category_id: 1, name: 'Bông tắm' }),
    makeProduct({ id: 4, category_id: 2, name: 'Dép' }),
    makeProduct({ id: 5, category_id: 3, name: 'Đèn' }),
    makeProduct({ id: 6, category_id: 4, name: 'Set quà' }),
  ];

  const related = getRelatedProducts(current, list, 4);
  assert.equal(related.length, 4);
  assert.equal(related[0].category_id, 2);
  assert.equal(related[1].category_id, 2);
  assert.ok(!related.some((p) => p.id === 1));
});

test('formatPriceVND and buildFacebookOrderMessage format accurately', () => {
  assert.equal(formatPriceVND(null), 'Liên hệ tư vấn');
  assert.ok(formatPriceVND(150000).includes('150.000'));
  assert.equal(
    buildFacebookOrderMessage('Đèn trang trí xơ mướp'),
    'Xin chào Lạng Xanh, tôi muốn tìm hiểu và đặt mua sản phẩm Đèn trang trí xơ mướp.',
  );
});

test('client seed bootstrap provides complete public fallback and excludes banned assets', () => {
  const pub = getPublicSeedBootstrap();
  const full = getFullSeedBootstrap();

  assert.equal(pub.categories.length, 4);
  assert.equal(pub.products.length, 14);
  assert.equal(full.products.length, 17);
  assert.ok(pub.products.every((p) => isProductPubliclyVisible(p)));
  assert.ok(pub.products.every((p) => p.images.length >= 1));
  assert.equal(pub.gallery.length, 24);
  assert.equal(pub.processSteps.length, 7);
  assert.equal(pub.articles.length, 3);
  assert.equal(pub.banners.length, 2);
  assert.ok(pub.settings?.facebook_url.includes('facebook.com/share/1E3CsadTwa'));
  assert.ok(pub.workshop && pub.workshop.activities.length >= 4);

  const serialized = JSON.stringify(full);
  for (const excluded of [
    'IMG_2940',
    'IMG_2927',
    'IMG_2945',
    'IMG_2949',
    'IMG_2943',
    'tiktok-qr-lang-xanh',
    'aistudio',
  ]) {
    assert.equal(
      serialized.includes(excluded),
      false,
      `Seed data must not contain excluded image ${excluded}`,
    );
  }
});

test('all seed and component image references resolve to non-empty files inside public/images', () => {
  const full = getFullSeedBootstrap();
  const urls = new Set<string>();

  for (const prod of full.products) {
    if (prod.cover_image) urls.add(prod.cover_image);
    for (const img of prod.images) {
      urls.add(img.image_url);
    }
  }
  for (const g of full.gallery) urls.add(g.image_url);
  for (const s of full.processSteps) urls.add(s.image_url);
  for (const a of full.articles) urls.add(a.cover_image);
  for (const b of full.banners) urls.add(b.image_url);
  if (full.workshop?.hero_image) urls.add(full.workshop.hero_image);
  for (const wImg of full.workshop?.gallery_images ?? []) urls.add(wImg);

  // Also include branding and contact images referenced in components
  urls.add('/images/branding/logo-lang-xanh.jpg');
  urls.add('/images/branding/tiktok-qr-lang-xanh.jpg');

  const publicDir = path.resolve(process.cwd(), 'public');
  assert.ok(urls.size >= 35, `Expected at least 35 image references, got ${urls.size}`);

  for (const url of urls) {
    assert.ok(url.startsWith('/images/'), `Image URL must start with /images/: ${url}`);
    const fullPath = path.join(publicDir, url.slice(1));
    assert.ok(fs.existsSync(fullPath), `Missing image file on disk: ${fullPath}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 0, `Image file is empty: ${fullPath}`);
  }
});


