"""Build the printable wholesale catalog pages (catalog/print-en.html, catalog/print-fr.html).

Run from the repository root:  python3 tools/build_catalog.py
Photos come from catalog/img/ (cut-outs flattened onto their tint as JPEG; regenerate when photos change).
Then save them as PDFs (see tools/print_catalog.mjs) into assets/les-delices-nadia-catalog-{en,fr}.pdf.
Contact details come from CONTACT below: update them along with the website.
"""
import html, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from flavours import FLAVOURS, NUTS, CATEGORIES, CATEGORY, SKU, SMALL

CONTACT = {'email': 'hello@lesdelicesnadia.com', 'phone': '+1 (514) 000-0000', 'web': 'lesdelicesnadia.com'}
YEAR = '2026'

T = {
 'en': dict(
   title='Wholesale catalog', tagline='Handmade cookies · Made in Montréal', products='The range',
   products_note='Regular cookies come baked and individually wrapped, or as frozen dough to bake on site. Small cookies come by the dozen.',
   size='Size', small='Small', sold_by='Sold by', dozen='The dozen', box12='Box of 12',
   code='Item', net='Net wt', case='Case', shelf='Shelf life', units='12 units', days='21 days',
   baked='Baked, wrapped', frozen='Frozen dough', nuts='Contains tree nuts',
   order_title='Formats & ordering', pricing='Pricing on request',
   pricing_text='Tell us your business type, locations and volumes, and we’ll send case pricing and a free sample box within one working day.',
   formats=[('Baked & individually wrapped', '110 g · 12 per case · 21 days at room temperature. Bilingual EN/FR labels.'),
            ('Frozen dough', 'Pre-portioned dough balls. Bake from frozen in 12 minutes. Keeps 6 months frozen.'),
            ('Shelf-ready display tray', '12 wrapped singles in a tray that goes straight from case to counter.'),
            ('Assorted 4-pack gift box', '440 g · 6 per case.')],
   foodservice='Cafés & food service', foodservice_text='Cases of 24, 48 or 96+ cookies, any mix of flavours, weekly standing orders.',
   corporate='Corporate & events', corporate_text='Branded gift boxes, logo cookies and white label for larger accounts.',
   contact='Contact', allergens='All products contain wheat, milk and egg and are made in a facility that handles tree nuts.',
   page='Page'),
 'fr': dict(
   title='Catalogue de gros', tagline='Biscuits faits à la main · Fait à Montréal', products='La gamme',
   products_note='Les biscuits réguliers sont offerts cuits et emballés individuellement, ou en pâte congelée à cuire sur place. Les petits biscuits sont vendus à la douzaine.',
   size='Format', small='Petit', sold_by='Vendu', dozen='À la douzaine', box12='Boîte de 12',
   code='Article', net='Poids net', case='Caisse', shelf='Conservation', units='12 unités', days='21 jours',
   baked='Cuit, emballé', frozen='Pâte congelée', nuts='Contient des noix',
   order_title='Formats et commandes', pricing='Prix sur demande',
   pricing_text='Indiquez-nous votre type d’entreprise, vos emplacements et vos volumes : nous vous enverrons nos prix à la caisse et une boîte d’échantillons gratuite en un jour ouvrable.',
   formats=[('Cuits et emballés individuellement', '110 g · 12 par caisse · 21 jours à température ambiante. Étiquettes bilingues FR/EN.'),
            ('Pâte congelée', 'Boules de pâte portionnées. Cuisson directement du congélateur en 12 minutes. Se conserve 6 mois congelée.'),
            ('Présentoir prêt pour la tablette', '12 biscuits emballés dans un présentoir qui passe directement de la caisse au comptoir.'),
            ('Boîte-cadeau assortie de 4', '440 g · 6 par caisse.')],
   foodservice='Cafés et restauration', foodservice_text='Caisses de 24, 48 ou 96+ biscuits, toutes les saveurs au choix, commandes hebdomadaires récurrentes.',
   corporate='Entreprises et événements', corporate_text='Boîtes-cadeaux personnalisées, biscuits à votre logo et marque blanche pour les grands comptes.',
   contact='Contact', allergens='Tous nos produits contiennent du blé, du lait et des œufs et sont fabriqués dans un établissement qui manipule des noix.',
   page='Page'),
}

