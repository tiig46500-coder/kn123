import express, { type NextFunction, type Request, type Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import type { Product, SiteSettings, WorkshopInfo } from '../src/types/domain';
import { IS_VERCEL, store, UPLOADS_DIR } from './store';

const COOKIE_NAME = 'lx_admin_session';

export type UploadStorageMode = 'cloudinary' | 'supabase' | 'local' | 'ephemeral';

export function getUploadStorageMode(): UploadStorageMode {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    return 'cloudinary';
  }
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return 'supabase';
  }
  if (IS_VERCEL) {
    return 'ephemeral';
  }
  return 'local';
}

async function uploadToCloudinary(file: Express.Multer.File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const folder = (process.env.CLOUDINARY_FOLDER || 'langxanh').replace(/^\/+|\/+$/g, '');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signPayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signPayload).digest('hex');

  const form = new FormData();
  const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
  form.append('file', blob, file.originalname || 'upload.jpg');
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    { method: 'POST', body: form },
  );
  const payload = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Cloudinary không thể lưu tệp ảnh.');
  }
  return payload.secure_url;
}

async function uploadToSupabase(file: Express.Multer.File): Promise<string> {
  const baseUrl = process.env.SUPABASE_URL!.replace(/\/+$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'langxanh-media';
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const safeBase = path
    .basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 32);
  const objectPath = `uploads/${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeBase || 'img'}${ext}`;

  const response = await fetch(
    `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': file.mimetype,
        'x-upsert': 'false',
      },
      body: new Uint8Array(file.buffer),
    },
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Supabase Storage lỗi tải lên (${response.status}): ${errText}`);
  }

  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath}`;
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = decodeURIComponent(part.slice(idx + 1).trim());
      out[k] = v;
    }
  }
  return out;
}

function signSession(username: string, secret: string): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const payload = Buffer.from(JSON.stringify({ username, exp })).toString('base64url');
  const sig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifySession(token: string | undefined, secret: string): { username: string } | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      username: string;
      exp: number;
    };
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    return { username: parsed.username };
  } catch {
    return null;
  }
}

interface AuthedRequest extends Request {
  adminUser?: { username: string };
}

export function createApiApp(): express.Express {
  store.init();
  const sessionSecret = store.getSessionSecret();

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '6mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  const requireAdmin = (req: AuthedRequest, res: Response, next: NextFunction) => {
    const cookies = parseCookies(req.headers.cookie);
    const session = verifySession(cookies[COOKIE_NAME], sessionSecret);
    if (!session) {
      res.status(401).json({ error: 'Vui lòng đăng nhập quản trị viên.' });
      return;
    }
    req.adminUser = session;
    next();
  };

  const storageMode = getUploadStorageMode();

  // Multer configuration: disk locally when using local storage, memory for cloud/ephemeral
  const storage =
    storageMode !== 'local'
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
          filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
            const base = path
              .basename(file.originalname, ext)
              .replace(/[^a-zA-Z0-9_-]/g, '-')
              .slice(0, 32);
            const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
            cb(null, `${base || 'img'}-${unique}${ext}`);
          },
        });

  const upload = multer({
    storage,
    limits: {
      fileSize: IS_VERCEL ? Math.floor(3.5 * 1024 * 1024) : 5 * 1024 * 1024,
      files: 15,
    },
    fileFilter: (_req, file, cb) => {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.mimetype)) {
        cb(new Error('Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP hoặc GIF.'));
        return;
      }
      cb(null, true);
    },
  });

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, vercel: IS_VERCEL, storageMode });
  });

  // Public Bootstrap API
  app.get('/api/bootstrap', (_req, res) => {
    res.json(store.getPublicBootstrap());
  });

  app.get('/api/products/:slug', (req, res) => {
    const prod = store.getPublicProductBySlug(req.params.slug);
    if (!prod) {
      res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
      return;
    }
    res.json(prod);
  });

  // Admin Auth
  app.get('/api/admin/me', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const session = verifySession(cookies[COOKIE_NAME], sessionSecret);
    if (!session) {
      res.json({ authenticated: false, storageMode });
      return;
    }
    res.json({ authenticated: true, username: session.username, storageMode });
  });

  app.post('/api/admin/login', (req, res) => {
    const { username, password } = (req.body ?? {}) as {
      username?: string;
      password?: string;
    };
    if (!username || !password) {
      res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' });
      return;
    }

    const user = store.getAdminUser(username);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác.' });
      return;
    }

    const token = signSession(user.username, sessionSecret);
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({ authenticated: true, username: user.username, storageMode });
  });

  app.post('/api/admin/logout', (req, res) => {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.clearCookie(COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps,
    });
    res.json({ ok: true });
  });

  app.post('/api/admin/change-password', requireAdmin, (req: AuthedRequest, res) => {
    const { currentPassword, newPassword } = (req.body ?? {}) as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    const user = store.getAdminUser(req.adminUser!.username);
    if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      res.status(400).json({ error: 'Mật khẩu hiện tại không đúng.' });
      return;
    }

    const nextHash = bcrypt.hashSync(newPassword, 10);
    store.updateAdminPassword(user.username, nextHash);
    res.json({ ok: true });
  });

  // Admin Overview & Data
  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    res.json(store.getAdminOverview());
  });

  // Multi-image Upload Endpoint
  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    upload.array('images', 15)(req, res, async (err: unknown) => {
      if (err) {
        const msg =
          err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
            ? IS_VERCEL
              ? 'Ảnh vượt quá giới hạn 3.5MB trên môi trường Vercel.'
              : 'Ảnh vượt quá dung lượng cho phép (tối đa 5MB mỗi ảnh).'
            : err instanceof Error
              ? err.message
              : 'Không thể tải ảnh lên. Vui lòng thử lại.';
        res.status(400).json({ error: msg });
        return;
      }

      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      if (files.length === 0) {
        res.status(400).json({ error: 'Chưa có tệp ảnh nào được chọn.' });
        return;
      }

      if (storageMode === 'cloudinary') {
        try {
          const urls = await Promise.all(files.map((f) => uploadToCloudinary(f)));
          res.json({ urls, durableStorage: 'cloudinary' });
        } catch (upErr) {
          res.status(502).json({
            error:
              upErr instanceof Error
                ? upErr.message
                : 'Không thể tải ảnh lên Cloudinary.',
          });
        }
        return;
      }

      if (storageMode === 'supabase') {
        try {
          const urls = await Promise.all(files.map((f) => uploadToSupabase(f)));
          res.json({ urls, durableStorage: 'supabase' });
        } catch (upErr) {
          res.status(502).json({
            error:
              upErr instanceof Error
                ? upErr.message
                : 'Không thể tải ảnh lên Supabase Storage.',
          });
        }
        return;
      }

      if (storageMode === 'ephemeral') {
        const totalBytes = files.reduce((sum, f) => sum + (f.buffer?.length ?? 0), 0);
        if (totalBytes > 4 * 1024 * 1024) {
          res.status(400).json({
            error:
              'Tổng dung lượng ảnh trong một lần tải vượt quá 4MB cho phép của Vercel. Vui lòng chọn ít ảnh hơn hoặc cấu hình Cloudinary / Supabase Storage.',
          });
          return;
        }
        const urls = files.map(
          (f) => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`,
        );
        res.json({ urls, durableStorage: 'ephemeral' });
        return;
      }

      const urls = files.map((f) => `/uploads/${f.filename}`);
      res.json({ urls, durableStorage: 'local' });
    });
  });

  // Admin Product CRUD
  app.post('/api/admin/products', requireAdmin, (req, res) => {
    const body = (req.body ?? {}) as {
      name?: string;
      slug?: string;
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
      images?: Array<{
        image_url: string;
        alt_text?: string;
        caption?: string;
        display_order?: number;
        is_cover?: number;
      }>;
    };

    if (!body.name || !body.name.trim() || !body.category_id) {
      res.status(400).json({ error: 'Vui lòng nhập tên sản phẩm và danh mục.' });
      return;
    }

    const result = store.createProduct({
      ...body,
      name: body.name,
      category_id: Number(body.category_id),
    });
    res.status(201).json(result);
  });

  app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const updated = store.updateProduct(id, req.body ?? {});
    if (!updated) {
      res.status(404).json({ error: 'Sản phẩm không tồn tại.' });
      return;
    }
    res.json({ ok: true });
  });

  app.put('/api/admin/products/:id/images', requireAdmin, (req, res) => {
    const productId = Number(req.params.id);
    const { images } = (req.body ?? {}) as {
      images?: Array<{
        image_url: string;
        alt_text?: string;
        caption?: string;
        display_order?: number;
        is_cover?: number;
      }>;
    };
    if (!Array.isArray(images)) {
      res.status(400).json({ error: 'Danh sách ảnh không hợp lệ.' });
      return;
    }
    const result = store.replaceProductImages(productId, images);
    if (!result) {
      res.status(404).json({ error: 'Sản phẩm không tồn tại.' });
      return;
    }
    res.json({ ok: true, cover_image: result.cover_image });
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    store.deleteProduct(Number(req.params.id));
    res.json({ ok: true });
  });

  // Admin Categories
  app.post('/api/admin/categories', requireAdmin, (req, res) => {
    const { name, group_code, description, display_order } = (req.body ?? {}) as {
      name?: string;
      group_code?: string;
      description?: string;
      display_order?: number;
    };
    if (!name?.trim()) {
      res.status(400).json({ error: 'Vui lòng nhập tên danh mục.' });
      return;
    }
    const result = store.createCategory({ name, group_code, description, display_order });
    res.status(201).json(result);
  });

  app.put('/api/admin/categories/:id', requireAdmin, (req, res) => {
    store.updateCategory(Number(req.params.id), req.body ?? {});
    res.json({ ok: true });
  });

  // Admin Gallery
  app.post('/api/admin/gallery', requireAdmin, (req, res) => {
    const { album, title, caption, image_url } = (req.body ?? {}) as {
      album?: string;
      title?: string;
      caption?: string;
      image_url?: string;
    };
    if (!album || !title || !image_url) {
      res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin ảnh thư viện.' });
      return;
    }
    const result = store.createGalleryItem({ album, title, caption, image_url });
    res.status(201).json(result);
  });

  app.delete('/api/admin/gallery/:id', requireAdmin, (req, res) => {
    store.deleteGalleryItem(Number(req.params.id));
    res.json({ ok: true });
  });

  // Admin Articles
  app.post('/api/admin/articles', requireAdmin, (req, res) => {
    const { title, summary, content, cover_image, published_at, is_published } =
      (req.body ?? {}) as {
        title?: string;
        summary?: string;
        content?: string;
        cover_image?: string;
        published_at?: string;
        is_published?: number;
      };
    if (!title?.trim()) {
      res.status(400).json({ error: 'Vui lòng nhập tiêu đề bài viết.' });
      return;
    }
    const result = store.createArticle({
      title,
      summary,
      content,
      cover_image,
      published_at,
      is_published,
    });
    res.status(201).json(result);
  });

  app.put('/api/admin/articles/:id', requireAdmin, (req, res) => {
    store.updateArticle(Number(req.params.id), req.body ?? {});
    res.json({ ok: true });
  });

  app.delete('/api/admin/articles/:id', requireAdmin, (req, res) => {
    store.deleteArticle(Number(req.params.id));
    res.json({ ok: true });
  });

  // Admin Process Steps
  app.put('/api/admin/process/:id', requireAdmin, (req, res) => {
    store.updateProcessStep(Number(req.params.id), req.body ?? {});
    res.json({ ok: true });
  });

  // Admin Banners
  app.put('/api/admin/banners/:id', requireAdmin, (req, res) => {
    store.updateBanner(Number(req.params.id), req.body ?? {});
    res.json({ ok: true });
  });

  // Admin Settings & Workshop
  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    store.saveSettings(req.body as SiteSettings);
    res.json({ ok: true });
  });

  app.put('/api/admin/workshop', requireAdmin, (req, res) => {
    store.saveWorkshop(req.body as WorkshopInfo);
    res.json({ ok: true });
  });

  // JSON error safety net for API routes
  app.use('/api', (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message =
      err instanceof Error ? err.message : 'Lỗi máy chủ nội bộ. Vui lòng thử lại.';
    res.status(500).json({ error: message });
  });

  return app;
}
