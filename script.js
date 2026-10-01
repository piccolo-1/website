/* ============================================================
   Crumb & Co. — interactions
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Procedural SVG cookies ----------
   Every element with data-cookie="<flavour>" gets a hand-drawn-looking
   cookie. Swap these for real product photography when you have it. */

const FLAVOURS = {
  classic:   { dough: ['#e7b878', '#c98a4b', '#9a5f2c'], chunks: ['#3b2416', '#52321f'], salt: true },
  double:    { dough: ['#7a4a33', '#5a3322', '#3a1f14'], chunks: ['#22130c', '#e9d8c4'], salt: true },
  caramel:   { dough: ['#ecc58c', '#d39a58', '#a86b33'], chunks: ['#7a4421'], pools: '#e0a64e', nuts: true },
  raspberry: { dough: ['#f1d3a4', '#ddb179', '#b9854b'], chunks: ['#fbf3e6', '#f4e7d2'], bits: '#d6456b' },
  pistachio: { dough: ['#ecd09a', '#d2ac6b', '#a77e43'], chunks: ['#9cb25a', '#7f9a3d'], drizzle: '#f7f0e0', bits: '#8fae4a' },
  biscoff:   { dough: ['#d9955a', '#b8743c', '#8a5222'], chunks: ['#c7803f'], pools: '#a9652c', crumbs: '#e8b67c' },
};

let cookieId = 0;

function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function blobPath(cx, cy, r, points, wobble, rand) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 - wobble / 2 + rand() * wobble);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], n = pts[(i + 1) % pts.length];
    const mx = (p[0] + n[0]) / 2, my = (p[1] + n[1]) / 2;
    d += i === 0 ? `M${mx.toFixed(1)},${my.toFixed(1)}` : '';
    const nn = pts[(i + 2) % pts.length];
    const mx2 = (n[0] + nn[0]) / 2, my2 = (n[1] + nn[1]) / 2;
    d += ` Q${n[0].toFixed(1)},${n[1].toFixed(1)} ${mx2.toFixed(1)},${my2.toFixed(1)}`;
  }
  return d + 'Z';
}

function chunkPath(cx, cy, size, rand) {
  const sides = 4 + Math.floor(rand() * 3);
  const rot = rand() * Math.PI;
  let d = '';
  for (let i = 0; i < sides; i++) {
    const a = rot + (i / sides) * Math.PI * 2;
    const r = size * (0.7 + rand() * 0.5);
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1);
  }
  return d + 'Z';
}

// random point inside the cookie, avoiding the very edge
function spot(rand, max = 70) {
  const a = rand() * Math.PI * 2;
  const r = Math.sqrt(rand()) * max;
  return [100 + Math.cos(a) * r, 100 + Math.sin(a) * r];
}

