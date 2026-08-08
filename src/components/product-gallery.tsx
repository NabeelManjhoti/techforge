"use client";

import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/cn";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="corners relative aspect-[4/3] overflow-hidden border border-line bg-elevated">
        <span className="corner-tr" aria-hidden="true" />
        <span className="corner-bl" aria-hidden="true" />
        <span className="corner-br" aria-hidden="true" />
        <ProductImage
          src={images[active]}
          alt={`${name} — view ${active + 1}`}
          className="h-full w-full"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(34,225,255,0.10), rgba(255,46,136,0.06), transparent 55%)",
            mixBlendMode: "screen",
          }}
          aria-hidden="true"
        />
        <span className="absolute right-3 top-3 border border-line bg-bg/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted">
          {active + 1}/{images.length}
        </span>
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3" role="tablist" aria-label="Product views">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Show ${name} view ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "aspect-[4/3] overflow-hidden border transition-all",
                active === i
                  ? "border-neon shadow-[0_0_16px_rgba(34,225,255,0.25)]"
                  : "border-line opacity-60 hover:opacity-100"
              )}
            >
              <ProductImage src={src} alt={`${name} thumbnail ${i + 1}`} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
