import Link from "next/link";
import { Star } from "lucide-react";
import { HudFrame } from "@/components/hud-frame";
import { ProductImage } from "@/components/product-image";
import { AddToCart } from "@/components/add-to-cart";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const discount =
    product.compareAtUsd && product.compareAtUsd > product.priceUsd
      ? Math.round((1 - product.priceUsd / product.compareAtUsd) * 100)
      : 0;

  const specStrip = product.specs
    .slice(0, 3)
    .map((s) => s.value)
    .join(" · ");

  return (
    <HudFrame className="group flex h-full flex-col overflow-hidden border border-line bg-surface transition-colors duration-300 hover:border-neon/60">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-elevated"
      >
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          priority={priority}
          className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,11,18,0) 40%, rgba(7,11,18,0.65) 100%), linear-gradient(135deg, rgba(34,225,255,0.18) 0%, rgba(255,46,136,0.12) 100%)",
          }}
        />
        {product.featured && (
          <span className="absolute left-3 top-3 border border-neon/60 bg-bg/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon">
            Featured
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 border border-magenta/60 bg-bg/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-magenta">
            −{discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold text-ink transition-colors group-hover:text-neon">
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted">{product.tagline}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 font-mono text-xs text-neon">
            <Star className="h-3 w-3 fill-neon text-neon" aria-hidden="true" />
            {product.rating.toFixed(1)}
          </div>
        </div>

        <p
          className="truncate font-mono text-[11px] uppercase tracking-wider text-muted"
          title={specStrip}
        >
          {specStrip}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="font-mono">
            <span className={cn("text-lg font-bold text-ink")}>
              {formatUsd(product.priceUsd)}
            </span>
            {product.compareAtUsd && (
              <span className="ml-2 text-xs text-muted line-through">
                {formatUsd(product.compareAtUsd)}
              </span>
            )}
          </div>
          <AddToCart product={product} size="sm" />
        </div>
      </div>
    </HudFrame>
  );
}
