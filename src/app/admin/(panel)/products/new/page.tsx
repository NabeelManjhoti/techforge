import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createProduct } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/product-form";
import { Panel } from "@/components/admin/ui";

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon">
          Catalog control
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          New product
        </h1>
      </header>

      <Panel title="New unit">
        <ProductForm
          action={createProduct}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          submitLabel="Create product"
        />
      </Panel>
    </div>
  );
}
