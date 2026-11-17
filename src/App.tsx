/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import type { BootstrapData, Product } from './types/domain';
import { getPublicSeedBootstrap } from './data/seedData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutStoryPage } from './pages/AboutStoryPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProcessPage } from './pages/ProcessPage';
import { WorkshopPage } from './pages/WorkshopPage';
import { GalleryPage } from './pages/GalleryPage';
import { NewsPage } from './pages/NewsPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

function normalizePath(rawPath: string): string {
  const clean = rawPath.split('?')[0].split('#')[0] || '/';
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean;
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname),
  );
  const [data, setData] = useState<BootstrapData>(() => getPublicSeedBootstrap());
  const [directProduct, setDirectProduct] = useState<Product | null>(null);

  const loadBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const payload = (await res.json()) as BootstrapData;
      if (
        payload &&
        Array.isArray(payload.categories) &&
        Array.isArray(payload.products)
      ) {
        setData(payload);
      }
    } catch {
      // Static-only or offline fallback remains active via getPublicSeedBootstrap()
    }
  }, []);

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((targetPath: string) => {
    const normalized = normalizePath(targetPath);
    if (normalized !== normalizePath(window.location.pathname)) {
      window.history.pushState({}, '', normalized);
    }
    setCurrentPath(normalized);
    window.scrollTo({ top: 0 });
  }, []);

  // Support direct link to /san-pham/:slug if not yet matched or refreshed
  useEffect(() => {
    if (!currentPath.startsWith('/san-pham/')) {
      setDirectProduct(null);
      return;
    }
    const slug = currentPath.slice('/san-pham/'.length);
    if (!slug) return;
    const found = data.products.find((p) => p.slug === slug);
    if (found) {
      setDirectProduct(found);
      return;
    }
    fetch(`/api/products/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return null;
        return (await res.json()) as Product;
      })
      .then((prod) => {
        if (prod) setDirectProduct(prod);
      })
      .catch(() => {
        // fallback handled by ProductDetailPage not-found state
      });
  }, [currentPath, data]);

  // Keep document title synchronized with active route
  useEffect(() => {
    const base = 'LẠNG XANH – Khởi nguồn giá trị kinh tế xanh từ xơ mướp';
    if (currentPath === '/') {
      document.title = base;
    } else if (currentPath === '/gioi-thieu' || currentPath === '/cau-chuyen') {
      document.title = `Về Lạng Xanh | ${base}`;
    } else if (currentPath === '/san-pham') {
      document.title = `Sản phẩm | Lạng Xanh`;
    } else if (currentPath.startsWith('/danh-muc/')) {
      const slug = currentPath.slice('/danh-muc/'.length);
      const cat = data.categories.find((c) => c.slug === slug);
      document.title = cat ? `${cat.name} | Lạng Xanh` : `Danh mục | Lạng Xanh`;
    } else if (currentPath.startsWith('/san-pham/')) {
      const slug = currentPath.slice('/san-pham/'.length);
      const prod =
        data.products.find((p) => p.slug === slug) ?? directProduct ?? undefined;
      document.title = prod ? `${prod.name} | Lạng Xanh` : `Chi tiết sản phẩm | Lạng Xanh`;
    } else if (currentPath === '/quy-trinh') {
      document.title = `Quy trình chế tác | Lạng Xanh`;
    } else if (currentPath === '/tram-xanh') {
      document.title = `Trạm Xanh Xứ Lạng | Lạng Xanh`;
    } else if (currentPath === '/thu-vien') {
      document.title = `Thư viện hình ảnh | Lạng Xanh`;
    } else if (currentPath === '/tin-tuc') {
      document.title = `Tin tức & Hoạt động | Lạng Xanh`;
    } else if (currentPath === '/lien-he') {
      document.title = `Liên hệ | Lạng Xanh`;
    } else if (currentPath.startsWith('/admin')) {
      document.title = `Quản trị | Lạng Xanh`;
    }
  }, [currentPath, data, directProduct]);

  const categories = data.categories;
  const products = data.products;
  const gallery = data.gallery;
  const articles = data.articles;
  const processSteps = data.processSteps;
  const banners = data.banners;
  const settings = data.settings;
  const workshop = data.workshop;

  const renderPage = () => {

    if (currentPath === '/') {
      return (
        <HomePage
          products={products}
          gallery={gallery}
          processSteps={processSteps}
          banners={banners}
          settings={settings}
          workshop={workshop}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/gioi-thieu' || currentPath === '/cau-chuyen') {
      return <AboutStoryPage settings={settings} onNavigate={navigate} />;
    }

    if (currentPath === '/san-pham') {
      return (
        <ProductsPage
          categories={categories}
          products={products}
          settings={settings}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath.startsWith('/danh-muc/')) {
      const catSlug = currentPath.slice('/danh-muc/'.length);
      return (
        <ProductsPage
          categories={categories}
          products={products}
          initialCategorySlug={catSlug || 'all'}
          settings={settings}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath.startsWith('/san-pham/')) {
      const prodSlug = currentPath.slice('/san-pham/'.length);
      const matched =
        products.find((p) => p.slug === prodSlug) ?? directProduct ?? undefined;
      return (
        <ProductDetailPage
          product={matched}
          allProducts={products}
          settings={settings}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/quy-trinh') {
      return <ProcessPage steps={processSteps} onNavigate={navigate} />;
    }

    if (currentPath === '/tram-xanh') {
      return <WorkshopPage workshop={workshop} settings={settings} />;
    }

    if (currentPath === '/thu-vien') {
      return <GalleryPage items={gallery} />;
    }

    if (currentPath === '/tin-tuc') {
      return <NewsPage articles={articles} />;
    }

    if (currentPath === '/lien-he') {
      return <ContactPage settings={settings} />;
    }

    if (currentPath === '/admin' || currentPath === '/admin/login') {
      return (
        <AdminPage
          onNavigate={navigate}
          onPublicRefresh={loadBootstrap}
        />
      );
    }

    return (
      <HomePage
        products={products}
        gallery={gallery}
        processSteps={processSteps}
        banners={banners}
        settings={settings}
        workshop={workshop}
        onNavigate={navigate}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EA] text-[#1E2E23] selection:bg-[#244B35] selection:text-[#F7F4EA]">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        facebookUrl={settings?.facebook_url}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer
        categories={categories}
        settings={settings}
        onNavigate={navigate}
      />
    </div>
  );
}
