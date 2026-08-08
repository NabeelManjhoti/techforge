"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { AddToCart } from "@/components/add-to-cart";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

export function FeaturedHero({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const count = products.length;

  useEffect(() => {
    if (count < 2) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % count), 5200);
    return () => window.clearInterval(t);
  }, [count]);

  const product = products[index % count];
  const readouts = useMemo(
    () => (product ? product.specs.slice(0, 3).map((s) => s.value) : []),
    [product]
  );

  if (!product) return null;

  return (
    <section className="relative overflow-hidden border-b border-line bg-bg">
      <div className="bg-hud-grid absolute inset-0" aria-hidden="true" />
      <div
        className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-violet/20 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-neon/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-neon">
            <span aria-hidden="true">▸</span>
            Featured system
            <span aria-hidden="true" className="text-muted">
              {String(index + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
            </span>
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
                {product.name}
              </h1>
              <p className="mt-3 max-w-md font-mono text-sm uppercase tracking-wider text-muted">
                {product.tagline}
              </p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${product.id}-desc`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 max-w-lg"
            >
              <p className="text-sm leading-relaxed text-muted">{product.description}</p>

              <div className="mt-6 grid max-w-md grid-cols-1 gap-2 border border-line bg-surface/70 sm:grid-cols-3">
                {product.specs.slice(0, 3).map((spec) => (
                  <div key={spec.label} className="border-line px-3 py-2.5 sm:border-r last:border-r-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      {spec.label}
                    </p>
                    <p className="mt-1 truncate font-mono text-sm text-ink">{spec.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="font-mono text-2xl font-bold text-ink">
                  {formatUsd(product.priceUsd)}
                  {product.compareAtUsd && (
                    <span className="ml-3 text-sm font-normal text-muted line-through">
                      {formatUsd(product.compareAtUsd)}
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-neon">
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <AddToCart product={product} size="lg" />
                <Link
                  href={`/product/${product.slug}`}
                  className="border border-line px-6 py-3.5 font-mono text-sm uppercase tracking-widest text-ink transition-colors hover:border-neon/60 hover:text-neon"
                >
                  View specs
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative">
          <div className="corners relative aspect-square w-full max-w-[480px] overflow-hidden border border-line bg-surface/50 backdrop-blur-sm lg:ml-auto">
            <span className="corner-tr" aria-hidden="true" />
            <span className="corner-bl" aria-hidden="true" />
            <span className="corner-br" aria-hidden="true" />

            <div className="bg-hud-grid absolute inset-0 opacity-60" aria-hidden="true" />
            <div
              className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/10 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 animate-pulse-ring rounded-full border border-neon/25"
              aria-hidden="true"
            />
            <div
              className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 animate-[spin_24s_linear_infinite] rounded-full border border-dashed border-neon/20"
              aria-hidden="true"
            />

            <div className="absolute inset-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={product.id}
                  className="absolute inset-[12%]"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.03 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <ProductImage
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full animate-float object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-transparent via-neon/10 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, rgba(34,225,255,0.14), rgba(255,46,136,0.10), transparent 60%)",
                mixBlendMode: "screen",
              }}
              aria-hidden="true"
            />

            <div className="absolute left-4 top-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neon">
              <span className="h-2 w-2 animate-blink bg-neon" aria-hidden="true" />
              LIVE
            </div>
            <div className="absolute right-4 top-4 font-mono text-[10px] uppercase tracking-widest text-muted">
              {String(index + 1).padStart(2, "0")}
            </div>

            {readouts.map((value, i) => (
              <div
                key={`${product.id}-ro-${i}`}
                className={cn(
                  "absolute hidden font-mono text-[10px] uppercase tracking-widest text-neon sm:block",
                  "border border-neon/40 bg-bg/70 px-2 py-1 backdrop-blur-sm",
                  i === 0 && "left-3 top-1/3 animate-float",
                  i === 1 && "right-3 top-1/2 animate-float [animation-delay:1.2s]",
                  i === 2 && "bottom-12 left-6 animate-float [animation-delay:2.4s]"
                )}
              >
                {value}
              </div>
            ))}
          </div>

          {count > 1 && (
            <div className="mt-5 flex items-center gap-3">
              <div className="flex gap-2" role="tablist" aria-label="Featured products">
                {products.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Show ${p.name}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-1.5 transition-all duration-300",
                      i === index ? "w-8 bg-neon" : "w-4 bg-line hover:bg-muted"
                    )}
                  />
                ))}
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i - 1 + count) % count)}
                  className="grid h-8 w-8 place-items-center border border-line text-muted transition-colors hover:border-neon/60 hover:text-neon"
                  aria-label="Previous product"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i + 1) % count)}
                  className="grid h-8 w-8 place-items-center border border-line text-muted transition-colors hover:border-neon/60 hover:text-neon"
                  aria-label="Next product"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
