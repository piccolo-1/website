# Putting Les délices Nadia on Shopify

Everything happens in your Shopify admin. Do the steps in this order.

## 1. Import the products

**Products → Import → Add file → `products.csv`**, then **Import products**.

This creates 11 flavours,
three ready-made boxes and the **Build your own box** product with sizes 4, 6 and 12.
Prices and weights are placeholders, so change them on each product afterwards.

Tags control the site:
- `flavour` puts a product in the wholesale catalog, the box builder and the packaging mockups.
  Flavour products never show a price on the site: buyers request pricing.
- `cat-classic`, `cat-stuffed`, `cat-glazed`, `cat-specialty` set the catalog filter group.
- `contains-nuts` adds the tree-nut warning in the catalog.
- `box` puts it in the ready-made boxes on the Shop page (these do show prices).
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

## 4. Create the Shop page (retail orders)

**Online Store → Pages → Add page.** Title it **Shop**, leave the content empty, and under
**Theme template** choose **page.shop**. Save. This is the separate page with the gift boxes and the
build-your-own box; the homepage links to it.

## 5. Upload the theme

**Online Store → Themes → Add theme → Upload zip file → `les-delices-nadia-theme.zip`**.
Click **Customize** to check it, then **Publish** when you're happy.

In **Customize** you can change photos, the catalog specs (weight, case size, shelf life), the spec
table rows, the numbers, your phone and address,
and the footer links (Instagram, TikTok, LinkedIn, policies).

## 6. Add the catalog PDFs

**Content → Files → Upload files** and upload `les-delices-nadia-catalog-en.pdf` and
`les-delices-nadia-catalog-fr.pdf`. Copy each file's link, then in **Customize → Wholesale catalog**
paste them into *English PDF link* and *French PDF link*. The download button appears once a link is set.

## 7. Turn on French

1. **Settings → Languages → Add language → French**, then **Publish** it.
   All the site's own text is already translated, and the EN | FR switch appears in the menu bar.
2. Install Shopify's free **Translate & Adapt** app to translate your products:

| English | French |
|---|---|
| Salted Chocolate Chunk | Chocolat & fleur de sel |
| Chocolate Stuffed | Fourré au chocolat |
| Pistachio Stuffed | Fourré à la pistache |
| Oatmeal Chocolate Chunk | Avoine et chocolat |
| Cookies & Cream | Biscuits et crème |
| Cinnamon Sugar | Sucre à la cannelle |
| White Chocolate Glazed | Glacé au chocolat blanc |
| Blueberry Glazed | Bleuets et glaçage |
| Cinnamon Roll | Roulé à la cannelle |
| Almond Amaretti | Amaretti aux amandes |
| Salted Pistachio | Pistache et fleur de sel |
| Ricotta Lemon | Ricotta et citron |
| Lemon Drop | Bouchées au citron |
| The Taster | La Découverte |
| The Gift Box | La Boîte-cadeau |
| The Full Collection | La Collection complète |
| Build your own box | Composez votre boîte |

Also translate the spec table rows there (they're under the homepage's Retail & wholesale section).

## 8. Change any wording

**Online Store → Themes → ⋯ → Edit default theme content.** Pick English or French at the top and
edit any sentence on the site. No code needed.

## 9. Before you take orders

- **Settings → Taxes and duties:** add your GST/QST registration. Ask your accountant how sales tax
  applies to your baked goods.
- **Settings → Shipping and delivery:** set delivery rates and turn on local pickup if you offer it.
- **Settings → Store details:** the trade enquiry form and newsletter sign-ups are sent to your store's email.

## Good to know

- Build-your-own-box orders show the chosen flavours on the order, for example
  `Salted Chocolate Chunk: 2`, `Pistachio Stuffed: 4`.
- Wholesale buyers pick products in the catalog ("Add to inquiry") and send the pricing form. The
  products they picked arrive in the email as a *Products* line.
- Wholesale and retail buyers send the enquiry form. Shopify's built-in wholesale price lists need
  Shopify Plus; wholesale apps can add online wholesale ordering on other plans later.
