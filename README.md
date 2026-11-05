# Rayana: kids fashion store

Rayana is a premium children's fashion store for Mongolia, built with Next.js 15, TypeScript and Tailwind CSS. It has a storefront, customer accounts, a full admin dashboard, inventory, orders, promotions, delivery zones and reviews.

> **Rayana is a fictional brand and this repository ships with DEMO data.** Every product, customer, order, review and discount code created by the seed is labelled DEMO. **No real payment is ever taken.** QPay, SocialPay, bank transfer and cash on delivery are simulated flows, and every screen that involves payment says so. Real gateway integration is not implemented (see "What is not done yet").

Mongolian is the default language, English is available from the header. Currency is Mongolian tugrik (₮). Phone numbers use the 8 digit Mongolian format. Delivery covers the nine districts of Ulaanbaatar. Cyrillic including Ө and Ү is rendered with bundled Noto fonts (no external font requests).

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

The first request creates the demo database in `.data/rayana.json` (100 products, 5 departments with 35 categories, 11 collections, 30 customers, 40 orders, 20 reviews, 10 discount codes, stock across colors and sizes). Everything you do persists there. Reset it any time with the "Reset demo data" button on the admin dashboard, or `npm run reset` and restart.

Demo logins (shown on the login page while demo mode is on):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@rayana.demo` | `Rayana2026!` |
| Customer | `oyunaa1@rayana.demo` | `Demo1234!` |

Handy demo codes: `RAYANA10`, `WELCOME15` (first order only), `SPRING20`, `FREESHIP`, `BUY2GET1`, `MINUS10K`, `KIDS25`, `WINTER30`, `GIFT5K`. `OLD2025` is expired on purpose.

Production build: `npm run build && npm start`.

## Environment variables

Copy `.env.example` to `.env.local`. All are optional in demo mode.

| Variable | Purpose |
| --- | --- |
| `SESSION_SECRET` | Signs session cookies. **Set a random 32+ character value in production.** Without it a random secret is generated and stored in the data directory. |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site. |
| `NEXT_PUBLIC_DEMO_MODE` | `true` (default) seeds demo data, shows the demo banner and demo logins. Set `false` for a real shop: no sample data is created and the demo banner and logins disappear. This value is read at build time. |
| `DEMO_ADMIN_PASSWORD` | Demo mode only. Replaces the default demo admin password and hides the admin demo login from the login page. **Set this on any public deployment.** |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Required when `NEXT_PUBLIC_DEMO_MODE=false` and the database is empty. Creates the first admin (password 10+ characters). |
| `DATA_DIR` | Where the JSON database and uploads live. Default `./.data`, or `/tmp/rayana` on Vercel. |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | When both are set, the store state is also persisted to Supabase (see below). The service role key is server only and never sent to the browser. |
| `QPAY_*`, `SOCIALPAY_*` | Reserved for future real gateways. Not used today. |

## Features

**Storefront.** Seasonal hero carousel, new arrivals, best sellers, shop by 12 age groups, shop by category, 11 collections with their own pages, everyday essentials, premium, offers, lookbook, parent reviews, gallery, newsletter, brand story and footer. Catalog filters by gender, category, age, size, color, sale, new and in stock, with sorting and pagination. Size and color filters only match variants that are actually in stock.

**Product page.** Gallery, click to zoom plus hover zoom, product video, color and size pickers that switch images and availability live, per variant stock, quantity, add to cart, wishlist, size guide dialog with the interactive recommender, fabric, material, care, delivery information, related and recently viewed products, reviews.

**Size guide.** 14 sizes with age, height, weight, chest, waist and hip. The recommender takes age, height and optional weight (or a saved child profile) and always states that sizing varies by brand and product and is guidance, not a guarantee.

**Cart and checkout.** Persistent cart, size and color changes per line, quantities, discount codes, automatic bundle offers, free delivery threshold, gift packaging, pickup or delivery to a district, all totals recomputed on the server. Server side validation of phone, email, district, address and stock. Guest checkout is supported. Abandoned carts are recorded when an email is entered.

**Customer account.** Register and log in, profile, saved addresses, optional child profiles (age, height, weight; visible only to the owner and never to admins), wishlist, order history, tracking with timeline, invoices (printable), returns, reviews with photos, notifications.

**Reviews.** Rating, text and up to 3 photos, verified purchase label when the customer has a delivered order for the product, editing your own review, admin moderation (approve, hide, delete). New and edited reviews wait for approval.

**Admin** (`/admin`, admins only). Dashboard (total sales, monthly revenue, orders, pending, completed, products, low stock, best sellers, customers, average order value), product create, edit, delete with image upload and a color by size stock grid, inventory with SKU level adjustments and a stock movement log, orders (all 9 statuses, payment confirmation, notes, timeline, returns), customers, reviews, discount codes (percentage, fixed, free delivery, buy 2 get 1, new customer, limits, expiry), bundles, banners, homepage sections and story, collections, delivery zones, fees, ETAs, free delivery threshold, pickup, gift fee, categories, colors, sizes and age groups, analytics (by day, month, department, status, top products, abandoned carts).

**Inventory rules.** Stock is checked when an order is placed and deducted when the payment is confirmed by an admin (or the order is confirmed for cash on delivery). Cancelling restocks. A return marked received restocks. Every change writes a stock movement. Confirming is blocked if stock ran out in the meantime.

## Security

Passwords are hashed with scrypt. Sessions are signed, httpOnly, SameSite cookies. Admin pages and `/api/admin` check the role on the server. All write endpoints validate input with zod and check the request origin. Login, registration, tracking and order creation are rate limited. Orders are only visible to their owner, an admin, or someone holding the order's private link or order number plus phone. Uploads are sniffed by content (PNG, JPG, WEBP only, 3 MB). Secrets never reach the browser. Security headers are set in `next.config.mjs`.

## Tests

```bash
npm run build && npm start &      # in one terminal
npm run e2e                       # the 17 step shopping journey plus dash, font and mobile checks
npm run test:extra                # security, validation, promotions, inventory edge cases
```

`e2e` drives a real browser (Playwright) through: homepage, 2~3 years age page, filters, product, size guide, size and color, cart, discount code, demo checkout, confirmation, admin sees the order, admin confirms the demo payment, status updates, inventory change, customer tracking, sales analytics. It also scans every page in both languages for dashes between words and checks that the font covers Ө and Ү. Both scripts expect a freshly seeded database and a server on `BASE` (default `http://localhost:3000`) and read the same `DATA_DIR`.

