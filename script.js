/* ============================================================
   Crumb & Co. — interactions
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
const heroA = document.querySelector('.hero__polaroid--b');
const heroB = document.querySelector('.hero__polaroid--a');
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
    heroMain.style.translate = `${mouseX * -20}px ${y * 0.12 + mouseY * -20}px`;
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

/* ---------- Gallery: drag to scroll on desktop ---------- */
const track = document.querySelector('.gallery__track');
let dragX = null, startScroll = 0;
track.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse') return;
  dragX = e.clientX; startScroll = track.scrollLeft;
  track.classList.add('is-dragging');
});
window.addEventListener('pointermove', e => { if (dragX !== null) track.scrollLeft = startScroll - (e.clientX - dragX); });
window.addEventListener('pointerup', () => { dragX = null; track.classList.remove('is-dragging'); });
