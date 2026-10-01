# Crumb & Co. — website

A static, dependency-free site for a B2B-first cookie bakery (with a B2C shop).

- `index.html`: page content (hero, wholesale, cookies, story, shop, trade enquiry form)
- `styles.css`: design tokens at the top (colours, fonts) so the brand is easy to re-skin
- `script.js`: animations (loader, scroll reveals, parallax, counters, testimonials) and procedurally drawn SVG cookies

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Make it yours

1. Search-and-replace **Crumb & Co.**, the email, phone and address with your details.
2. Swap the SVG cookies for real photos: replace a `data-cookie="..."` div with an `<img>`.
3. Wire up the trade form (e.g. Formspree or Netlify Forms) and connect the shop buttons to Shopify/Stripe checkout links.
4. Update the stats in the wholesale section (`data-count`) to your real numbers.

Deploys as-is to Netlify, Vercel, Cloudflare Pages or GitHub Pages.
