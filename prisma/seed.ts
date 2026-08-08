import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { categories as seedCategories } from "../src/lib/data/categories";
import { products as seedProducts } from "../src/lib/data/products";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const c of seedCategories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        icon: c.icon,
      },
      create: {
        id: c.id,
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        icon: c.icon,
      },
    });
  }
  console.log(`Upserted ${seedCategories.length} categories`);

  for (const p of seedProducts) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        priceUsd: p.priceUsd,
        compareAtUsd: p.compareAtUsd ?? null,
        images: p.images,
        specs: p.specs,
        categoryId: p.categoryId,
        stock: p.stock,
        featured: p.featured,
        rating: p.rating,
        reviews: p.reviews,
        tags: p.tags,
      },
      create: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        priceUsd: p.priceUsd,
        compareAtUsd: p.compareAtUsd ?? null,
        images: p.images,
        specs: p.specs,
        categoryId: p.categoryId,
        stock: p.stock,
        featured: p.featured,
        rating: p.rating,
        reviews: p.reviews,
        tags: p.tags,
      },
    });
  }
  console.log(`Upserted ${seedProducts.length} products`);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash },
      create: {
        email: adminEmail,
        name: "TECHFORGE Admin",
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Upserted admin user ${adminEmail}`);
  } else {
    console.warn(
      "ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user seed."
    );
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
