"""Apply tools/flavours.py to the preview site, the Shopify theme and the Shopify product CSV.

Run from the repository root:  python3 tools/update_flavours.py
Photos are expected as assets/cut-<handle>-sm.webp (site) and shopify-theme/assets/cut-<handle>-sm.webp.
"""
import csv, json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from flavours import FLAVOURS, NUTS, CATEGORIES, CATEGORY, SKU, SMALL, PRICE

esc = lambda t: t.replace('&', '&amp;')
NOTES_EN_OLD = ['Contains wheat, milk and egg; Pistachio Stuffed contains tree nuts.',
                'Contains wheat, milk and egg; pistachio and almond flavours contain tree nuts.']
NOTE_EN = 'Contains wheat, milk and egg; pistachio, almond and hazelnut flavours contain tree nuts.'
NOTES_FR_OLD = ['Contient : blé, lait et œufs; le Fourré à la pistache contient des noix.',
                'Contient : blé, lait et œufs; les saveurs à la pistache et aux amandes contiennent des noix.']
NOTE_FR = 'Contient : blé, lait et œufs; les saveurs à la pistache, aux amandes et à la noisette contiennent des noix.'
REGULAR = [f for f in FLAVOURS if f[0] not in SMALL]

def fix_notes(text):
    for old in NOTES_EN_OLD:
        text = text.replace(old, NOTE_EN)
    for old in NOTES_FR_OLD:
        text = text.replace(old, NOTE_FR)
    return text

def sub1(pattern, repl, s):
    s2, n = re.subn(pattern, lambda m: m.group(1) + repl + m.group(2), s, count=1, flags=re.S)
    assert n == 1, pattern
    return s2

# ---------- preview site ----------
s = open('index.html', encoding='utf-8').read()
s = sub1(r'(<div class="marquee__track">).*?(\n      </div>)',
         ''.join(f'\n        <span>{esc(en)}</span><i>✦</i>' for _, en, *_ in FLAVOURS * 2), s)

# wholesale catalog: filters + one card per flavour (no prices)
used = [c for c in CATEGORIES if any(CATEGORY[f[0]] == c[0] for f in FLAVOURS)]
chips = '\n        <button type="button" data-filter="all" aria-pressed="true">All</button>' + ''.join(
    f'\n        <button type="button" data-filter="{key}" aria-pressed="false">{esc(label)}</button>' for key, label, _ in used)
s = sub1(r'(<div class="catalog__filters reveal" role="group" aria-label="Filter the catalog">).*?(</div>\n      <div class="catalog__grid">)', chips + '\n      ', s)
cat_label = {key: label for key, label, _ in CATEGORIES}
items = ''
for h, en, fr, de, dfr, badge, band, tint in FLAVOURS:
    tag = f'\n          <span class="cat-item__tag">{badge}</span>' if badge else ''
    nuts = '\n            <p class="cat-item__allergen">Contains tree nuts</p>' if h in NUTS else ''
    if h in SMALL:
        specs = ('\n              <div><dt>Size</dt><dd>Small</dd></div>'
                 '\n              <div><dt>Sold by</dt><dd>The dozen</dd></div>'
                 '\n              <div><dt>Shelf life</dt><dd>21 days</dd></div>')
        formats = '<li>Box of 12</li>'
    else:
        specs = ('\n              <div><dt>Net wt</dt><dd>110 g</dd></div>'
                 '\n              <div><dt>Case</dt><dd>12 units</dd></div>'
                 '\n              <div><dt>Shelf life</dt><dd>21 days</dd></div>')
        formats = '<li>Baked, wrapped</li><li>Frozen dough</li>'
    items += f'''
        <article class="cat-item reveal" data-handle="{h}" data-cat="{CATEGORY[h]}">
          <div class="cat-item__img" style="--tint: {tint}"><img src="assets/cut-{h}-sm.webp" alt="{esc(en)} cookie" width="400" height="400" loading="lazy"></div>{tag}
          <div class="cat-item__body">
            <p class="cat-item__meta"><span data-no-i18n>{SKU[h]}</span> · <span>{esc(cat_label[CATEGORY[h]])}</span></p>
            <h3>{esc(en)}</h3>
            <p class="cat-item__desc">{esc(de)}</p>
            <dl class="cat-item__specs">{specs}
            </dl>
            <ul class="cat-item__formats">{formats}</ul>{nuts}
            <button type="button" class="cat-item__add" aria-pressed="false"><span class="cat-item__off">+ Add to inquiry</span><span class="cat-item__on">✓ In your inquiry</span></button>
          </div>
        </article>'''
