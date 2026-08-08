export type Category = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  icon: string;
};

export type SpecEntry = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  priceUsd: number;
  compareAtUsd?: number;
  images: string[];
  specs: SpecEntry[];
  categoryId: string;
  stock: number;
  featured: boolean;
  rating: number;
  reviews: number;
  tags: string[];
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceUsd: number;
  image: string;
  qty: number;
};

export type ShopFilters = {
  category?: string;
  q?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "rating";
  min?: number;
  max?: number;
};
