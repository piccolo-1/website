# Les Délices Nadia — website

A static, dependency-free site for a cookie bakery selling small batches to consumers and wholesale cases to businesses.

- `index.html`: page content (hero, all flavours, For home with a build-your-own box, Wholesale cases, story, trade enquiry form)
- `styles.css`: design tokens at the top (colours, fonts) so the brand is easy to re-skin
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
