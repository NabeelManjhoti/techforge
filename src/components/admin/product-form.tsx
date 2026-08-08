"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus, X } from "lucide-react";
import type { Product, SpecEntry } from "@/lib/types";
import type { ActionState } from "@/app/admin/actions";
import { ProductImage } from "@/components/product-image";
import {
  Field,
  btnGhost,
  btnPrimary,
  inputClass,
  labelClass,
} from "@/components/admin/ui";

type CategoryOption = { id: string; name: string };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={btnPrimary}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Saving…
        </span>
      ) : (
        label
      )}
    </button>
  );
}

export function ProductForm({
  action,
  categories,
  product,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  categories: CategoryOption[];
  product?: Product;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    action,
    undefined
  );

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [imageUrls, setImageUrls] = useState("");
  const [specs, setSpecs] = useState<SpecEntry[]>(product?.specs ?? []);

  const updateSpec = (index: number, key: "label" | "value", value: string) =>
    setSpecs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [key]: value } : s))
    );
  const addSpec = () => setSpecs((prev) => [...prev, { label: "", value: "" }]);
  const removeSpec = (index: number) =>
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="specsJson" value={JSON.stringify(specs)} />
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />

      {state?.error && (
        <p
          role="alert"
          className="border border-magenta/60 bg-magenta/10 px-4 py-3 font-mono text-xs uppercase tracking-wider text-magenta"
        >
          {state.error}
        </p>
      )}
      {state?.message && (
        <p
          role="status"
          className="border border-neon/60 bg-neon/10 px-4 py-3 font-mono text-xs uppercase tracking-wider text-neon"
        >
          {state.message}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="border-b border-line pb-2 font-mono text-xs uppercase tracking-[0.25em] text-neon">
          Identity
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" hint="Required — also feeds the auto-generated slug">
            <input
              name="name"
              required
              defaultValue={product?.name}
              placeholder="Aether One"
              className={inputClass}
            />
          </Field>
          <Field label="Slug" hint="Leave blank to auto-generate from the name">
            <input
              name="slug"
              defaultValue={product?.slug}
              placeholder="aether-one-headphones"
              className={inputClass}
            />
          </Field>
          <Field label="Tagline">
            <input
              name="tagline"
              defaultValue={product?.tagline}
              placeholder="Flagship over-ear with planar drivers"
              className={inputClass}
            />
          </Field>
          <Field label="Category">
            <select
              name="categoryId"
              required
              defaultValue={product?.categoryId ?? categories[0]?.id}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description" hint="Shown on the product page">
            <textarea
              name="description"
              defaultValue={product?.description}
              rows={4}
              placeholder="What makes this gear worth the spec sheet?"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="border-b border-line pb-2 font-mono text-xs uppercase tracking-[0.25em] text-neon">
          Pricing & stock
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (USD)">
            <input
              name="priceUsd"
              type="number"
              required
              min="0"
              step="0.01"
              defaultValue={product?.priceUsd}
              placeholder="499.00"
              className={inputClass}
            />
          </Field>
          <Field label="Compare-at (USD)" hint="Optional — for discount badges">
            <input
              name="compareAtUsd"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.compareAtUsd ?? ""}
              placeholder="599.00"
              className={inputClass}
            />
          </Field>
          <Field label="Stock">
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.stock ?? 0}
              className={inputClass}
            />
          </Field>
          <Field label="Rating (0–5)">
            <input
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              defaultValue={product?.rating ?? 0}
              className={inputClass}
            />
          </Field>
          <Field label="Review count">
            <input
              name="reviews"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.reviews ?? 0}
              className={inputClass}
            />
          </Field>
          <div className="flex items-end pb-2">
            <label className="inline-flex cursor-pointer items-center gap-2 border border-line bg-surface px-3 py-2.5">
              <input
                name="featured"
                type="checkbox"
                defaultChecked={product?.featured ?? false}
                className="h-4 w-4 accent-cyan-400"
              />
              <span className={labelClass}>Featured</span>
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="border-b border-line pb-2 font-mono text-xs uppercase tracking-[0.25em] text-neon">
          Spec sheet
        </h2>
        <div className="space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                value={spec.label}
                onChange={(e) => updateSpec(i, "label", e.target.value)}
                placeholder="DRIVER"
                className={inputClass}
              />
              <input
                value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                placeholder="106mm planar magnetic"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeSpec(i)}
                aria-label="Remove spec row"
                className="border border-line px-3 text-muted transition-colors hover:border-magenta/60 hover:text-magenta"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSpec} className={btnGhost}>
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add spec row
          </span>
        </button>
      </section>

      <section className="space-y-4">
        <h2 className="border-b border-line pb-2 font-mono text-xs uppercase tracking-[0.25em] text-neon">
          Images
        </h2>
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={url} className="relative">
              <div className="h-20 w-20 overflow-hidden border border-line bg-elevated">
                <ProductImage src={url} alt={`Image ${i + 1}`} className="h-full w-full" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label="Remove image"
                className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center border border-line bg-bg text-muted transition-colors hover:border-magenta/60 hover:text-magenta"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <Field label="Paste image URLs" hint="One per line — Unsplash or any https image">
          <textarea
            name="imageUrls"
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            rows={2}
            placeholder="https://images.unsplash.com/…"
            className={inputClass}
          />
        </Field>
        <Field label="Upload images" hint="Up to 5MB each, max 6 images total (Vercel Blob)">
          <input
            name="newImages"
            type="file"
            accept="image/*"
            multiple
            className="w-full cursor-pointer border border-line bg-surface px-3 py-2.5 font-mono text-xs text-muted file:mr-3 file:cursor-pointer file:border-0 file:bg-elevated file:px-3 file:py-1.5 file:font-mono file:text-xs file:uppercase file:tracking-widest file:text-neon"
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="border-b border-line pb-2 font-mono text-xs uppercase tracking-[0.25em] text-neon">
          Discovery
        </h2>
        <Field label="Tags" hint="Comma-separated, lowercased — used by shop search">
          <input
            name="tags"
            defaultValue={product?.tags.join(", ")}
            placeholder="flagship, anc, planar, new"
            className={inputClass}
          />
        </Field>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
