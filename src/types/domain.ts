export interface Category {
  id: number;
  name: string;
  slug: string;
  group_code: string;
  description: string;
  display_order: number;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string;
  caption: string;
  display_order: number;
  is_cover: number; // 1 or 0
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  short_description: string;
  full_description: string;
  highlights: string;
  price: number | null;
  specifications: string;
  material: string;
  availability: 'in_stock' | 'contact' | 'out_of_stock';
  featured: number; // 1 or 0
  is_active: number; // 1 or 0
  display_order: number;
  cover_image: string;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: number;
  album: string;
  title: string;
  caption: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image: string;
  published_at: string;
  is_published: number;
}

export interface ProcessStep {
  id: number;
  step_number: number;
  title: string;
  description: string;
  image_url: string;
  caption: string;
}

export interface Banner {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_label: string;
  cta_link: string;
  is_active: number;
}

export interface WorkshopInfo {
  title: string;
  subtitle: string;
  intro: string;
  activities: string[];
  educational_benefits: string[];
  schedule_note: string;
  hero_image: string;
  gallery_images: string[];
}

export interface SiteSettings {
  brand_name: string;
  full_title: string;
  primary_tagline: string;
  secondary_tagline: string;
  facebook_url: string;
  tiktok_handle: string;
  school_unit: string;
  intro_headline: string;
  intro_body: string;
  story_headline: string;
  story_body: string;
}

export type SortOption = 'newest' | 'name-asc' | 'price-asc' | 'price-desc';

export interface BootstrapData {
  categories: Category[];
  products: Product[];
  gallery: GalleryItem[];
  articles: Article[];
  processSteps: ProcessStep[];
  banners: Banner[];
  settings: SiteSettings | null;
  workshop: WorkshopInfo | null;
}

