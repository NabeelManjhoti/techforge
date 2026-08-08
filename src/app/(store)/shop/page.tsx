import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { FilterBar } from "@/components/filter-bar";
import { getCategories, getProducts } from "@/lib/products";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "The Catalog",
  description: "Browse the full TECHFORGE catalog — filtered by category, budget and rank.",
};

const VALID_SORTS = new Set(["featured", "rating", "price-asc", "price-desc"]);

export default async function ShopPage({
  searchParams,
}: PageProps<"/shop">) {
  const params = await searchParams;
  const categories = await getCategories();

  const q = typeof params.q === "string" ? params.q : "";
  const sortRaw = typeof params.sort === "string" ? params.sort : "featured";
  const sort: "featured" | "rating" | "price-asc" | "price-desc" =
    VALID_SORTS.has(sortRaw) ? (sortRaw as "featured" | "rating" | "price-asc" | "price-desc") : "featured";
  const maxRaw = typeof params.max === "string" ? Number(params.max) : NaN;
  const max = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : undefined;
  const categorySlug = typeof params.category === "string" ? params.category : "";
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  const products = await getProducts({
    q: q || undefined,
    sort,
    max,
    category: activeCategory?.id,
  });

  const chipHref = (slug: string) => {
    const sp = new URLSearchParams();
    if (slug) sp.set("category", slug);
    if (q) sp.set("q", q);
    if (sort !== "featured") sp.set("sort", sort);
    if (max) sp.set("max", String(max));
    const s = sp.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  const activeName = activeCategory?.name ?? "All gear";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-neon">
        <span aria-hidden="true">▸</span>
        Shop / Catalog
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {activeName}
      </h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Every listing ships with real specs, honest stock, and prices you can
        actually scan. Filter by category, budget and rank.
      </p>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Filter by category">
        <Link
          href={chipHref("")}
          className={cn(
            "border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors",
            !activeCategory
              ? "border-neon bg-neon/10 text-neon"
              : "border-line text-muted hover:border-neon/50 hover:text-ink"
          )}
        >
          All gear
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={chipHref(c.slug)}
            className={cn(
              "border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors",
              activeCategory?.id === c.id
                ? "border-neon bg-neon/10 text-neon"
                : "border-line text-muted hover:border-neon/50 hover:text-ink"
            )}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      <div className="mt-6 border-t border-line pt-6">
        <FilterBar key={q} q={q} sort={sort} max={max ? String(max) : ""} category={categorySlug} total={products.length} />
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-line py-24 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
            No units matched
          </p>
          <p className="max-w-sm text-sm text-muted">
            {activeCategory
              ? `Nothing in "${activeCategory.name}" matched those filters.`
              : "No gear matched those filters."}
            Try widening the budget or clearing the search.
          </p>
          <Link
            href="/shop"
            className="bg-neon px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-bg transition-shadow hover:shadow-[0_0_20px_rgba(34,225,255,0.4)]"
          >
            Reset filters
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
