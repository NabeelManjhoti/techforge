import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { AddToCart } from "@/components/add-to-cart";
import { SectionHeader } from "@/components/section-header";
import { getCategories, getProductBySlug, getProducts } from "@/lib/products";
import { formatUsd } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} — ${product.tagline}` : "Product",
    description: product?.description,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categories = await getCategories();
  const category = categories.find((c) => c.id === product.categoryId);

  const allInCategory = await getProducts({ category: product.categoryId });
  const related = allInCategory.filter((p) => p.id !== product.id).slice(0, 4);

  const discount =
    product.compareAtUsd && product.compareAtUsd > product.priceUsd
      ? Math.round((1 - product.priceUsd / product.compareAtUsd) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <nav className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-neon">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/shop" className="transition-colors hover:text-neon">Shop</Link>
        {category && (
          <>
            <span aria-hidden="true">/</span>
            <Link href={`/shop?category=${category.slug}`} className="transition-colors hover:text-neon">
              {category.name}
            </Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <div className="flex items-center gap-3">
            {product.featured && (
              <span className="border border-neon/60 bg-neon/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon">
                Featured
              </span>
            )}
            {discount > 0 && (
              <span className="border border-magenta/60 bg-magenta/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-magenta">
                Save {discount}%
              </span>
            )}
          </div>

          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-wider text-muted">
            {product.tagline}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono text-sm text-neon">
              <Star className="h-4 w-4 fill-neon text-neon" aria-hidden="true" />
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted">
              {product.reviews} verified reviews
            </span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <span className="font-mono text-3xl font-bold text-ink">
              {formatUsd(product.priceUsd)}
            </span>
            {product.compareAtUsd && (
              <span className="pb-1 font-mono text-base text-muted line-through">
                {formatUsd(product.compareAtUsd)}
              </span>
            )}
            <span
              className={`mb-1 ml-auto font-mono text-xs uppercase tracking-widest ${
                product.stock > 0 ? "text-neon" : "text-magenta"
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted">{product.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AddToCart product={product} size="lg" />
            <Link
              href="/checkout"
              className="border border-line px-6 py-3.5 font-mono text-sm uppercase tracking-widest text-ink transition-colors hover:border-neon/60 hover:text-neon"
            >
              Buy now
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, label: "Free US shipping" },
              { icon: RefreshCw, label: "45-day returns" },
              { icon: ShieldCheck, label: "2-year warranty" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 border border-line bg-surface px-3 py-2.5">
                <item.icon className="h-4 w-4 shrink-0 text-neon" aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 border border-line bg-surface">
            <h2 className="border-b border-line px-5 py-3 font-mono text-xs uppercase tracking-[0.25em] text-neon">
              Technical specs
            </h2>
            <dl className="divide-y divide-line">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex items-center justify-between gap-4 px-5 py-3">
                  <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">
                    {spec.label}
                  </dt>
                  <dd className="text-right font-mono text-sm text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-14">
          <SectionHeader
            eyebrow="Same system"
            title={`More ${category?.name ?? "gear"}`}
            linkHref={`/shop?category=${category?.slug ?? ""}`}
            linkLabel="View category"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
