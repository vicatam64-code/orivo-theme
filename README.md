# Orivo — Shopify theme

A faithful Shopify (Online Store 2.0) theme rebuilt from the Orivo storefront design.
Connect it to your store with **Shopify ⇄ GitHub** (Online Store → Themes → Add theme → Connect from GitHub).

## What's inside
- `layout/theme.liquid` — page shell, fonts (Cormorant Garamond + Manrope via Google Fonts), global CSS/JS
- `sections/` — homepage (hero, trust strip, best sellers, science, lifestyle, testimonials, guarantee, FAQ, newsletter, UGC, story), product buy box, collection, contact, cart, search, etc.
- `snippets/` — product cards, icons, image helper
- `templates/` — JSON templates for index, product, collection, page, contact, cart, search, 404 + Liquid for blog/article/gift card/customer pages
- `assets/base.css` — the full Orivo design system
- `assets/orivo.js` — reveal-on-scroll, countdown, mobile drawer, FAQ accordion, gallery, quantity stepper, AJAX add-to-cart
- `config/` + `locales/` — theme settings and translations

## After connecting
1. **Products** — the homepage Best Sellers and the Collection page render real Shopify products. Create your 4 devices (LED Photon Mask, Lumi Sculpt, Restore Cup, AlignPro) and add them to a collection, then pick that collection in the *Best sellers* section.
2. **Images** — every hero, lifestyle, UGC and story image is an editable image slot in the theme editor (shows a labelled placeholder until set).
3. **Per-product copy** (optional) — the product page shows brand-level science/FAQ plus editable defaults. For per-product highlights/subtitle/rating, add product metafields under `custom`: `subtitle`, `highlights`, `rating`, `review_count`, `shipping_note`, `badge`.

Cart and checkout are wired to Shopify's native cart — no extra setup.
