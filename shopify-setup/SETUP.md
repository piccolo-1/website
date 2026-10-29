# Putting Les délices Nadia on Shopify

Everything happens in your Shopify admin. Do the steps in this order.

## 1. Import the products

**Products → Import → Add file → `products.csv`**, then **Import products**.

This creates three flavours (Salted Chocolate Chunk, Chocolate Stuffed, Pistachio Stuffed),
three ready-made boxes and the **Build your own box** product with sizes 4, 6 and 12.
Prices and weights are placeholders, so change them on each product afterwards.

Tags control the site:
- `flavour` puts a product in the flavours section, the box builder and the packaging mockups.
- `box` puts it in the ready-made boxes.
- `badge-best-seller`, `badge-fan-favourite`, `badge-most-gifted`, `badge-new` add a badge.

## 2. Add the photos

Open each product and upload its photo from the `photos` folder (each file is named after its product).
Until a product has a photo, the theme shows the matching bundled photo, so the site never looks empty.

## 3. Create two collections

**Products → Collections → Create collection**, as *Automated* collections:

| Title | Condition |
|---|---|
| Flavours | Product tag is equal to `flavour` |
| Boxes | Product tag is equal to `box` |

Keep the titles exactly as shown, so their web addresses are `flavours` and `boxes`.

## 4. Upload the theme

**Online Store → Themes → Add theme → Upload zip file → `les-delices-nadia-theme.zip`**.
Click **Customize** to check it, then **Publish** when you're happy.

In **Customize** you can change photos, the spec table rows, the numbers, your phone and address,
and the footer links (Instagram, TikTok, LinkedIn, policies).

## 5. Turn on French

1. **Settings → Languages → Add language → French**, then **Publish** it.
   All the site's own text is already translated, and the EN | FR switch appears in the menu bar.
2. Install Shopify's free **Translate & Adapt** app to translate your products:

| English | French |
|---|---|
| Salted Chocolate Chunk | Chocolat & fleur de sel |
| Chocolate Stuffed | Fourré au chocolat |
| Pistachio Stuffed | Fourré à la pistache |
| The Taster | La Découverte |
| The Gift Box | La Boîte-cadeau |
| The Full Collection | La Collection complète |
| Build your own box | Composez votre boîte |

Also translate the spec table rows there (they're under the homepage's Retail & wholesale section).

## 6. Change any wording

**Online Store → Themes → ⋯ → Edit default theme content.** Pick English or French at the top and
edit any sentence on the site. No code needed.

## 7. Before you take orders

- **Settings → Taxes and duties:** add your GST/QST registration. Ask your accountant how sales tax
  applies to your baked goods.
- **Settings → Shipping and delivery:** set delivery rates and turn on local pickup if you offer it.
- **Settings → Store details:** the trade enquiry form and newsletter sign-ups are sent to your store's email.

## Good to know

- Build-your-own-box orders show the chosen flavours on the order, for example
  `Salted Chocolate Chunk: 2`, `Pistachio Stuffed: 4`.
- Wholesale and retail buyers send the enquiry form. Shopify's built-in wholesale price lists need
  Shopify Plus; wholesale apps can add online wholesale ordering on other plans later.
