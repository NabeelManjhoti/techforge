import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { mapProduct } from "@/lib/products";
import { updateProduct } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/product-form";
import { Panel } from "@/components/admin/ui";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon">
          Catalog control
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          Edit · {product.name}
        </h1>
      </header>

      <Panel title="Update unit">
        <ProductForm
          action={updateProduct}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          product={mapProduct(product)}
          submitLabel="Save changes"
        />
      </Panel>
    </div>
  );
}
