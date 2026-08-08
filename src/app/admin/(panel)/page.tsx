import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Panel } from "@/components/admin/ui";
import { formatUsd } from "@/lib/format";

type OrderRow = {
  id: string;
  status: string;
  paymentMethod: string;
  totalUsd: { toNumber: () => number };
  createdAt: Date;
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const [productCount, orderCount, lowStock, paidOrders, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.product.count({ where: { stock: { lt: 5 } } }),
      prisma.order.findMany({ where: { status: "paid" } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    ]);

  const revenue = paidOrders.reduce(
    (sum, o) => sum + (o as OrderRow).totalUsd.toNumber(),
    0
  );

  const stats = [
    { label: "Products", value: String(productCount), href: "/admin/products" },
    { label: "Orders", value: String(orderCount), href: "/admin/products" },
    { label: "Low stock (<5)", value: String(lowStock), href: "/admin/products" },
    { label: "Revenue (paid)", value: formatUsd(revenue), href: "/admin/products" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon">
          Control console
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="corners relative border border-line bg-surface p-4 transition-colors hover:border-neon/50"
          >
            <span className="corner-tr" aria-hidden="true" />
            <span className="corner-bl" aria-hidden="true" />
            <span className="corner-br" aria-hidden="true" />
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
              {s.label}
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-neon">{s.value}</p>
          </Link>
        ))}
      </div>

      <Panel title="Recent orders">
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted">
            No orders yet. Complete a card or COD checkout and orders will land
            here.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {recentOrders.map((order) => {
              const o = order as unknown as OrderRow;
              return (
                <li key={o.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-ink">
                      {o.id.slice(0, 13)}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      {o.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {o.paymentMethod === "cod" && (
                      <span className="border border-amber-500/60 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-300">
                        COD
                      </span>
                    )}
                    <span
                      className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        o.status === "paid"
                          ? "border-neon/60 bg-neon/10 text-neon"
                          : "border-line text-muted"
                      }`}
                    >
                      {o.status}
                    </span>
                    <span className="font-mono text-sm text-ink">
                      {formatUsd(o.totalUsd.toNumber())}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
