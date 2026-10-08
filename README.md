# MobileHub — Mobile Accessories E-Commerce Platform

A full-stack, production-ready e-commerce platform for a mobile accessories store, built with Next.js 14, TypeScript, PostgreSQL (Prisma), NextAuth, and Cloudinary.

## 1. Project Overview

- **Storefront**: Home, dynamic categories, product pages, search/filter/sort, cart, checkout (Cash on Delivery), order tracking.
- **Admin Dashboard**: Secure login, analytics, product/category/order/coupon/review/settings management, Excel order export.
- **Database**: PostgreSQL via Prisma ORM — products, categories, orders, customers, reviews, coupons, site settings.
- **Media**: Cloudinary for product images/videos (never stored in the database).
- **Security**: Hashed admin passwords, protected admin routes/APIs, server-side price & stock validation on every order (client-sent prices are never trusted).

## 2. Technologies

Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL · Prisma · NextAuth (Credentials) · Cloudinary · ExcelJS · Zustand · Zod · Recharts

## 3. Requirements

- Node.js 18.18+ (20+ recommended)
- A PostgreSQL database (local, or Supabase / Neon / Railway)
- A free Cloudinary account

## 4. Installation

```bash
npm install
```

## 5. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string (used at runtime) |
| `DIRECT_URL` | Direct (non-pooled) Postgres connection string (used by Prisma Migrate) |
| `AUTH_SECRET` | Random secret for NextAuth — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app's canonical URL (e.g. `https://yourstore.com` in production) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `NEXT_PUBLIC_SITE_URL` | Used for SEO metadata, sitemap, robots.txt |

## 6. Database Setup

If using Supabase or Neon, create a project and copy both the pooled and direct connection strings into `.env`.

## 7. Prisma Migration

```bash
npx prisma migrate dev --name init
```

This creates all tables defined in `prisma/schema.prisma`.

## 8. Seed the Database

```bash
npm run seed
```

This creates:
- Default site settings
- A default admin user: **admin@mobilehub.pk / Admin123!** — change this password immediately after first login, or better, skip the seeded admin and use step 10 below to create your own.
- 6 sample categories and 8 sample products (with a placeholder image) so the storefront isn't empty during development.

## 9. Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin/login` for the admin panel.

## 10. Creating a Production Admin Account

Instead of relying on the seeded default admin, create your own:

```bash
npm run create-admin -- --name "Your Name" --email you@yourstore.com --password "YourStrongPassword123!"
```

## 11. Cloudinary / Storage Setup

1. Create a free account at cloudinary.com.
2. From your dashboard, copy the **Cloud Name**, **API Key**, and **API Secret** into `.env`.
3. No further setup is required — the app uploads directly via the Cloudinary Node SDK from `/api/upload`.

## 12. Excel Export

From **Admin → Orders**, click **Export to Excel**. This streams a `.xlsx` file (via ExcelJS) built from live PostgreSQL data — Excel is used only for reporting, never as the source of truth.

## 13. Production Deployment

### Vercel (recommended)

1. Push this repository to GitHub.
2. Import the repo into Vercel.
3. Add all variables from `.env.example` in the Vercel project's Environment Variables settings.
4. Set the build command to `npm run build` (this runs `prisma generate` automatically, see `package.json`).
5. After the first deploy, run migrations against your production database:
   ```bash
   npx prisma migrate deploy
   ```
   (Run this from your local machine with production `DATABASE_URL`/`DIRECT_URL` in your shell, or via a one-off deployment hook.)
6. Create your production admin user with `npm run create-admin`.

## 14. PostgreSQL Deployment

Use a managed provider such as **Supabase**, **Neon**, or **Railway**. All three provide both a pooled and direct connection string, which map to `DATABASE_URL` and `DIRECT_URL` respectively.

## 15. Database Backups & Data Safety

PostgreSQL is the single source of truth for this application — **Excel export is for reporting only** and must never be treated as a backup.

- **Supabase**: Automatic daily backups are included on paid plans; enable Point-in-Time Recovery (PITR) for production stores.
- **Neon**: Supports branching and automatic backups; enable your provider's backup retention window.
- **Self-managed**: Schedule `pg_dump` on a cron job (daily, retained for 30 days) and store the dumps in offsite storage (e.g. an S3-compatible bucket).

Test your restore process periodically — a backup you've never restored from is not a backup you can rely on.

## 16. Troubleshooting

| Problem | Fix |
|---|---|
| `PrismaClientInitializationError` | Check `DATABASE_URL`/`DIRECT_URL` are correct and the database is reachable. |
| Image upload fails | Verify all three `CLOUDINARY_*` variables are set correctly. |
| Admin login fails | Confirm the admin exists (`npm run create-admin`) and `AUTH_SECRET` is set. |
| Orders not decrementing stock | Stock is only decremented on successful order creation inside a DB transaction — check server logs for a thrown validation error (e.g. insufficient stock), which aborts the whole transaction. |
| Middleware redirect loop on `/admin` | Ensure `AUTH_SECRET` matches between builds/deploys — NextAuth JWTs are invalidated if the secret changes. |

## Project Structure

```
app/
  (store)/         # Storefront: home, shop, product, cart, checkout, etc.
  admin/           # Admin panel (protected by middleware.ts)
  api/             # All backend API routes
components/
  layout/          # Header, Footer, Hero, homepage sections
  products/        # ProductCard, gallery, filters, shop grid
  admin/           # Sidebar, forms, image uploader, stat cards
lib/
  db.ts            # Prisma client singleton
  auth/            # NextAuth config + admin session guard
  storage/         # Cloudinary helpers
  validations/     # Zod schemas (shared by client forms & API routes)
  store/           # Zustand cart store
prisma/
  schema.prisma    # Full data model
  seed.ts          # Sample data
scripts/
  create-admin.ts  # Production admin creation CLI
```

## Notes on Scope

This is a complete, working foundation covering every core flow (browse -> cart -> COD checkout -> admin fulfillment -> export), built with real database queries and no hardcoded/fake data. A few areas are intentionally kept simple and are natural next steps as the store grows:

- **Product variants** use a simple single-attribute model (e.g. Color OR Length) rather than a full attribute-combination matrix — sufficient for most mobile accessories, but worth extending if you need combinations like Color x Length together.
- **Online payments**: the schema and checkout flow already support `paymentMethod: ONLINE` and full payment-status tracking, but only COD is wired up, per the original scope — dropping in a gateway means adding a provider call in `/api/orders` without restructuring anything.
- **Brands** exist in the schema and product API but there's no dedicated admin UI for managing them yet (the categories UI can be used as a template).
