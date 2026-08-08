"use client";

import { useCart } from "@/components/cart-provider";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";
import { useState } from "react";

export function AddToCart({
  product,
  size = "md",
  fullWidth = false,
  withDrawer = true,
}: {
  product: Product;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  withDrawer?: boolean;
}) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-sm",
  };

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={() => {
        addItem(product, 1);
        setAdded(true);
        if (withDrawer) openCart();
        window.setTimeout(() => setAdded(false), 1400);
      }}
      className={cn(
        "group/btn relative inline-flex items-center justify-center gap-2 rounded-none font-mono font-semibold uppercase tracking-widest",
        "bg-neon text-bg transition-all duration-200 hover:shadow-[0_0_24px_rgba(34,225,255,0.45)]",
        "disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:hover:shadow-none",
        sizes[size],
        fullWidth && "w-full"
      )}
    >
      <span aria-hidden="true">{outOfStock ? "▮▮" : added ? "✓" : "+"}</span>
      {outOfStock ? "Out of stock" : added ? "Added" : "Add to cart"}
    </button>
  );
}
