import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { getCategories } from "@/lib/products";

export async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
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
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Premium tech gadgets with an obsessive spec-first catalog.
              Engineered, not merchandised.
            </p>
            <NewsletterForm />
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-neon">Shop</h3>
            <ul className="mt-4 space-y-2.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-neon">Support</h3>
            <ul className="mt-4 space-y-2.5">
              {["Shipping", "Returns", "Warranty", "FAQ", "Contact"].map((item) => (
                <li key={item}>
                  <span className="cursor-not-allowed text-sm text-muted transition-colors hover:text-ink">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-neon">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {["About", "Careers", "Press", "Privacy", "Terms"].map((item) => (
                <li key={item}>
                  <span className="cursor-not-allowed text-sm text-muted transition-colors hover:text-ink">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 sm:flex-row">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
            © {new Date().getFullYear()} TECHFORGE — demo storefront
          </p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
            <span className="text-neon">STATUS:</span> LIVE · NEXT.JS + NEON + STRIPE ·{" "}
            <Link href="/admin" className="text-ink transition-colors hover:text-neon">
              ADMIN
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
