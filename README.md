# Les Délices Nadia — website

A static, dependency-free site for a cookie bakery selling small batches to consumers and wholesale cases to businesses.

- `index.html`: page content (hero, all flavours, For home with a build-your-own box, Wholesale cases, story, trade enquiry form)
- `styles.css`: design tokens at the top (colours, fonts) so the brand is easy to re-skin
- `script.js`: animations (loader, scroll reveals, parallax, counters, testimonials) and procedurally drawn SVG cookies

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Make it yours

1. Logo files live in `assets/` (wordmark, icon, full lockup, favicon). Replace the placeholder email, phone and address with your details.
2. Swap the SVG cookies for real photos: replace a `data-cookie="..."` div with an `<img>`.
3. Wire up the trade form (e.g. Formspree or Netlify Forms) and connect the shop buttons to Shopify/Stripe checkout links.
4. Update prices (box `data-price` values in the builder) and the stats in the wholesale section (`data-count`) to your real numbers.

Deploys as-is to Netlify, Vercel, Cloudflare Pages or GitHub Pages.
