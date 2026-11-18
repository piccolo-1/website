# Les Délices Nadia — website

A static, dependency-free site for a cookie bakery selling small batches to consumers and wholesale cases to businesses.

- `index.html`: the wholesale homepage (hero, catalog with inquiry list, wholesale details, story, pricing request form)
- `shop.html`: retail page (ready-made boxes and build-your-own box)
- `styles.css`: design tokens at the top (colours, fonts) so the brand is easy to re-skin
- `i18n.js`: English/French switch. French text lives in the `FR` dictionary at the top (English on the left, French on the right). New English text needs a matching line there.
- `script.js`: animations (loader, scroll reveals, parallax, counters, testimonials) and a drag-to-scroll photo gallery

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Make it yours

1. Logo files live in `assets/` (wordmark, icon, full lockup, favicon). Replace the placeholder email, phone and address with your details.
2. Photos live in `assets/` as WebP (full size plus `-sm` thumbnails). To add a flavour, add a card in the flavours section and a row in the build-your-own box.
3. Wire up the trade form (e.g. Formspree or Netlify Forms) and connect the shop buttons to Shopify/Stripe checkout links.
4. Update prices (box `data-price` values in the builder), the product spec table in the Retail & wholesale section, and the stats in the wholesale section (`data-count`) to your real numbers.

Deploys as-is to Netlify, Vercel, Cloudflare Pages or GitHub Pages.

## Shopify

- `shopify-theme/`: the same site as a Shopify theme (English and French, real cart and checkout,
  Shopify contact and newsletter forms). Zip the folder's contents to upload it.
- `shopify-setup/`: `SETUP.md` (step-by-step), `products.csv` (product import) and product photos.

## Flavours and the catalog

1. Edit `tools/flavours.py` (names, descriptions, French names, category, item code, nut warning).
2. Add the photo as `assets/cut-<handle>-sm.webp` and `shopify-theme/assets/cut-<handle>-sm.webp`.
3. Run `python3 tools/update_flavours.py` (site, Shopify theme and product CSV).
4. Run `python3 tools/build_catalog.py`, then `node tools/print_catalog.mjs` with a local server
   on port 8123, to refresh the catalog PDFs in `assets/`.