s = sub1(r'(<div class="catalog__grid">).*?(</div>\n    </section>)', items + '\n      ', s)

packs = ''
for h, en, fr, de, dfr, badge, band, tint in REGULAR:
    packs += f'''
            <figure class="pack reveal">
              <div class="pack__bag" style="--band: {band}">
                <span class="logo-mark logo-mark--word pack__logo"></span>
                <div class="pack__window"><img src="assets/cut-{h}-sm.webp" alt="" width="400" height="400" loading="lazy"></div>
                <div class="pack__band" data-no-i18n><strong>{esc(en)}</strong><span>{esc(fr)}</span></div>
                <span class="pack__wt">1 cookie · 110 g</span>
              </div>
              <figcaption>{esc(en)}</figcaption>
            </figure>'''
s = sub1(r'(<div class="packs">).*?(\n          </div>\n\n          <div class="retail-grid">)', packs, s)
rows = ''.join(f'\n                    <tr><td>{esc(en)}</td><td>Single, wrapped</td><td>110 g</td><td>12</td><td>21 days</td><td>Ambient</td></tr>'
               for _, en, *_ in REGULAR)
rows += ''.join(f'\n                    <tr><td>{esc(en)}</td><td>Box of 12, small</td><td>—</td><td>—</td><td>21 days</td><td>Ambient</td></tr>'
                for h, en, *_ in FLAVOURS if h in SMALL)
s = sub1(r'(<tbody>)(?:\s*<tr><td>(?!Assorted).*?</tr>)+()', rows, s)
s = fix_notes(s)
open('index.html', 'w', encoding='utf-8').write(s)

# retail page: box builder rows
s = open('shop.html', encoding='utf-8').read()
s = sub1(r'(<ul class="builder__list">).*?(\n        </ul>)', ''.join(
    f'\n          <li data-flavour="{esc(en)}"><img src="assets/cut-{h}-sm.webp" alt="" width="56" height="56" loading="lazy"><span>{esc(en)}</span>'
    '<div class="qty"><button aria-label="Remove one">−</button><output>0</output><button aria-label="Add one">+</button></div></li>'
    for h, en, *_ in REGULAR), s)
open('shop.html', 'w', encoding='utf-8').write(s)

j = open('i18n.js', encoding='utf-8').read()
j = fix_notes(j)
add = ''
for h, en, fr, de, dfr, *_ in FLAVOURS:
    for k, v in ((en, fr), (de, dfr), (f'{en} cookie', f'Biscuit « {fr} »')):
        if repr(k) + ':' not in j:
            add += f'  {k!r}: {v!r},\n'
for _, en, fr in CATEGORIES:
    if repr(en) + ':' not in j:
        add += f'  {en!r}: {fr!r},\n'
if add:
    j = j.replace('  // Messages shown by script.js', add + '\n  // Messages shown by script.js', 1)
open('i18n.js', 'w', encoding='utf-8').write(j)

# ---------- Shopify theme ----------
T = 'shopify-theme/'
p = T + 'snippets/product-fallback.liquid'; s = open(p, encoding='utf-8').read()
cases = ''.join(f"  {{%- when '{h}' -%}}cut-{h}-sm.webp\n" for h, *_ in FLAVOURS)
s = re.sub(r"(\{%- case handle -%\}\n).*?(  \{%- when 'the-taster')", lambda m: m.group(1) + cases + m.group(2), s, flags=re.S)
open(p, 'w', encoding='utf-8').write(s)

