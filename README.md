# TECHFORGE — Spec-First Tech Gadget Store

A dark-neon "device HUD" demo storefront for tech gear. Every product ships with a full spec readout, not just a pretty picture. Spec-first, demo-ready: browse → filter → cart → Stripe checkout → order feed.

**Stack:** Next.js 16 (App Router, route groups) · TypeScript · Tailwind CSS v4 · Prisma + Neon (Postgres) · Stripe Checkout · Vercel Blob · lucide-react

## Live features

- **Catalog** — 23 products across 8 categories (audio, keyboards, mice, displays, wearables, drones, cameras, accessories), each with real spec sheets and curated Unsplash photography.
- **Shop with filters** — category chips, live search, price cap, and sort (featured / top rated / price) composed via URL params so results are shareable.
- **Product pages** — image gallery with thumbnails, technical spec tables, related gear.
- **Cart** — slide-out HUD drawer with quantities and subtotal, persisted to `localStorage`.
- **Checkout** — prices re-validated against Postgres, order row created up-front, then Stripe Checkout takes the card. Card `4242 4242 4242 4242` works in test mode.
- **Order webhook** — Stripe webhook flips the order to `paid` and records the payment intent; the success page confirms against the DB.
- **Admin** — `/admin` (session-cookie auth, bcrypt + jose). Manage products/categories, view the live order feed and per-order customer/shipping detail, add/remove inventory.

## Run locally

1. Install and generate the Prisma client:

   ```bash
   npm install
   npm run db:generate
   ```

2. Configure env vars — copy `.env.example` to `.env` and fill in:

   | Var | Where from |
   |---|---|
   | `DATABASE_URL` | Neon (or any Postgres) connection string |
   | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET` | Your admin login + a random secret |
   | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe dashboard (test mode) |
   | `BLOB_READ_WRITE_TOKEN` | Vercel Blob (only for admin image uploads) |

3. Create the schema and seed the catalog + admin user:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start:

   ```bash
   npm run dev
   ```

Open http://localhost:3000. Admin lives at http://localhost:3000/admin.

## Stripe webhook (test mode)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Project layout

```
src/
  app/
    (store)/        public storefront (home, /shop, /product/[slug], /checkout)
    admin/          admin panel (products, categories, orders)
    api/            /api/checkout + /api/webhooks/stripe
  components/       HUD UI kit (product card, cart drawer, hero, gallery, …)
  lib/
    db.ts           Prisma client (Neon Postgres)
    products.ts     catalog + category data layer
    stripe.ts       Stripe client (null-safe if unconfigured)
prisma/
  schema.prisma     tables: Category, Product, Order
  seed.ts           catalog + admin seeding
```