e = html.escape
CSS = '''
@page { size: Letter; margin: 0; }
* { box-sizing: border-box; }
:root { --burgundy: #74202c; --cream: #f7eedf; --cream-2: #efe1cc; --ink: #3a1117; --muted: #8a5a5f; --line: rgba(116, 32, 44, .16); --rose: #b4485a; }
html, body { margin: 0; background: #fff; color: var(--ink); font-family: "Inter", system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1, h2, h3 { font-family: "Fraunces", Georgia, serif; font-weight: 400; margin: 0; letter-spacing: -.01em; }
.page { width: 8.5in; height: 11in; padding: .55in .6in; position: relative; overflow: hidden; page-break-after: always; background: var(--cream); display: flex; flex-direction: column; }
.page:last-child { page-break-after: auto; }
.mark { display: block; background: currentColor; -webkit-mask: var(--src) center / contain no-repeat; mask: var(--src) center / contain no-repeat; }
.mark--full { --src: url("../assets/logo.png"); aspect-ratio: 958 / 816; }
.mark--word { --src: url("../assets/logo-wordmark.png"); aspect-ratio: 958 / 588; }
.eyebrow { font-size: 8pt; letter-spacing: .18em; text-transform: uppercase; font-weight: 600; color: var(--muted); margin: 0 0 6pt; }

.cover { background: var(--burgundy); color: var(--cream); justify-content: space-between; }
.cover .mark--full { width: 3.4in; color: var(--cream); margin-top: .6in; }
.cover h1 { font-size: 44pt; line-height: 1; }
.cover h1 em { color: #f0bcb4; font-weight: 300; }
.cover .tag { font-size: 12pt; opacity: .8; margin-top: 10pt; }
.cover .cookies { display: flex; gap: 6pt; margin-top: 26pt; }
.cover .cookies img { width: 1.05in; }
.cover footer { display: flex; justify-content: space-between; font-size: 9.5pt; opacity: .85; border-top: 1px solid rgba(247,238,223,.3); padding-top: 12pt; }

.head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 14pt; }
.head h2 { font-size: 24pt; }
.head .mark--word { width: .9in; color: var(--burgundy); }
.note { font-size: 9pt; color: var(--muted); margin: -6pt 0 12pt; }
.grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(4, 1fr); gap: 9pt; flex: 1; }
.item { background: #fff; border-radius: 12pt; display: grid; grid-template-columns: 1.3in 1fr; overflow: hidden; }
.item__img { background: var(--tint); display: grid; place-items: center; }
.item__img img { width: 92%; }
.item__body { padding: 8pt 11pt; display: flex; flex-direction: column; gap: 3pt; min-width: 0; }
.meta { font-size: 6.5pt; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.item h3 { font-size: 13pt; line-height: 1.1; }
.alt { font-size: 7.5pt; color: var(--muted); font-style: italic; margin-top: -2pt; }
.desc { font-size: 7.4pt; line-height: 1.35; color: #5f3036; margin: 0; }
.specs { display: grid; grid-template-columns: repeat(3, auto); justify-content: start; column-gap: 9pt; margin: 2pt 0 0; padding-top: 5pt; border-top: 1px solid var(--line); }
.specs dt { font-size: 5.8pt; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.specs dd { margin: 0; font-size: 8pt; font-weight: 600; white-space: nowrap; }
.chips { display: flex; flex-wrap: wrap; gap: 3pt; margin-top: auto; }
.chips span { font-size: 6.5pt; font-weight: 600; padding: 2pt 6pt; border-radius: 99pt; background: var(--cream-2); color: #5f3036; }
.chips .nuts { background: transparent; color: var(--rose); padding-left: 0; }
.pageno { position: absolute; bottom: .3in; right: .6in; font-size: 7.5pt; color: var(--muted); }

.order h2 { font-size: 24pt; margin-bottom: 14pt; }
.formats { display: grid; grid-template-columns: 1fr 1fr; gap: 10pt; }
.box { background: #fff; border-radius: 12pt; padding: 14pt 16pt; }
.box h3 { font-size: 13pt; margin-bottom: 4pt; }
.box p { font-size: 9pt; line-height: 1.45; margin: 0; color: #5f3036; }
.pricing { margin-top: 16pt; background: var(--burgundy); color: var(--cream); border-radius: 14pt; padding: 20pt 22pt; display: grid; grid-template-columns: 1.2fr 1fr; gap: 20pt; align-items: center; }
.pricing h3 { font-size: 22pt; }
.pricing h3 em { color: #f0bcb4; font-weight: 300; }
.pricing p { font-size: 9.5pt; line-height: 1.5; opacity: .9; margin: 6pt 0 0; }
.pricing dl { margin: 0; display: grid; gap: 6pt; font-size: 10pt; }
.pricing dt { font-size: 7pt; letter-spacing: .14em; text-transform: uppercase; opacity: .7; }
.pricing dd { margin: 0 0 4pt; font-weight: 600; }
.allergens { margin-top: auto; font-size: 8pt; color: var(--muted); border-top: 1px solid var(--line); padding-top: 10pt; }
'''

