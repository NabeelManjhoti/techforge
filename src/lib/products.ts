import type { Category, Product, ShopFilters, SpecEntry } from "@/lib/types";
import { prisma } from "@/lib/db";
import type { ProductModel } from "@/generated/prisma/models";
export function mapProduct(p: ProductModel): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    priceUsd: p.priceUsd.toNumber(),
    compareAtUsd: p.compareAtUsd ? p.compareAtUsd.toNumber() : undefined,
    images: p.images,
    specs: (p.specs as unknown as SpecEntry[]) ?? [],
    categoryId: p.categoryId,
    stock: p.stock,
    featured: p.featured,
    rating: p.rating,
    reviews: p.reviews,
    tags: p.tags,
  };
}

function matchesFilters(p: Product, f: ShopFilters): boolean {
  if (f.category && p.categoryId !== f.category) return false;
  if (f.q) {
    const q = f.q.trim().toLowerCase();
    if (!q) return true;
    const haystack = [p.name, p.tagline, p.description, ...p.tags]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (f.min !== undefined && p.priceUsd < f.min) return false;
  if (f.max !== undefined && p.priceUsd > f.max) return false;
  return true;
}

function sortProducts(list: Product[], sort: ShopFilters["sort"]): Product[] {
  const arr = [...list];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.priceUsd - b.priceUsd);
    case "price-desc":
      return arr.sort((a, b) => b.priceUsd - a.priceUsd);
    case "rating":
      return arr.sort((a, b) => b.rating - a.rating);
    case "featured":
    default:
      return arr.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating
      );
  }
}

export async function getCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return rows as Category[];
}

export async function getProducts(filters: ShopFilters = {}): Promise<Product[]> {
  const rows = await prisma.product.findMany(
    filters.category ? { where: { categoryId: filters.category } } : undefined
  );
  const filtered = rows.map(mapProduct).filter((p) => matchesFilters(p, filters));
  return sortProducts(filtered, filters.sort);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({ where: { slug } });
  return row ? mapProduct(row) : undefined;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { rating: "desc" },
    take: 8,
  });
  return rows.map(mapProduct);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug);
}
