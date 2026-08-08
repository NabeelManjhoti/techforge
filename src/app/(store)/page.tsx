import type { Metadata } from "next";
import { RefreshCw, ShieldCheck, Truck, Zap } from "lucide-react";
import { FeaturedHero } from "@/components/featured-hero";
import { ProductCard } from "@/components/product-card";
import { CategoryTile } from "@/components/category-tile";
import { SectionHeader } from "@/components/section-header";
import { HudFrame } from "@/components/hud-frame";
import { getCategories, getFeaturedProducts, getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Premium Tech Gadgets — Spec-First Catalog",
  description:
    "Premium tech gadgets with an obsessive spec-first catalog. Headphones, keyboards, drones, wearables and more — engineered, not merchandised.",
};

const VALUE_PROPS = [
  {
    icon: Truck,
    title: "Free US shipping",
    body: "Free expedited shipping on every order over $75.",
  },
  {
    icon: ShieldCheck,
    title: "45-day returns",
    body: "No-questions returns. If it's not your build, send it back.",
  },
  {
    icon: Zap,
    title: "Spec-first",
    body: "Every listing ships with real specs, not marketing fluff.",
  },
  {
    icon: RefreshCw,
    title: "2-year warranty",
    body: "Coverage on every unit, no registration gymnastics.",
  },
];

export default async function HomePage() {
  const [categories, featured, all] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getProducts({ sort: "rating" }),
  ]);

  const newDrops = all.filter((p) => !p.featured).slice(0, 8);

  return (
    <>
      <FeaturedHero products={featured} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader
          eyebrow="Browse the catalog"
          title="Eight systems, one store"
          linkHref="/shop"
          linkLabel="View all gear"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <CategoryTile key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeader
            eyebrow="Hand-picked"
            title="Featured systems"
            linkHref="/shop?sort=featured"
            linkLabel="See all featured"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 3} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader
          eyebrow="Fresh drops"
          title="Newly stocked"
          linkHref="/shop?sort=price-desc"
          linkLabel="Browse everything"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {newDrops.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeader eyebrow="The fine print" title="Why TECHFORGE" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((prop) => (
              <HudFrame
                key={prop.title}
                className="border border-line bg-surface p-6 transition-colors hover:border-neon/50"
              >
                <prop.icon className="h-6 w-6 text-neon" aria-hidden="true" />
                <h3 className="mt-4 font-display text-base font-semibold text-ink">
                  {prop.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{prop.body}</p>
              </HudFrame>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
