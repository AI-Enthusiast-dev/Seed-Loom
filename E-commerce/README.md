# SeedNest — microgreens kits & seed storefront

A presentation mockup for a business selling **microgreens growing kits alongside seed**.
31 products across 7 categories; Growing Kits leads the navigation and the homepage.

A complete storefront modelled on [seedscart.in](https://www.seedscart.in/products/7-in-1-microgreens-seed-combo):
catalog, filterable collections, a full product detail page, cart, coupons and a checkout
flow ending in an order confirmation.

No build step and no dependencies — plain HTML, CSS and vanilla JS.

## Run it

```bash
node server.js          # → http://localhost:4321
node server.js 8080     # pick a different port
```

Opening `index.html` directly with `file://` also works, since nothing is fetched over
the network.

## Pages

| Page | File | What it does |
| --- | --- | --- |
| Home | [index.html](index.html) | Immersive landing — see below |
| Collections | [collections.html](collections.html) | Search, category filter, 6 sort modes — all state kept in the URL |
| Product | [product.html](product.html)`?p=<slug>` | Gallery, pack-size variants, quantity, pincode check, tabs (description / specs / FAQ / reviews), related products |
| Cart | [cart.html](cart.html) | Line editing, coupons, free-shipping progress, cross-sell |
| Checkout | [checkout.html](checkout.html) | Validated address form, payment selection, order placement |
| Confirmation | [checkout.html](checkout.html)`?order=<id>` | Order number, ETA, itemised summary, shipping address |
| Classic home | [home-classic.html](home-classic.html) | The light editorial homepage, kept for comparison |
| Credits | [credits.html](credits.html) | Photograph attribution — required by the CC BY images |

The flagship product mirrors the reference page:
`product.html?p=7-in-1-microgreens-seed-combo`

## Source layout

```
assets/
  css/styles.css      design tokens → primitives → components → page blocks
  js/catalog.js       24 products across 6 categories + the SVG art generator
  js/store.js         cart/wishlist/order state, header & footer, cart drawer, toasts
  js/home.js          homepage sections
  js/collections.js   search, filter, sort
  js/product.js       product detail page
  js/cart-page.js     full cart view
  js/checkout.js      form validation, order placement, confirmation
server.js             static file server (node:http, no deps)
```

## Theming: dark browse, light checkout

[dark.css](assets/css/dark.css) loads on every page and does two separate jobs.

**Dark chrome everywhere.** The header is dark on all pages (the footer already was), so
the site reads as one place no matter what surface sits between them.

**Dark surfaces on browsing pages only** — anything carrying `body[data-theme="dark"]`:

| Page | Surface | Why |
| --- | --- | --- |
| `index.html` | dark | The landing; sells the vision |
| `collections.html` | dark | Photography reads better on near-black |
| `product.html` | dark | Where the brand does its persuading |
| `cart.html` | light | Line items, quantities, price breakdown |
| `checkout.html` | light | Dense forms, validation, a 23-option dropdown |
| `credits.html` | light | Reference table |

Browse should seduce; transact should be clear. The shift reads as intentional rather
than accidental because the frame never changes.

Most of the dark theme works by remapping the shared tokens (`--ink`, `--cream`,
`--off-white`, `--border`…) inside one block — so components re-theme without being
rewritten. The exceptions are handled explicitly and commented: tokens like
`--parchment` are dual-use (light text *on* dark chrome, and a light tint *behind*
content), so they can't simply be inverted. Badges also get an opaque ground, since a
translucent one disappears against bright product photography.

To flip a page, add or remove `data-theme="dark"` on its `<body>`. Nothing else.

## The immersive landing page

[index.html](index.html) is a dark, scroll-driven landing built on
[landing.css](assets/css/landing.css) + [landing.js](assets/js/landing.js). Both are
scoped to `body[data-page="landing"]`, so the rest of the storefront is untouched — the
shared header, cart drawer and footer still come from `store.js`.

One procedural growth system drives the whole page. `drawSprout()` renders a stem curve
plus unfurling leaf pairs at a given progress `0..1`; two things consume it:

- **`GerminationField`** — the hero. A depth-sorted field of sprouts on a timeline, with
  drifting motes and a per-plant sway. Seeded from a fixed PRNG so a reload looks the
  same, and pre-warmed so the hero is never seen as bare soil.
- **`GrowthTray`** — the "seven days" section. The same function, but progress comes from
  scroll position across a `420vh` rail, so a tray germinates and fills as you scroll
  while the day-by-day copy advances alongside it.

Everything is canvas 2D — no libraries, nothing fetched.

**Progressive enhancement.** Each subsystem is initialised inside its own `try`/`catch`,
and `matchMedia`, `IntersectionObserver` and `getContext('2d')` are all feature-detected.
Where any of them is missing the page falls back to its static layout with content
visible, rather than failing wholesale. `prefers-reduced-motion` stops the animation
loops and reveals everything immediately.

## Catalogue

| Category | Items |
| --- | --- |
| Growing Kits | 8 — starter, continuous-harvest, hydroponic, gift, kids', wheatgrass, rack, refill |
| Microgreens | 7 |
| Vegetable Seeds | 5 |
| Herb Seeds | 3 |
| Combo Packs | 3 |
| Tree Seeds | 3 |
| Bamboo Seeds | 2 |

Kits carry `unit: 'kits'` and a `tail` string on their category record so collection copy
reads "8 kits, each arriving complete with trays…" rather than the seed wording. The rack
has `seeds: 0`, which product cards render as "Hardware only".

## Photography

39 photographs live in [assets/img/products/](assets/img/products/) — one per product plus
seven category tiles and the homepage hero. All are square 900px JPEGs (5.4 MB total).

Every image is licensed for **commercial use**: 23 CC0, 15 CC BY, 1 Public Domain Mark,
sourced through [Openverse](https://openverse.org). The CC BY ones require attribution,
which is why [credits.html](credits.html) exists and is linked in the footer — keep it
in place, or replace those 15 images with client-owned photography before launch.

`assets/img/credits.json` holds the machine-readable manifest (title, creator, licence,
source URL) if you want to regenerate the credits page.

To swap in the client's own photos, drop a square JPEG named `<slug>.jpg` into
`assets/img/products/` — no code change needed, since `PHOTOS` in
[catalog.js](assets/js/catalog.js) is keyed by slug.

## Design system

All of it lives in the `:root` block of [assets/css/styles.css](assets/css/styles.css) —
change it there and it propagates everywhere.

| Token | Value |
| --- | --- |
| Display face | Playfair Display, **weight 400** (never bold), tracking `-.02em` |
| Body face | DM Sans, **15px**, line-height 1.65 |
| `h1` / `h2` | `clamp(32px, 4vw, 54px)` / `clamp(28px, 3vw, 46px)` |
| Micro-labels | 9–11px, weight 600, `letter-spacing: .12–.24em`, uppercase |
| Corners | `0` throughout (circles only for avatars and icon buttons) |
| Container | 1400px |
| Easing | `cubic-bezier(.22, 1, .36, 1)` |

**Palette.** Deep forest green with a gold accent on warm cream.

| | |
| --- | --- |
| `--forest` `#2C4A34` | buttons, footer, announcement bar, trust strip |
| `--gold` `#B8873C` | accent surfaces (Buy now), ratings |
| `--cream` `#F9F5EE` | page background |
| `--off-white` `#FDFAF6` | cards and panels |
| `--parchment` `#F4EEE2` | section tints, text on dark chrome |
| `--pop` `#C8421A` | sale badges |
| `--warm-grey` `#8A8070` | muted text |
| `--ink` `#1E2C22` | body text |

An alias layer maps the semantic names (`--brand`, `--line`, `--r-md`, …) onto these
tokens, so the stylesheet and the inline styles in the JS re-theme from one block with
no rename sweep. To try another direction, edit the palette at the top of `:root` and
leave the aliases alone.

## How it works

- **Product imagery is real photography, bundled locally.** `catalog.art(product, {view})`
  returns an `<img>` for any slug listed in `PHOTOS`, and falls back to the generated
  seed-packet SVG for anything else — so a product added without a photo still renders.
  Nothing is hotlinked: the images ship with the project, so the demo works on a dead
  connection.
- **State lives in `localStorage`** under `seednest.*` keys — cart, wishlist and the last
  20 orders. It survives reloads and syncs the header count and drawer through a
  `cart:change` event.
- **Coupons:** `SPROUT10` (10% off), `WELCOME50` (₹50 off over ₹399), `FREESHIP`.
  Shipping is ₹49, free over ₹499; COD adds a ₹25 handling fee.
- **Header and footer are rendered once** by `store.js` into `[data-chrome]` placeholders,
  so the nav and footer exist in one place rather than five copies of markup.

## What's simulated

This is a presentation mockup — a front end only. Checkout does **not** take payment:
`checkout.js` waits 900 ms and writes the order to `localStorage`. Reviews, stock levels,
the sale countdown and the pincode serviceability check are all generated client-side.

Footer links that have no page behind them are marked `data-stub`: clicking one shows a
brief "not built in this mockup" toast instead of jumping to the top of the page, so a
walkthrough never lands on a broken screen.

**No invented reviews.** Star ratings, review counts, testimonials, the reviews tab and
its rating histogram have all been removed, along with the `rating`/`reviews` fields on
every product record — fabricated customer reviews are a real liability on a live store,
so there is nothing here to accidentally ship. Product cards now carry only seed count
and units sold.

`sold` counts are still placeholder numbers. They read as sales data rather than
customer testimony, so they were left in — say the word and they can go too.

To make it real you need a backend that:

1. Owns the catalog and prices, so the client can't set what it pays.
2. Creates the payment intent (Razorpay/Stripe) server-side from a cart id.
3. Verifies the gateway webhook signature before marking an order paid.
4. Stores orders and sends confirmation email/SMS.

The client structures its `order` object to match what such an endpoint would expect.

## Adding a product

Append to `PRODUCTS` in [assets/js/catalog.js](assets/js/catalog.js):

```js
{
  slug: 'kale-microgreens-seeds',      // becomes ?p=kale-microgreens-seeds
  name: 'Kale Microgreens Seeds',
  category: 'microgreens',             // must match a CATEGORIES slug
  price: 129, mrp: 269,
  rating: 4.6, reviews: 210, sold: 3400,
  seeds: 2000,
  tagline: 'One line for the card and the PDP subhead.',
  description: 'A paragraph for the description tab.',
  highlights: ['Bullet one', 'Bullet two'],
  variants: [{ id: 'std', label: '50 g pouch', note: 'approx. 2,000 seeds', multiplier: 1 }],
  specs: { 'Days to Harvest': '9–12 days' },
  faqs: [{ q: 'Question?', a: 'Answer.' }]
}
```

It appears on the collections page, in its category and in related-product rails
automatically. `badge` (`'Bestseller'` / `'New'`) is optional.