## Deploy

**GitHub.** Push this repository (already set up for `main`).

**Vercel.** Import the repository, framework Next.js, no build settings needed. Set `SESSION_SECRET`. Please read the next section first.

### Important limits of the current persistence

- The database is a single JSON document held in memory and saved to disk. That is correct for one server (local, a VPS, Docker). **On Vercel the filesystem is ephemeral and every serverless instance has its own copy**, so data resets on cold starts and is not shared between instances. A Vercel deployment is fine for looking at the demo, not for running a shop.
- Supabase mode (`supabase/schema.sql`) mirrors the same document into one table so it survives restarts. It was written without access to a Supabase project and has **not been tested**. It does not solve the multi instance problem, and it does not use Supabase Auth or Storage yet.
- For a real shop, move the data access in `lib/db.ts`, `lib/orders.ts` and `lib/admin.ts` to a relational Supabase (PostgreSQL) schema with Supabase Auth, row level security and Storage. The API shape and UI do not need to change.

## What is not done yet

- Real QPay and SocialPay gateways (credentials, callbacks, signature checks). Payments are simulated and labelled.
- Supabase Auth, Storage and a relational schema (see above).
- Photography: the store uses original generated SVG illustrations and short generated demo videos as placeholders, not photographs. Upload real product photos from the admin product form.
- Email and SMS notifications (in app notifications exist).
- Mongolian copy was written by an AI assistant and should be proofread by a native speaker before launch.

## Project layout

```
app/            Next.js routes (storefront, account, admin, API)
components/     UI components
lib/            data layer (db, seed), pricing, orders, auth, sizing, i18n dictionary
scripts/        e2e.cjs and extra.cjs test runners
supabase/       optional Supabase table
public/demo/    generated demo videos
```
