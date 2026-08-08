"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { ProductImage } from "@/components/product-image";
import { formatUsd } from "@/lib/format";

export function CartDrawer() {
  const { items, isOpen, closeCart, setQty, removeItem, subtotal, count } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            role="dialog"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-surface"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-lg font-bold tracking-tight">
                Cart <span className="font-mono text-sm text-muted">({count})</span>
              </h2>
              <button
                type="button"
                onClick={closeCart}
                className="grid h-9 w-9 place-items-center border border-line text-muted transition-colors hover:border-neon/60 hover:text-neon"
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="grid h-16 w-16 place-items-center border border-line text-muted">
                  <ShoppingBag className="h-7 w-7" aria-hidden="true" />
                </span>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  Cart buffer is empty
                </p>
                <p className="max-w-[240px] text-sm text-muted">
                  Nothing loaded yet. Add some gear to start your build.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-2 bg-neon px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-bg transition-shadow hover:shadow-[0_0_20px_rgba(34,225,255,0.4)]"
                >
                  Browse gear
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-4 py-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-line bg-elevated">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={closeCart}
                            className="truncate font-display text-sm font-semibold text-ink transition-colors hover:text-neon"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="text-muted transition-colors hover:text-magenta"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 font-mono text-xs text-muted">
                          {formatUsd(item.priceUsd)} / unit
                        </p>
                        <div className="mt-auto flex items-center gap-3">
                          <div className="flex items-center border border-line">
                            <button
                              type="button"
                              onClick={() => setQty(item.productId, item.qty - 1)}
                              className="grid h-7 w-7 place-items-center text-muted transition-colors hover:text-neon"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center font-mono text-xs" aria-live="polite">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(item.productId, item.qty + 1)}
                              className="grid h-7 w-7 place-items-center text-muted transition-colors hover:text-neon"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="ml-auto font-mono text-sm font-bold text-neon">
                            {formatUsd(item.priceUsd * item.qty)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-line px-5 py-4">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-xs uppercase tracking-widest text-muted">Subtotal</span>
                    <span className="text-lg font-bold text-ink">{formatUsd(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="mt-4 block w-full bg-neon py-3 text-center font-mono text-sm font-bold uppercase tracking-widest text-bg transition-shadow hover:shadow-[0_0_24px_rgba(34,225,255,0.45)]"
                  >
                    Checkout →
                  </Link>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="mt-2 block w-full py-2 text-center font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
                  >
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