def build(lang):
    t = T[lang]
    other_name = {f[0]: (f[2] if lang == 'en' else f[1]) for f in FLAVOURS}
    cat = {k: (en if lang == 'en' else fr) for k, en, fr in CATEGORIES}
    pages = []
    cover_cookies = ''.join(f'<img src="img/cover-{h}.jpg" alt="">' for h in
                            ['pistachio-stuffed', 'cookies-and-cream', 'salted-chocolate-chunk', 'almond-amaretti', 'blueberry-glazed'])
    pages.append(f'''<section class="page cover">
  <span class="mark mark--full" role="img" aria-label="Les délices Nadia"></span>
  <div>
    <p class="eyebrow" style="color:#f0bcb4">{YEAR}</p>
    <h1>{e(t['title'])}</h1>
    <p class="tag">{e(t['tagline'])}</p>
    <div class="cookies">{cover_cookies}</div>
  </div>
  <footer><span>{CONTACT['web']}</span><span>{CONTACT['email']}</span><span>{CONTACT['phone']}</span></footer>
</section>''')
    per_page = 8
    ordered = [f for f in FLAVOURS if f[0] not in SMALL] + [f for f in FLAVOURS if f[0] in SMALL]
    chunks = [ordered[i:i + per_page] for i in range(0, len(ordered), per_page)]
    for n, chunk in enumerate(chunks, 2):
        cards = ''
        for h, en, fr, de, dfr, badge, band, tint in chunk:
            name, desc = (en, de) if lang == 'en' else (fr, dfr)
            nuts = f'<span class="nuts">⚠ {e(t["nuts"])}</span>' if h in NUTS else ''
            if h in SMALL:
                specs = f"<div><dt>{t['size']}</dt><dd>{t['small']}</dd></div><div><dt>{t['sold_by']}</dt><dd>{e(t['dozen'])}</dd></div><div><dt>{t['shelf']}</dt><dd>{t['days']}</dd></div>"
                chips = f"<span>{e(t['box12'])}</span>"
            else:
                specs = f"<div><dt>{t['net']}</dt><dd>110 g</dd></div><div><dt>{t['case']}</dt><dd>{t['units']}</dd></div><div><dt>{t['shelf']}</dt><dd>{t['days']}</dd></div>"
                chips = f"<span>{e(t['baked'])}</span><span>{e(t['frozen'])}</span>"
            cards += f'''
    <article class="item">
      <div class="item__img" style="--tint:{tint}"><img src="img/{h}.jpg" alt=""></div>
      <div class="item__body">
        <p class="meta">{t['code']} {SKU[h]} · {e(cat[CATEGORY[h]])}</p>
        <h3>{e(name)}</h3>
        <p class="alt">{e(other_name[h])}</p>
        <p class="desc">{e(desc)}</p>
        <dl class="specs">{specs}</dl>
        <div class="chips">{chips}{nuts}</div>
      </div>
    </article>'''
        intro = f'<p class="note">{e(t["products_note"])}</p>' if n == 2 else ''
        pages.append(f'''<section class="page">
  <div class="head"><h2>{e(t['products'])}</h2><span class="mark mark--word"></span></div>
  {intro}
  <div class="grid">{cards}
  </div>
  <span class="pageno">{t['page']} {n}</span>
</section>''')
    formats = ''.join(f'<div class="box"><h3>{e(a)}</h3><p>{e(b)}</p></div>' for a, b in t['formats'])
    formats += f'<div class="box"><h3>{e(t["foodservice"])}</h3><p>{e(t["foodservice_text"])}</p></div>'
    formats += f'<div class="box"><h3>{e(t["corporate"])}</h3><p>{e(t["corporate_text"])}</p></div>'
    pages.append(f'''<section class="page order">
  <div class="head"><h2>{e(t['order_title'])}</h2><span class="mark mark--word"></span></div>
  <div class="formats">{formats}</div>
  <div class="pricing">
    <div><h3><em>{e(t['pricing'])}</em></h3><p>{e(t['pricing_text'])}</p></div>
    <dl><dt>{t['contact']}</dt><dd>{CONTACT['email']}</dd><dd>{CONTACT['phone']}</dd><dd>{CONTACT['web']}</dd></dl>
  </div>
  <p class="allergens">{e(t['allergens'])}</p>
  <span class="pageno">{t['page']} {len(chunks) + 2}</span>
</section>''')
    return f'''<!doctype html>
<html lang="{'fr-CA' if lang == 'fr' else 'en'}"><head><meta charset="utf-8">
<title>Les délices Nadia — {e(t['title'])} {YEAR}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
{chr(10).join(pages)}
</body></html>
'''

os.makedirs('catalog', exist_ok=True)
for lang in ('en', 'fr'):
    open(f'catalog/print-{lang}.html', 'w', encoding='utf-8').write(build(lang))
print('wrote catalog/print-en.html and catalog/print-fr.html')
