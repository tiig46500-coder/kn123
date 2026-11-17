import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  ImagePlus,
  Images,
  LayoutDashboard,
  Lock,
  LogOut,
  Package,
  Plus,
  Settings,
  Sparkles,
  Sprout,
  Star,
  Trash2,
  Workflow,
} from 'lucide-react';
import type {
  Article,
  Banner,
  Category,
  GalleryItem,
  ProcessStep,
  Product,
  SiteSettings,
  WorkshopInfo,
} from '../types/domain';
import { formatPriceVND, getCoverImageUrl } from '../utils/catalog';
import { AdminProductModal } from '../components/AdminProductModal';
import { SafeImage } from '../components/SafeImage';

interface AdminPageProps {
  onNavigate: (path: string) => void;
  onPublicRefresh: () => Promise<void>;
}

type AdminTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'galleries'
  | 'banners'
  | 'articles'
  | 'process'
  | 'workshop'
  | 'settings'
  | 'password';

const ALBUM_OPTIONS = [
  'Vùng nguyên liệu',
  'Sản phẩm gia dụng',
  'Sản phẩm thời trang',
  'Sản phẩm trang trí',
  'Quy trình chế tác',
  'Workshop',
  'Hoạt động nhóm',
];

async function safeParseJson<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function AdminPage({ onNavigate, onPublicRefresh }: AdminPageProps) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [storageMode, setStorageMode] = useState<'cloudinary' | 'supabase' | 'local' | 'ephemeral'>('local');

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [workshop, setWorkshop] = useState<WorkshopInfo | null>(null);

  const [prodSearch, setProdSearch] = useState('');
  const [prodCatFilter, setProdCatFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(
    undefined,
  ); // undefined = closed, null = new
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [toast, setToast] = useState('');

  // Quick Gallery Upload State
  const [galAlbum, setGalAlbum] = useState(ALBUM_OPTIONS[0]);
  const [galTitle, setGalTitle] = useState('');
  const [galCaption, setGalCaption] = useState('');
  const [galUploading, setGalUploading] = useState(false);

  // Article Form State
  const [artTitle, setArtTitle] = useState('');
  const [artSummary, setArtSummary] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artCover, setArtCover] = useState('/images/projects/gian-hang-lang-xanh.jpg');

  // Password Change State
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadAdminData = useCallback(async () => {
    const res = await fetch('/api/admin/overview');
    if (!res.ok) return;
    const data = await safeParseJson<{
      categories: Category[];
      products: Product[];
      gallery: GalleryItem[];
      articles: Article[];
      processSteps: ProcessStep[];
      banners: Banner[];
      settings: SiteSettings | null;
      workshop: WorkshopInfo | null;
    }>(res);
    if (!data) return;
    setCategories(data.categories);
    setProducts(data.products);
    setGallery(data.gallery);
    setArticles(data.articles);
    setProcessSteps(data.processSteps);
    setBanners(data.banners);
    setSettings(data.settings);
    setWorkshop(data.workshop);
  }, []);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(async (res) => {
        const d = await safeParseJson<{
          authenticated?: boolean;
          username?: string;
          storageMode?: 'cloudinary' | 'supabase' | 'local' | 'ephemeral';
        }>(res);
        if (d?.storageMode) {
          setStorageMode(d.storageMode);
        }
        if (res.ok && d?.authenticated) {
          setAuthenticated(true);
          setAdminUsername(d.username || '');
          await loadAdminData();
        }
      })
      .catch(() => {
        // API unavailable
      })
      .finally(() => setCheckingAuth(false));
  }, [loadAdminData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      const data = await safeParseJson<{
        authenticated?: boolean;
        username?: string;
        storageMode?: 'cloudinary' | 'supabase' | 'local' | 'ephemeral';
        error?: string;
      }>(res);
      if (!data) {
        setLoginError('Máy chủ API quản trị chưa sẵn sàng trên môi trường hiện tại.');
        return;
      }
      if (!res.ok) {
        setLoginError(data.error || 'Đăng nhập thất bại.');
        return;
      }
      if (data.storageMode) {
        setStorageMode(data.storageMode);
      }
      setAuthenticated(true);
      setAdminUsername(data.username || loginUser);
      setLoginPass('');
      await loadAdminData();
    } catch {
      setLoginError('Không thể kết nối máy chủ.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setAdminUsername('');
  };

  const refreshAll = async () => {
    await Promise.all([loadAdminData(), onPublicRefresh()]);
  };

  const toggleProductField = async (
    p: Product,
    field: 'is_active' | 'featured',
  ) => {
    const nextVal = p[field] ? 0 : 1;
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: nextVal }),
    });
    await refreshAll();
    notify('Đã cập nhật trạng thái sản phẩm.');
  };

  const handleDeleteProduct = async (p: Product) => {
    await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    await refreshAll();
    notify(`Đã xóa sản phẩm "${p.name}".`);
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!galTitle.trim()) {
      notify('Vui lòng nhập tiêu đề ảnh trước khi tải lên.');
      return;
    }
    setGalUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('images', f));
      const up = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const upData = await safeParseJson<{ urls?: string[]; error?: string }>(up);
      if (!up.ok) {
        notify(upData?.error || 'Tải ảnh lên thất bại.');
        return;
      }
      for (const url of upData?.urls ?? []) {
        await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            album: galAlbum,
            title: galTitle.trim(),
            caption: galCaption.trim(),
            image_url: url,
          }),
        });
      }
      setGalTitle('');
      setGalCaption('');
      await refreshAll();
      notify('Đã thêm ảnh vào thư viện.');
    } finally {
      setGalUploading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-sm text-[#4A5A4E]">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-[#244B35]/15 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/images/branding/logo-lang-xanh.jpg"
              alt="Lạng Xanh"
              className="w-14 h-14 rounded-full mx-auto object-cover border border-[#244B35]/15"
            />
            <h1 className="font-display text-3xl font-bold text-[#244B35]">
              Quản trị Lạng Xanh
            </h1>
            <p className="text-xs text-[#4A5A4E]">
              Đăng nhập tài khoản quản trị viên để cập nhật sản phẩm và kho ảnh.
            </p>
          </div>

          {loginError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs"
            >
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-username"
                className="block text-xs font-semibold text-[#244B35]"
              >
                Tên đăng nhập
              </label>
              <input
                id="admin-username"
                type="text"
                required
                autoComplete="username"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#244B35]"
              >
                Mật khẩu
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#244B35]/20 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loginBusy}
              className="w-full py-3 rounded-xl bg-[#244B35] text-[#F7F4EA] text-sm font-semibold hover:bg-[#1B3A29] transition-colors cursor-pointer"
            >
              {loginBusy ? 'Đang đăng nhập...' : 'Đăng nhập quản trị'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalImages = products.reduce(
    (sum, p) => sum + (p.images?.length ?? 0),
    0,
  );
  const activeCount = products.filter((p) => p.is_active === 1).length;

  const filteredProducts = products.filter((p) => {
    if (prodCatFilter !== 'all' && p.category_slug !== prodCatFilter) return false;
    if (
      prodSearch.trim() &&
      !p.name.toLowerCase().includes(prodSearch.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const MENU: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'products', label: 'Sản phẩm & Bộ ảnh', icon: Package },
    { id: 'categories', label: 'Danh mục', icon: FolderKanban },
    { id: 'galleries', label: 'Thư viện ảnh', icon: Images },
    { id: 'banners', label: 'Quản lý banner', icon: Sparkles },
    { id: 'articles', label: 'Bài viết', icon: FileText },
    { id: 'process', label: 'Quy trình', icon: Workflow },
    { id: 'workshop', label: 'Workshop', icon: Sprout },
    { id: 'settings', label: 'Cài đặt website', icon: Settings },
    { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#244B35] text-white text-sm font-medium shadow-lg"
        >
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Admin Sidebar */}
        <aside className="lg:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-[#244B35]/10 p-4 space-y-1">
            <div className="px-3 py-2 mb-2 border-b border-[#244B35]/10">
              <p className="text-xs text-[#63865A] font-medium">Quản trị viên</p>
              <p className="font-display text-xl font-bold text-[#244B35]">
                {adminUsername}
              </p>
            </div>

            {MENU.map((m) => {
              const Icon = m.icon;
              const active = activeTab === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveTab(m.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                    active
                      ? 'bg-[#244B35] text-[#F7F4EA]'
                      : 'text-[#1E2E23] hover:bg-[#F7F4EA]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{m.label}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50 transition-colors text-left mt-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Main Panel */}
        <div className="flex-1 min-w-0 space-y-6">
          {storageMode === 'ephemeral' && (
            <div
              role="note"
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed"
            >
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">
                  Lưu ý lưu trữ trên môi trường Vercel Serverless (chế độ tạm thời)
                </p>
                <p>
                  Toàn bộ dữ liệu công khai và bộ ảnh dự án trong mã nguồn luôn hiển thị ổn định trên Vercel. Tuy nhiên, các ảnh và chỉnh sửa mới tạo qua trang quản trị hiện chỉ lưu tạm trong phiên serverless; để lưu ảnh lâu dài khi vận hành thực tế, quản trị viên cần cấu hình biến môi trường Cloudinary hoặc Supabase Storage trên Vercel.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="font-display text-3xl font-bold text-[#244B35]">
                Tổng quan hệ thống Lạng Xanh
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#244B35]/10">
                  <p className="text-xs text-[#63865A] font-semibold">Sản phẩm công khai</p>
                  <p className="text-3xl font-bold text-[#244B35] mt-1 tabular-nums">
                    {activeCount} / {products.length}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#244B35]/10">
                  <p className="text-xs text-[#63865A] font-semibold">Ảnh sản phẩm</p>
                  <p className="text-3xl font-bold text-[#244B35] mt-1 tabular-nums">
                    {totalImages}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#244B35]/10">
                  <p className="text-xs text-[#63865A] font-semibold">Ảnh thư viện dự án</p>
                  <p className="text-3xl font-bold text-[#244B35] mt-1 tabular-nums">
                    {gallery.length}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#244B35]/10">
                  <p className="text-xs text-[#63865A] font-semibold">Bài viết hoạt động</p>
                  <p className="text-3xl font-bold text-[#244B35] mt-1 tabular-nums">
                    {articles.length}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#244B35]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#244B35]">
                    Thao tác nhanh
                  </h2>
                  <p className="text-sm text-[#4A5A4E]">
                    Thêm sản phẩm mới hoặc tải nhiều ảnh vào bộ sưu tập của từng sản phẩm.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('products');
                      setEditingProduct(null);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#244B35] text-white text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm sản phẩm mới</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/san-pham')}
                    className="px-4 py-2.5 rounded-lg border border-[#244B35]/25 text-[#244B35] text-xs font-semibold cursor-pointer"
                  >
                    Xem website công khai
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="font-display text-3xl font-bold text-[#244B35]">
                  Quản lý sản phẩm & Bộ ảnh
                </h1>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#244B35] text-[#F7F4EA] text-sm font-semibold hover:bg-[#1B3A29] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm sản phẩm</span>
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-[#244B35]/10 flex flex-col sm:flex-row gap-3">
                <input
                  type="search"
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  placeholder="Tìm theo tên sản phẩm..."
                  aria-label="Tìm sản phẩm trong quản trị"
                  className="flex-1 px-3.5 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                />
                <select
                  value={prodCatFilter}
                  onChange={(e) => setProdCatFilter(e.target.value)}
                  aria-label="Lọc danh mục trong quản trị"
                  className="px-3.5 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product List */}
              <div className="space-y-3">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-4 rounded-2xl border border-[#244B35]/10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#E9DFC9]/30">
                      <SafeImage
                        src={getCoverImageUrl(p)}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#63865A]">
                        <span>{p.category_name}</span>
                        <span>·</span>
                        <span className="tabular-nums">{p.images?.length ?? 0} ảnh</span>
                        <span>·</span>
                        <span>{p.is_active ? 'Đang hiển thị' : 'Bản nháp / Ẩn'}</span>
                      </div>
                      <h2 className="font-display text-xl font-bold text-[#1E2E23]">
                        {p.name}
                      </h2>
                      <p className="text-xs font-semibold text-[#244B35] tabular-nums">
                        {formatPriceVND(p.price)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleProductField(p, 'featured')}
                        title="Nổi bật trên trang chủ"
                        aria-label={`Đánh dấu nổi bật ${p.name}`}
                        className={`p-2 rounded-lg border text-xs cursor-pointer ${
                          p.featured
                            ? 'bg-[#244B35] text-white border-[#244B35]'
                            : 'border-[#244B35]/20 text-[#244B35]'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleProductField(p, 'is_active')}
                        title={p.is_active ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                        aria-label={p.is_active ? `Ẩn ${p.name}` : `Hiện ${p.name}`}
                        className="p-2 rounded-lg border border-[#244B35]/20 text-[#244B35] hover:bg-[#F7F4EA] cursor-pointer"
                      >
                        {p.is_active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-[#8A684B]" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigate(`/san-pham/${p.slug}`)}
                        className="px-3 py-2 rounded-lg border border-[#244B35]/20 text-xs font-semibold text-[#244B35] hover:bg-[#F7F4EA] cursor-pointer"
                      >
                        Xem trước
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingProduct(p)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#244B35] text-white text-xs font-semibold hover:bg-[#1B3A29] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa & Bộ ảnh</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDelete(p)}
                        aria-label={`Xóa ${p.name}`}
                        className="p-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-5">
              <h1 className="font-display text-3xl font-bold text-[#244B35]">
                Quản lý danh mục sản phẩm
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white p-5 rounded-2xl border border-[#244B35]/10 space-y-3"
                  >
                    <p className="text-xs font-semibold text-[#63865A]">
                      {cat.group_code} · /{cat.slug}
                    </p>
                    <input
                      type="text"
                      defaultValue={cat.name}
                      onBlur={async (e) => {
                        await fetch(`/api/admin/categories/${cat.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...cat, name: e.target.value }),
                        });
                        await refreshAll();
                        notify('Đã cập nhật danh mục.');
                      }}
                      aria-label={`Tên danh mục ${cat.name}`}
                      className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 font-display text-xl font-bold text-[#244B35]"
                    />
                    <textarea
                      rows={2}
                      defaultValue={cat.description}
                      onBlur={async (e) => {
                        await fetch(`/api/admin/categories/${cat.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...cat, description: e.target.value }),
                        });
                        await refreshAll();
                        notify('Đã cập nhật mô tả danh mục.');
                      }}
                      aria-label={`Mô tả danh mục ${cat.name}`}
                      className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-xs text-[#4A5A4E]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'galleries' && (
            <div className="space-y-6">
              <h1 className="font-display text-3xl font-bold text-[#244B35]">
                Thư viện hình ảnh dự án
              </h1>

              <div className="bg-white p-5 rounded-2xl border border-[#244B35]/10 space-y-4">
                <h2 className="font-display text-xl font-bold text-[#244B35]">
                  Thêm ảnh mới vào album
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={galAlbum}
                    onChange={(e) => setGalAlbum(e.target.value)}
                    aria-label="Chọn album thư viện"
                    className="px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                  >
                    {ALBUM_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={galTitle}
                    onChange={(e) => setGalTitle(e.target.value)}
                    placeholder="Tiêu đề ảnh..."
                    className="px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                  />
                  <input
                    type="text"
                    value={galCaption}
                    onChange={(e) => setGalCaption(e.target.value)}
                    placeholder="Chú thích (không bắt buộc)..."
                    className="px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                  />
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#244B35] text-white text-xs font-semibold cursor-pointer">
                  <ImagePlus className="w-4 h-4" />
                  <span>{galUploading ? 'Đang tải...' : 'Chọn ảnh tải lên kho'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleGalleryUpload(e.target.files)}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((g) => (
                  <div
                    key={g.id}
                    className="bg-white rounded-xl border border-[#244B35]/10 overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <SafeImage
                        src={g.image_url}
                        alt={g.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                      <div>
                        <p className="text-[11px] text-[#63865A]">{g.album}</p>
                        <p className="text-xs font-semibold text-[#1E2E23] line-clamp-1">
                          {g.title}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch(`/api/admin/gallery/${g.id}`, {
                            method: 'DELETE',
                          });
                          await refreshAll();
                          notify('Đã xóa ảnh khỏi thư viện.');
                        }}
                        className="text-xs text-red-700 hover:underline text-left cursor-pointer"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="space-y-5">
              <h1 className="font-display text-3xl font-bold text-[#244B35]">
                Quản lý banner trang chủ
              </h1>
              <div className="space-y-4">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white p-5 rounded-2xl border border-[#244B35]/10 grid grid-cols-1 md:grid-cols-12 gap-5 items-center"
                  >
                    <div className="md:col-span-4 aspect-[16/9] rounded-xl overflow-hidden">
                      <SafeImage
                        src={b.image_url}
                        alt={b.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="md:col-span-8 space-y-3">
                      <p className="text-xs font-semibold text-[#63865A]">{b.key}</p>
                      <input
                        type="text"
                        defaultValue={b.title}
                        onBlur={async (e) => {
                          await fetch(`/api/admin/banners/${b.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...b, title: e.target.value }),
                          });
                          await refreshAll();
                          notify('Đã lưu tiêu đề banner.');
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm font-semibold"
                      />
                      <input
                        type="text"
                        defaultValue={b.subtitle}
                        onBlur={async (e) => {
                          await fetch(`/api/admin/banners/${b.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...b, subtitle: e.target.value }),
                          });
                          await refreshAll();
                          notify('Đã lưu phụ đề banner.');
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                      />
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#244B35]/25 text-xs font-semibold text-[#244B35] cursor-pointer">
                        <ImagePlus className="w-4 h-4" />
                        <span>Đổi ảnh banner</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0) return;
                            const fd = new FormData();
                            fd.append('images', files[0]);
                            const up = await fetch('/api/admin/upload', {
                              method: 'POST',
                              body: fd,
                            });
                            const d = (await up.json()) as { urls?: string[] };
                            if (d.urls?.[0]) {
                              await fetch(`/api/admin/banners/${b.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...b, image_url: d.urls[0] }),
                              });
                              await refreshAll();
                              notify('Đã cập nhật ảnh banner.');
                            }
                          }}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="space-y-6">
              <h1 className="font-display text-3xl font-bold text-[#244B35]">
                Quản lý bài viết & Hoạt động
              </h1>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!artTitle.trim()) return;
                  await fetch('/api/admin/articles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: artTitle,
                      summary: artSummary,
                      content: artContent,
                      cover_image: artCover,
                    }),
                  });
                  setArtTitle('');
                  setArtSummary('');
                  setArtContent('');
                  await refreshAll();
                  notify('Đã đăng bài viết mới.');
                }}
                className="bg-white p-5 rounded-2xl border border-[#244B35]/10 space-y-3"
              >
                <h2 className="font-display text-xl font-bold text-[#244B35]">
                  Đăng bài viết mới
                </h2>
                <input
                  type="text"
                  required
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  placeholder="Tiêu đề bài viết..."
                  className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                />
                <input
                  type="text"
                  value={artSummary}
                  onChange={(e) => setArtSummary(e.target.value)}
                  placeholder="Tóm tắt ngắn..."
                  className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                />
                <textarea
                  rows={4}
                  value={artContent}
                  onChange={(e) => setArtContent(e.target.value)}
                  placeholder="Nội dung chi tiết..."
                  className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <input
                    type="text"
                    value={artCover}
                    onChange={(e) => setArtCover(e.target.value)}
                    placeholder="Đường dẫn ảnh bìa"
                    className="flex-1 px-3 py-2 rounded-lg border border-[#244B35]/20 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#244B35] text-white text-xs font-semibold cursor-pointer"
                  >
                    Đăng bài viết
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {articles.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white p-4 rounded-2xl border border-[#244B35]/10 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs text-[#63865A] tabular-nums">
                        {a.published_at}
                      </p>
                      <h3 className="font-display text-lg font-bold text-[#1E2E23]">
                        {a.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/admin/articles/${a.id}`, {
                          method: 'DELETE',
                        });
                        await refreshAll();
                        notify('Đã xóa bài viết.');
                      }}
                      className="text-xs text-red-700 hover:underline cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'process' && (
            <div className="space-y-5">
              <h1 className="font-display text-3xl font-bold text-[#244B35]">
                Quản lý quy trình chế tác
              </h1>
              <div className="space-y-4">
                {processSteps.map((st) => (
                  <div
                    key={st.id}
                    className="bg-white p-5 rounded-2xl border border-[#244B35]/10 space-y-3"
                  >
                    <p className="text-xs font-semibold text-[#8A684B] tabular-nums">
                      Bước 0{st.step_number}
                    </p>
                    <input
                      type="text"
                      defaultValue={st.title}
                      onBlur={async (e) => {
                        await fetch(`/api/admin/process/${st.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...st, title: e.target.value }),
                        });
                        await refreshAll();
                        notify('Đã cập nhật bước quy trình.');
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm font-semibold"
                    />
                    <textarea
                      rows={2}
                      defaultValue={st.description}
                      onBlur={async (e) => {
                        await fetch(`/api/admin/process/${st.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...st, description: e.target.value }),
                        });
                        await refreshAll();
                        notify('Đã cập nhật mô tả quy trình.');
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-xs text-[#4A5A4E]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'workshop' && workshop && (
            <div className="space-y-5">
              <h1 className="font-display text-3xl font-bold text-[#244B35]">
                Quản lý Trạm Xanh Xứ Lạng & Workshop
              </h1>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await fetch('/api/admin/workshop', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(workshop),
                  });
                  await refreshAll();
                  notify('Đã lưu thông tin Workshop.');
                }}
                className="bg-white p-6 rounded-2xl border border-[#244B35]/10 space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#244B35]">Tiêu đề</label>
                  <input
                    type="text"
                    value={workshop.title}
                    onChange={(e) =>
                      setWorkshop({ ...workshop, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#244B35]">Giới thiệu</label>
                  <textarea
                    rows={3}
                    value={workshop.intro}
                    onChange={(e) =>
                      setWorkshop({ ...workshop, intro: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#244B35]">
                    Ghi chú đăng ký
                  </label>
                  <textarea
                    rows={2}
                    value={workshop.schedule_note}
                    onChange={(e) =>
                      setWorkshop({ ...workshop, schedule_note: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#244B35] text-white text-xs font-semibold cursor-pointer"
                >
                  Lưu thông tin Workshop
                </button>
              </form>
            </div>
          )}

          {activeTab === 'settings' && settings && (
            <div className="space-y-5">
              <h1 className="font-display text-3xl font-bold text-[#244B35]">
                Cài đặt website
              </h1>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await fetch('/api/admin/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settings),
                  });
                  await refreshAll();
                  notify('Đã cập nhật cài đặt website.');
                }}
                className="bg-white p-6 rounded-2xl border border-[#244B35]/10 space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#244B35]">
                    Thông điệp chính
                  </label>
                  <input
                    type="text"
                    value={settings.primary_tagline}
                    onChange={(e) =>
                      setSettings({ ...settings, primary_tagline: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#244B35]">
                    Liên kết Facebook chính thức
                  </label>
                  <input
                    type="url"
                    value={settings.facebook_url}
                    onChange={(e) =>
                      setSettings({ ...settings, facebook_url: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#244B35]">
                    Đơn vị thực hiện
                  </label>
                  <input
                    type="text"
                    value={settings.school_unit}
                    onChange={(e) =>
                      setSettings({ ...settings, school_unit: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#244B35]">
                    Giới thiệu dự án trang chủ
                  </label>
                  <textarea
                    rows={3}
                    value={settings.intro_body}
                    onChange={(e) =>
                      setSettings({ ...settings, intro_body: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#244B35] text-white text-xs font-semibold cursor-pointer"
                >
                  Lưu cài đặt
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-5 max-w-md">
              <h1 className="font-display text-3xl font-bold text-[#244B35]">
                Đổi mật khẩu quản trị
              </h1>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPassMsg('');
                  setPassErr('');
                  const res = await fetch('/api/admin/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      currentPassword: currPass,
                      newPassword: newPass,
                    }),
                  });
                  const d = (await res.json()) as { error?: string };
                  if (!res.ok) {
                    setPassErr(d.error || 'Đổi mật khẩu thất bại.');
                    return;
                  }
                  setCurrPass('');
                  setNewPass('');
                  setPassMsg('Đã đổi mật khẩu thành công.');
                }}
                className="bg-white p-6 rounded-2xl border border-[#244B35]/10 space-y-4"
              >
                {passErr && (
                  <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg">
                    {passErr}
                  </p>
                )}
                {passMsg && (
                  <p className="text-xs text-[#244B35] bg-[#E9DFC9] p-2.5 rounded-lg">
                    {passMsg}
                  </p>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#244B35]">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    required
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#244B35]">
                    Mật khẩu mới (tối thiểu 6 ký tự)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#244B35]/20 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#244B35] text-white text-xs font-semibold cursor-pointer"
                >
                  Cập nhật mật khẩu
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Product & Multi-Image Editor Modal */}
      {editingProduct !== undefined && (
        <AdminProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(undefined)}
          onSaved={refreshAll}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xác nhận xóa sản phẩm"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h2 className="font-display text-2xl font-bold text-[#244B35]">
              Xác nhận xóa sản phẩm
            </h2>
            <p className="text-sm text-[#4A5A4E]">
              Bạn có chắc muốn xóa sản phẩm <strong>{confirmDelete.name}</strong>? Hệ
              thống sẽ giữ lại những ảnh đang được dùng ở thư viện hoặc mục khác.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg border border-[#244B35]/20 text-sm font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(confirmDelete)}
                className="px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-semibold hover:bg-red-800 cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
