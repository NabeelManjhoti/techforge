"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";
import type { SpecEntry } from "@/lib/types";

export type ActionState = { error?: string; message?: string } | undefined;

const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseSpecs(json: string): SpecEntry[] {
  try {
    const raw: unknown = JSON.parse(json);
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(
        (s): s is SpecEntry =>
          !!s && typeof s.label === "string" && typeof s.value === "string"
      )
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter((s) => s.label.length > 0 && s.value.length > 0);
  } catch {
    return [];
  }
}

function parseImageList(imagesJson: string, urlField: string): string[] {
  const list: string[] = [];
  try {
    const raw: unknown = JSON.parse(imagesJson);
    if (Array.isArray(raw)) list.push(...raw.map(String));
  } catch {
    // ignore malformed JSON — fall through to the raw URL field
  }
  for (const line of urlField.split(/[\n,]/)) {
    const candidate = line.trim();
    if (candidate) list.push(candidate);
  }
  return [...new Set(list)].filter(isHttpUrl).slice(0, MAX_IMAGES);
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/product/[slug]", "page");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (file.size === 0) continue;
    if (!file.type.startsWith("image/")) {
      throw new Error(`"${file.name}" is not an image.`);
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(`"${file.name}" is larger than 5MB.`);
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const pathname = `techforge/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const blob = await put(pathname, file, { access: "public" });
    urls.push(blob.url);
  }
  return urls;
}

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z.string().trim().optional(),
  tagline: z.string().trim().default(""),
  description: z.string().trim().default(""),
  priceUsd: z.coerce.number().positive("Price must be greater than zero"),
  compareAtUsd: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().nonnegative().optional()
  ),
  categoryId: z.string().min(1, "Pick a category"),
  stock: z.coerce.number().int().min(0),
  rating: z.coerce.number().min(0).max(5),
  reviews: z.coerce.number().int().min(0),
  tags: z.string().trim().default(""),
  specsJson: z.string().default("[]"),
  imagesJson: z.string().default("[]"),
  imageUrls: z.string().trim().default(""),
});

export async function login(prevState: ActionState, formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email.includes("@") || !password) {
    return { error: "Enter a valid email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await createSession({ id: user.id, email: user.email, role: user.role });
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function createProduct(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authorized." };

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Invalid product data. Check the highlighted fields." };
  }
  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.name);
  if (!slug) return { error: "Could not build a slug from the product name." };

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return { error: "A product with that slug already exists." };
  }

  const specs = parseSpecs(data.specsJson);
  let images = parseImageList(data.imagesJson, data.imageUrls);
  const files = formData
    .getAll("newImages")
    .filter((f): f is File => f instanceof File);

  try {
    const uploaded = await uploadImages(files);
    images = [...images, ...uploaded].slice(0, MAX_IMAGES);
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Image upload failed. Is BLOB_READ_WRITE_TOKEN set?",
    };
  }

  await prisma.product.create({
    data: {
      id: crypto.randomUUID(),
      slug,
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      priceUsd: data.priceUsd,
      compareAtUsd: data.compareAtUsd ?? null,
      images,
      specs,
      categoryId: data.categoryId,
      stock: data.stock,
      featured: formData.get("featured") === "on",
      rating: data.rating,
      reviews: data.reviews,
      tags: data.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    },
  });

  revalidateCatalog();
  return { message: "Product created." };
}

export async function updateProduct(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing product id." };

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Invalid product data. Check the highlighted fields." };
  }
  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.name);
  if (!slug) return { error: "Could not build a slug from the product name." };

  const conflicting = await prisma.product.findFirst({
    where: { slug, NOT: { id } },
  });
  if (conflicting) {
    return { error: "A different product already uses that slug." };
  }

  const specs = parseSpecs(data.specsJson);
  let images = parseImageList(data.imagesJson, data.imageUrls);
  const files = formData
    .getAll("newImages")
    .filter((f): f is File => f instanceof File);

  try {
    const uploaded = await uploadImages(files);
    images = [...images, ...uploaded].slice(0, MAX_IMAGES);
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Image upload failed. Is BLOB_READ_WRITE_TOKEN set?",
    };
  }

  await prisma.product.update({
    where: { id },
    data: {
      slug,
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      priceUsd: data.priceUsd,
      compareAtUsd: data.compareAtUsd ?? null,
      images,
      specs,
      categoryId: data.categoryId,
      stock: data.stock,
      featured: formData.get("featured") === "on",
      rating: data.rating,
      reviews: data.reviews,
      tags: data.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    },
  });

  revalidateCatalog();
  return { message: "Product updated." };
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.product.delete({ where: { id } });
  revalidateCatalog();
  redirect("/admin/products");
}