function makeCookie(flavour, seed) {
  const f = FLAVOURS[flavour] || FLAVOURS.classic;
  const rand = rng(seed);
  const id = 'ck' + (++cookieId);
  const [light, mid, dark] = f.dough;
  let s = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="${id}g" cx="45%" cy="40%" r="62%">
      <stop offset="0" stop-color="${light}"/><stop offset=".65" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
    </radialGradient>
    <filter id="${id}t"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="${seed % 100}"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .35 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  </defs>`;

  const outline = blobPath(100, 100, 92, 14, 0.09, rand);
  s += `<path d="${outline}" fill="url(#${id}g)"/>`;
  s += `<path d="${outline}" fill="#000" filter="url(#${id}t)" opacity=".55"/>`;

  // cracks
  for (let i = 0; i < 6; i++) {
    const [x, y] = spot(rand, 62);
    const a = rand() * Math.PI;
    const l = 10 + rand() * 18;
    const bx = x + Math.cos(a + 0.6) * l * 0.6, by = y + Math.sin(a + 0.6) * l * 0.6;
    s += `<path d="M${x.toFixed(1)},${y.toFixed(1)} Q${bx.toFixed(1)},${by.toFixed(1)} ${(x + Math.cos(a) * l).toFixed(1)},${(y + Math.sin(a) * l).toFixed(1)}" stroke="${dark}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".45"/>`;
  }

  // pools (melted caramel / biscoff)
  if (f.pools) {
    const n = flavour === 'biscoff' ? 1 : 4;
    for (let i = 0; i < n; i++) {
      const [x, y] = flavour === 'biscoff' ? [100, 100] : spot(rand, 55);
      const r = flavour === 'biscoff' ? 34 : 9 + rand() * 7;
      s += `<path d="${blobPath(x, y, r, 9, 0.35, rand)}" fill="${f.pools}" opacity=".95"/>`;
      s += `<ellipse cx="${(x - r * .3).toFixed(1)}" cy="${(y - r * .3).toFixed(1)}" rx="${(r * .35).toFixed(1)}" ry="${(r * .18).toFixed(1)}" fill="#fff" opacity=".25"/>`;
    }
  }

  // nuts (pecan halves)
  if (f.nuts) {
    for (let i = 0; i < 4; i++) {
      const [x, y] = spot(rand, 62);
      const rot = rand() * 180;
      s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)})"><ellipse rx="11" ry="6.5" fill="#8a4b22"/><path d="M-9,0 H9 M-6,-3 Q0,-1 6,-3 M-6,3 Q0,1 6,3" stroke="#5e2f12" stroke-width="1.2" fill="none"/></g>`;
    }
  }

  // chunks
  const count = flavour === 'biscoff' ? 6 : 10 + Math.floor(rand() * 4);
  for (let i = 0; i < count; i++) {
    const [x, y] = spot(rand, flavour === 'biscoff' ? 74 : 70);
    if (flavour === 'biscoff' && Math.hypot(x - 100, y - 100) < 40) continue;
    const size = 5 + rand() * 7;
    const c = f.chunks[Math.floor(rand() * f.chunks.length)];
    s += `<path d="${chunkPath(x, y, size, rand)}" fill="${c}"/>`;
    s += `<path d="${chunkPath(x - size * .25, y - size * .25, size * .35, rand)}" fill="#fff" opacity=".18"/>`;
  }

  // little bits (raspberry / pistachio)
  if (f.bits) {
    for (let i = 0; i < 16; i++) {
      const [x, y] = spot(rand, 72);
      s += `<path d="${chunkPath(x, y, 2 + rand() * 3, rand)}" fill="${f.bits}"/>`;
    }
  }

  // drizzle
  if (f.drizzle) {
    let d = 'M40,70';
    for (let i = 0; i < 6; i++) d += ` Q${60 + i * 20},${(i % 2 ? 150 : 40) + rand() * 20} ${70 + i * 20},${100 + (rand() - .5) * 60}`;
    s += `<path d="${d}" stroke="${f.drizzle}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".9"/>`;
  }

  // crumbs on top
  if (f.crumbs) {
    for (let i = 0; i < 10; i++) {
      const [x, y] = spot(rand, 30);
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.5 + rand() * 2).toFixed(1)}" fill="${f.crumbs}"/>`;
    }
  }

  // sea salt
  if (f.salt) {
    for (let i = 0; i < 9; i++) {
      const [x, y] = spot(rand, 64);
      s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="2.6" height="2.6" fill="#fff" opacity=".85" transform="rotate(${(rand() * 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
  }

  // soft top highlight
  s += `<ellipse cx="78" cy="66" rx="46" ry="26" fill="#fff" opacity=".07" transform="rotate(-25 78 66)"/>`;
  return s + '</svg>';
}

document.querySelectorAll('[data-cookie]').forEach((el, i) => {
  el.innerHTML = makeCookie(el.dataset.cookie, 1234 + i * 977);
});

/* ---------- Loader ---------- */
document.body.classList.add('is-loading');
const loader = document.querySelector('.loader');
function finishLoading() {
  loader.classList.add('is-done');
  document.body.classList.remove('is-loading');
  setTimeout(() => document.body.classList.add('is-ready'), 250);
}
window.addEventListener('load', () => setTimeout(finishLoading, reduceMotion ? 0 : 900));
setTimeout(finishLoading, 3500); // safety net if fonts are slow

/* ---------- Nav: shrink on scroll, hide on scroll down ---------- */
const nav = document.querySelector('.nav');
let lastY = 0;
function onNavScroll() {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 40);
  nav.classList.toggle('is-hidden', y > lastY && y > 400 && !document.body.classList.contains('menu-open'));
  lastY = y;
}

/* ---------- Mobile menu ---------- */
const burger = document.querySelector('.nav__burger');
const menu = document.querySelector('.menu');
function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open);
  menu.setAttribute('aria-hidden', !open);
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

/* ---------- Scroll reveal (with stagger for siblings) ---------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => {
  const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
  const idx = siblings.indexOf(el);
  if (idx > 0) el.style.setProperty('--delay', `${Math.min(idx * 0.08, 0.5)}s`);
  revealObserver.observe(el);
});

/* ---------- Count-up stats ---------- */
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    const dur = reduceMotion ? 1 : 1600;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

/* ---------- Parallax: hero cookies follow mouse + scroll, story cookie rolls ---------- */
const heroMain = document.querySelector('.hero__cookie--main');
const heroA = document.querySelector('.hero__cookie--a');
const heroB = document.querySelector('.hero__cookie--b');
const storyCookie = document.querySelector('.story__cookie');
const story = document.querySelector('.story');
let mouseX = 0, mouseY = 0;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX / window.innerWidth - 0.5;
  mouseY = e.clientY / window.innerHeight - 0.5;
  requestFrame();
}, { passive: true });

let ticking = false;
function requestFrame() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { update(); ticking = false; });
}

function update() {
  onNavScroll();
  if (reduceMotion) return;
  const y = window.scrollY;
  if (y < window.innerHeight * 1.2) {
    heroMain.style.transform = `translate(${mouseX * -20}px, ${y * 0.12 + mouseY * -20}px)`;
    heroA.style.transform = `translate(${mouseX * 40}px, ${y * -0.25 + mouseY * 40}px)`;
    heroB.style.transform = `translate(${mouseX * 30}px, ${y * -0.1 + mouseY * 30}px)`;
  }
  const r = story.getBoundingClientRect();
  if (r.top < window.innerHeight && r.bottom > 0) {
    const progress = (window.innerHeight - r.top) / (r.height + window.innerHeight);
    storyCookie.style.transform = `rotate(${progress * 360}deg) scale(${0.85 + Math.sin(progress * Math.PI) * 0.2})`;
  }
}
window.addEventListener('scroll', requestFrame, { passive: true });
update();

