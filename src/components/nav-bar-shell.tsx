"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";

const MARQUEE_ITEMS = [
  "FREE US SHIPPING OVER $75",
  "45-DAY NO-QUESTIONS RETURNS",
  "SPEC-FIRST CATALOG",
  "2-YEAR WARRANTY ON ALL GEAR",
  "BUILT FOR THE DEMO, READY FOR PRODUCTION",
];

export function NavBarShell({ categories }: { categories: Category[] }) {
  const { count, openCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
    setMenuOpen(false);
  };

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40">
      <div className="overflow-hidden border-b border-line bg-bg/90 py-1.5 backdrop-blur">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-8">
              <span>{item}</span>
              <span className="text-neon">◆</span>
            </span>
          ))}
        </div>
      </div>

      <div className="border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center text-ink lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="TECHFORGE home">
            <span className="grid h-8 w-8 place-items-center border border-neon bg-neon/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="6" y="8" width="12" height="10" rx="1.5" stroke="#22e1ff" strokeWidth="1.5" />
                <path d="M10 8V6.5A1.5 1.5 0 0 1 11.5 5h1A1.5 1.5 0 0 1 14 6.5V8M9.5 12h5M9.5 15h3" stroke="#22e1ff" strokeWidth="1.5" />
              </svg>
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              TECH<span className="text-neon">FORGE</span>
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Categories">
            <Link
              href="/shop"
              className={cn(
                "px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors",
                isActive("/shop") ? "text-neon" : "text-muted hover:text-ink"
              )}
            >
              All gear
            </Link>
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <form
              onSubmit={submitSearch}
              className="hidden items-center gap-2 border border-line bg-surface px-3 focus-within:border-neon/60 sm:flex"
              role="search"
            >
              <Search className="h-4 w-4 text-muted" aria-hidden="true" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search gear…"
                aria-label="Search products"
                className="w-36 bg-transparent py-2 text-sm text-ink placeholder:text-muted focus:outline-none lg:w-48"
              />
            </form>

            <button
              type="button"
              onClick={openCart}
              className="relative grid h-9 w-9 place-items-center border border-line text-ink transition-colors hover:border-neon/60 hover:text-neon"
              aria-label={`Open cart, ${count} items`}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center bg-magenta px-1 font-mono text-[10px] font-bold text-bg">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line bg-surface px-4 py-4 lg:hidden">
            <form onSubmit={submitSearch} className="mb-4 flex items-center gap-2 border border-line bg-bg px-3">
              <Search className="h-4 w-4 text-muted" aria-hidden="true" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search gear…"
                aria-label="Search products"
                className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
              />
            </form>
            <nav className="flex flex-col gap-1" aria-label="Mobile categories">
              <Link
                href="/shop"
                onClick={() => setMenuOpen(false)}
                className="border-l-2 border-transparent px-3 py-2 font-mono text-sm uppercase tracking-widest text-ink hover:border-neon hover:text-neon"
              >
                All gear
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="border-l-2 border-transparent px-3 py-2 font-mono text-sm uppercase tracking-widest text-muted hover:border-neon hover:text-neon"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
