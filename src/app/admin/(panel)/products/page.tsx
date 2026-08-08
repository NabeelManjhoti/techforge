import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatUsd } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Panel, btnPrimary } from "@/components/admin/ui";

export default async function AdminProductsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon">
            Catalog control
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Products
          </h1>
        </div>
        <Link href="/admin/products/new" className={btnPrimary}>
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New product
          </span>
        </Link>
      </header>

      <Panel title={`${products.length} units in the catalog`}>
        {products.length === 0 ? (
          <p className="text-sm text-muted">
            The catalog is empty. Add your first product to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] uppercase tracking-widest text-muted">
                  <th className="pb-3 pr-4 font-medium">Unit</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Price</th>
                  <th className="pb-3 pr-4 font-medium">Stock</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((p) => (
                  <tr key={p.id} className="align-middle">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden border border-line bg-elevated">
                          {p.images[0] ? (
                            <ProductImage
                              src={p.images[0]}
                              alt={p.name}
                              className="h-full w-full"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-ink">{p.name}</p>
                          <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted">
                            /{p.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-[11px] uppercase tracking-wider text-muted">
                      {p.category.name}
                    </td>
                    <td className="py-3 pr-4 font-mono text-sm text-ink">
                      {formatUsd(p.priceUsd.toNumber())}
                    </td>
                    <td className="py-3 pr-4 font-mono text-sm text-ink">{p.stock}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`w-fit border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                            p.featured
                              ? "border-neon/60 bg-neon/10 text-neon"
                              : "border-line text-muted"
                          }`}
                        >
                          {p.featured ? "Featured" : "Standard"}
                        </span>
                        <span
                          className={`w-fit border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                            p.stock === 0
                              ? "border-magenta/60 bg-magenta/10 text-magenta"
                              : "border-line text-muted"
                          }`}
                        >
                          {p.stock === 0 ? "Out" : "In stock"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-ink transition-colors hover:border-neon/60 hover:text-neon"
                        >
                          <Pencil className="h-3 w-3" aria-hidden="true" />
                          Edit
                        </Link>
                        <DeleteProductButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