/* ---------- Testimonials ---------- */
const quotes = [...document.querySelectorAll('.quote')];
const dots = [...document.querySelectorAll('.quotes__dots button')];
let current = 0, quoteTimer;
function showQuote(i) {
  quotes[current].classList.remove('is-active');
  dots[current].classList.remove('is-active');
  current = i;
  quotes[current].classList.add('is-active');
  dots[current].classList.add('is-active');
}
function startQuotes() {
  clearInterval(quoteTimer);
  quoteTimer = setInterval(() => showQuote((current + 1) % quotes.length), 6000);
}
dots.forEach((d, i) => d.addEventListener('click', () => { showQuote(i); startQuotes(); }));
startQuotes();

/* ---------- Toast ---------- */
const toast = document.querySelector('.toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

/* ---------- Shop: add to bag (front-end demo) ---------- */
let bag = 0;
document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    bag++;
    const name = btn.closest('.box').querySelector('h3').textContent;
    showToast(`${name} added to bag (${bag} item${bag > 1 ? 's' : ''})`);
    btn.textContent = 'Added ✓';
    setTimeout(() => (btn.textContent = 'Add to bag'), 1600);
  });
});

/* ---------- Trade enquiry form ----------
   Front-end only. Hook up to Formspree, Netlify Forms, or your own
   backend by setting the form's action/method. */
const form = document.querySelector('.form');
form.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll('[required]').forEach(input => {
    const valid = input.value.trim() && (input.type !== 'email' || /^\S+@\S+\.\S+$/.test(input.value));
    input.closest('.field').classList.toggle('is-invalid', !valid);
    if (!valid) ok = false;
  });
  if (!ok) { showToast('Please fill in your name and a valid email'); return; }
  form.reset();
  form.querySelector('.form__success').hidden = false;
  showToast('Enquiry sent. Speak soon!');
});

document.querySelector('.news').addEventListener('submit', e => {
  e.preventDefault();
  e.target.reset();
  showToast("You're on the list 🍪");
});

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Build your own box ---------- */
const builder = document.getElementById('builder');
const sizeInputs = [...builder.querySelectorAll('input[name="size"]')];
const rows = [...builder.querySelectorAll('.builder__list li')];
const bar = builder.querySelector('.builder__bar span');
const status = builder.querySelector('.builder__status');
const priceEl = builder.querySelector('.builder__price');
const addBox = builder.querySelector('.builder__add');
const counts = new Map(rows.map(r => [r, 0]));

const boxSize = () => +sizeInputs.find(i => i.checked).value;
const total = () => [...counts.values()].reduce((a, b) => a + b, 0);

function renderBuilder() {
  const size = boxSize(), n = total();
  rows.forEach(r => {
    const c = counts.get(r);
    r.querySelector('output').textContent = c;
    r.classList.toggle('has-qty', c > 0);
    const [minus, plus] = r.querySelectorAll('button');
    minus.disabled = c === 0;
    plus.disabled = n >= size;
  });
  bar.style.width = `${(n / size) * 100}%`;
  status.textContent = n === size ? 'Box full! Ready to add.' : `${n} of ${size} chosen`;
  priceEl.textContent = '£' + sizeInputs.find(i => i.checked).dataset.price;
  addBox.disabled = n !== size;
}

rows.forEach(r => {
  const [minus, plus] = r.querySelectorAll('button');
  plus.addEventListener('click', () => {
    counts.set(r, counts.get(r) + 1);
    r.classList.remove('bump'); void r.offsetWidth; r.classList.add('bump');
    setTimeout(() => r.classList.remove('bump'), 500);
    renderBuilder();
  });
  minus.addEventListener('click', () => { counts.set(r, counts.get(r) - 1); renderBuilder(); });
});

sizeInputs.forEach(i => i.addEventListener('change', () => {
  // if the box shrank, trim picks from the last flavours first
  let over = total() - boxSize();
  for (const r of [...rows].reverse()) {
    if (over <= 0) break;
    const take = Math.min(counts.get(r), over);
    counts.set(r, counts.get(r) - take);
    over -= take;
  }
  renderBuilder();
}));

addBox.addEventListener('click', () => {
  bag++;
  showToast(`Your box of ${boxSize()} added to bag (${bag} item${bag > 1 ? 's' : ''})`);
  rows.forEach(r => counts.set(r, 0));
  renderBuilder();
});

renderBuilder();

/* ---------- Wholesale case links pre-fill the enquiry form ---------- */
document.querySelectorAll('.case__link').forEach(link => {
  link.addEventListener('click', () => {
    form.querySelector('input[value="wholesale"]').checked = true;
    form.querySelector('textarea').value = `I'm interested in the ${link.dataset.case}.`;
  });
});
