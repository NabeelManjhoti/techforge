import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, Plus, Store, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/products/new", label: "New product", icon: Plus },
  { href: "/", label: "View store", icon: Store },
];

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="bg-hud-grid min-h-screen">
      <header className="border-b border-line bg-surface/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/admin" className="font-display text-lg font-extrabold tracking-tight">
            TECHFORGE<span className="text-neon">/admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[11px] uppercase tracking-wider text-muted md:inline">
              {user.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted transition-colors hover:border-neon/60 hover:text-neon"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit lg:sticky lg:top-6">
          <nav className="flex flex-wrap gap-2 lg:flex-col" aria-label="Admin">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 border border-line bg-surface px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-neon/60 hover:text-neon"
              >
                <item.icon className="h-3.5 w-3.5 text-neon" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