cyc = lambda vals: '{% cycle ' + ', '.join(f"'{v}'" for v in vals) + ' %}'
for p in (T + 'sections/flavours.liquid', T + 'sections/catalog.liquid'):
    s = open(p, encoding='utf-8').read()
    s = re.sub(r'--tint: \{% cycle [^%]*%\}', '--tint: ' + cyc([f[7] for f in FLAVOURS]), s)
    open(p, 'w', encoding='utf-8').write(s)
p = T + 'sections/wholesale.liquid'; s = open(p, encoding='utf-8').read()
s = re.sub(r'--band: \{% cycle [^%]*%\}', '--band: ' + cyc([f[6] for f in REGULAR]), s)
s = s.replace('for product in flavours.products limit: 6', 'for product in flavours.products limit: 16')
open(p, 'w', encoding='utf-8').write(s)

p = T + 'templates/index.json'; d = json.load(open(p, encoding='utf-8'))
w = d['sections']['wholesale']
extra = [w['blocks'][k] for k in w['block_order'] if w['blocks'][k]['settings']['product'] in ('Assorted 4-pack', 'Display tray')]
blocks = [{"type": "spec", "settings": {"product": en, "format": "Single, wrapped", "weight": "110 g", "units": "12",
                                        "shelf": "21 days", "storage": "Ambient"}} for _, en, *_ in REGULAR]
blocks += [{"type": "spec", "settings": {"product": en, "format": "Box of 12, small", "weight": "—", "units": "—",
                                         "shelf": "21 days", "storage": "Ambient"}} for h, en, *_ in FLAVOURS if h in SMALL]
blocks += extra
w['blocks'] = {f'spec{i}': b for i, b in enumerate(blocks, 1)}
w['block_order'] = list(w['blocks'])
open(p, 'w', encoding='utf-8').write(json.dumps(d, indent=2, ensure_ascii=False) + '\n')

for loc in ('en.default.json', 'fr.json'):
    p = T + 'locales/' + loc; s = fix_notes(open(p, encoding='utf-8').read())
    open(p, 'w', encoding='utf-8').write(s)

# ---------- product CSV ----------
p = 'shopify-setup/products.csv'
rows = list(csv.DictReader(open(p, encoding='utf-8'))); cols = list(rows[0].keys())
by = {r['Handle']: r for r in rows if r['Title']}
template = dict(by['chocolate-stuffed'])
flavour_rows = []
for h, en, fr, de, dfr, badge, *_ in FLAVOURS:
    r = by.get(h) or dict(template, **{'Handle': h, 'Title': en})
    r['Variant SKU'] = SKU[h]
    r['Tags'] = ''
    amount, unit = PRICE[h]
    r['Variant Price'] = f'{amount:.2f}'
    r['Variant Grams'] = '400' if unit == 'dozen' else '110'
    r['Tags'] = f'flavour, cat-{CATEGORY[h]}' + (', size-small' if h in SMALL else '') + (', contains-nuts' if h in NUTS else '') + {'Best seller': ', badge-best-seller', 'Fan favourite': ', badge-fan-favourite', 'New': ', badge-new'}.get(badge, '')
    r['Body (HTML)'] = f'<p>{de}</p>' + (' <p>Sold by the dozen.</p>' if unit == 'dozen' else '') + (' <p>Contains tree nuts.</p>' if h in NUTS else '')
    flavour_rows.append(r)
handles = {f[0] for f in FLAVOURS}
others = [r for r in rows if r['Handle'] not in handles]
with open(p, 'w', newline='', encoding='utf-8') as f:
    wr = csv.DictWriter(f, fieldnames=cols); wr.writeheader(); wr.writerows(flavour_rows + others)

# ---------- setup guide: French names ----------
p = 'shopify-setup/SETUP.md'; s = open(p, encoding='utf-8').read()
table = ''.join(f'| {en} | {fr} |\n' for _, en, fr, *_ in FLAVOURS)
s = re.sub(r'(\| English \| French \|\n\|---\|---\|\n)(?:\| (?!The Taster).*\|\n)+', lambda m: m.group(1) + table, s)
s = re.sub(r'This creates [a-z]+ flavours \([^)]*\),', f'This creates {len(FLAVOURS)} flavours,', s, flags=re.S)
open(p, 'w', encoding='utf-8').write(s)
print('updated', len(FLAVOURS), 'flavours')
