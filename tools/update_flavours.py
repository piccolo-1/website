"""Apply tools/flavours.py to the preview site, the Shopify theme and the Shopify product CSV.

Run from the repository root:  python3 tools/update_flavours.py
Photos are expected as assets/cut-<handle>-sm.webp (site) and shopify-theme/assets/cut-<handle>-sm.webp.
"""
import csv, json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from flavours import FLAVOURS, NUTS

esc = lambda t: t.replace('&', '&amp;')
NOTE_EN_OLD = 'Contains wheat, milk and egg; Pistachio Stuffed contains tree nuts.'
NOTE_EN = 'Contains wheat, milk and egg; pistachio and almond flavours contain tree nuts.'
NOTE_FR_OLD = 'Contient : blé, lait et œufs; le Fourré à la pistache contient des noix.'
NOTE_FR = 'Contient : blé, lait et œufs; les saveurs à la pistache et aux amandes contiennent des noix.'

def sub1(pattern, repl, s):
    s2, n = re.subn(pattern, lambda m: m.group(1) + repl + m.group(2), s, count=1, flags=re.S)
    assert n == 1, pattern
    return s2

# ---------- preview site ----------
s = open('index.html', encoding='utf-8').read()
s = sub1(r'(<div class="marquee__track">).*?(\n      </div>)',
         ''.join(f'\n        <span>{esc(en)}</span><i>✦</i>' for _, en, *_ in FLAVOURS * 2), s)
cards = ''
for h, en, fr, de, dfr, badge, band, tint in FLAVOURS:
    tag = f'\n          <span class="cookie-card__tag">{badge}</span>' if badge else ''
    cards += f'''
        <article class="cookie-card reveal">
          <div class="cookie-card__img cookie-card__img--cut" style="--tint: {tint}"><img src="assets/cut-{h}-sm.webp" alt="{esc(en)} cookie" width="400" height="400" loading="lazy"></div>
          <div class="cookie-card__body">
            <h3>{esc(en)}</h3>
            <p>{esc(de)}</p>
            <div class="cookie-card__avail"><span>Home</span><span>Wholesale</span></div>
          </div>{tag}
        </article>'''
s = sub1(r'(<div class="cookie-grid">).*?(\n      </div>\n    </section>)', cards, s)
s = sub1(r'(<ul class="builder__list">).*?(\n        </ul>)', ''.join(
    f'\n          <li data-flavour="{esc(en)}"><img src="assets/cut-{h}-sm.webp" alt="" width="56" height="56" loading="lazy"><span>{esc(en)}</span>'
    '<div class="qty"><button aria-label="Remove one">−</button><output>0</output><button aria-label="Add one">+</button></div></li>'
    for h, en, *_ in FLAVOURS), s)
packs = ''
for h, en, fr, de, dfr, badge, band, tint in FLAVOURS:
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
rows = ''.join(f'\n                    <tr><td>{esc(en)}</td><td>Single, wrapped</td><td>110 g</td><td>12</td><td>21 days</td><td>Ambient</td><td>$4.99</td></tr>'
               for _, en, *_ in FLAVOURS)
s = sub1(r'(<tbody>)(?:\s*<tr><td>(?!Assorted).*?</tr>)+()', rows, s)
s = s.replace(NOTE_EN_OLD, NOTE_EN)
open('index.html', 'w', encoding='utf-8').write(s)

j = open('i18n.js', encoding='utf-8').read()
j = j.replace(f"'{NOTE_EN_OLD}'", f"'{NOTE_EN}'").replace(NOTE_FR_OLD, NOTE_FR)
add = ''
for h, en, fr, de, dfr, *_ in FLAVOURS:
    for k, v in ((en, fr), (de, dfr), (f'{en} cookie', f'Biscuit « {fr} »')):
        if repr(k) + ':' not in j:
            add += f'  {k!r}: {v!r},\n'
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
p = T + 'sections/flavours.liquid'; s = open(p, encoding='utf-8').read()
s = re.sub(r'--tint: \{% cycle [^%]*%\}', '--tint: ' + cyc([f[7] for f in FLAVOURS]), s)
open(p, 'w', encoding='utf-8').write(s)
p = T + 'sections/wholesale.liquid'; s = open(p, encoding='utf-8').read()
s = re.sub(r'--band: \{% cycle [^%]*%\}', '--band: ' + cyc([f[6] for f in FLAVOURS]), s)
s = s.replace('for product in flavours.products limit: 6', 'for product in flavours.products limit: 16')
open(p, 'w', encoding='utf-8').write(s)

p = T + 'templates/index.json'; d = json.load(open(p, encoding='utf-8'))
w = d['sections']['wholesale']
extra = [w['blocks'][k] for k in w['block_order'] if w['blocks'][k]['settings']['product'] in ('Assorted 4-pack', 'Display tray')]
blocks = [{"type": "spec", "settings": {"product": en, "format": "Single, wrapped", "weight": "110 g", "units": "12",
                                        "shelf": "21 days", "storage": "Ambient", "msrp": "$4.99"}} for _, en, *_ in FLAVOURS] + extra
w['blocks'] = {f'spec{i}': b for i, b in enumerate(blocks, 1)}
w['block_order'] = list(w['blocks'])
open(p, 'w', encoding='utf-8').write(json.dumps(d, indent=2, ensure_ascii=False) + '\n')

for loc, old, new in (('en.default.json', NOTE_EN_OLD, NOTE_EN), ('fr.json', NOTE_FR_OLD, NOTE_FR)):
    p = T + 'locales/' + loc; s = open(p, encoding='utf-8').read().replace(old, new)
    open(p, 'w', encoding='utf-8').write(s)

# ---------- product CSV ----------
p = 'shopify-setup/products.csv'
rows = list(csv.DictReader(open(p, encoding='utf-8'))); cols = list(rows[0].keys())
by = {r['Handle']: r for r in rows if r['Title']}
template = dict(by['chocolate-stuffed'])
flavour_rows = []
for h, en, fr, de, dfr, badge, *_ in FLAVOURS:
    r = by.get(h) or dict(template, **{'Handle': h, 'Title': en, 'Variant SKU': 'LDN-' + ''.join(x[0] for x in h.split('-')).upper() + '-1'})
    r['Tags'] = 'flavour' + {'Best seller': ', badge-best-seller', 'Fan favourite': ', badge-fan-favourite', 'New': ', badge-new'}.get(badge, '')
    r['Body (HTML)'] = f'<p>{de}</p>' + (' <p>Contains tree nuts.</p>' if h in NUTS else '')
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
