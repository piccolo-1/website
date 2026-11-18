/* ============================================================
   Les délices Nadia — interactions
   Shared by index.html (wholesale) and shop.html (retail).
   Every block checks that its section is on the page.
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- Loader (home page only) ---------- */
const loader = $('.loader');
function finishLoading() {
  if (loader) loader.classList.add('is-done');
  document.body.classList.remove('is-loading');
  setTimeout(() => document.body.classList.add('is-ready'), loader ? 250 : 0);
}
if (loader) {
  document.body.classList.add('is-loading');
  window.addEventListener('load', () => setTimeout(finishLoading, reduceMotion ? 0 : 900));
  setTimeout(finishLoading, 3500); // safety net if fonts are slow
} else {
  finishLoading();
}

/* ---------- Nav: shrink on scroll, hide on scroll down ---------- */
const nav = $('.nav');
let lastY = 0;
function onNavScroll() {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 40);
  nav.classList.toggle('is-hidden', y > lastY && y > 400 && !document.body.classList.contains('menu-open'));
  lastY = y;
}

/* ---------- Mobile menu ---------- */
const burger = $('.nav__burger');
const menu = $('.menu');
function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open);
  menu.setAttribute('aria-hidden', !open);
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
$$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

/* ---------- Scroll reveal (with stagger for siblings) ---------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => {
  const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
  const idx = siblings.indexOf(el);
  if (idx > 0) el.style.setProperty('--delay', `${Math.min(idx * 0.06, 0.5)}s`);
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
$$('[data-count]').forEach(el => countObserver.observe(el));

/* ---------- Parallax: hero cookies follow mouse + scroll, story cookie rolls ---------- */
const heroMain = $('.hero__cookie--main');
const heroA = $('.hero__polaroid--b');
const heroB = $('.hero__polaroid--a');
const storyCookie = $('.story__cookie');
const story = $('.story');
let mouseX = 0, mouseY = 0, ticking = false;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX / window.innerWidth - 0.5;
  mouseY = e.clientY / window.innerHeight - 0.5;
  requestFrame();
}, { passive: true });

function requestFrame() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { update(); ticking = false; });
}

function update() {
  onNavScroll();
  if (reduceMotion) return;
  const y = window.scrollY;
  if (heroMain && y < window.innerHeight * 1.2) {
    heroMain.style.translate = `${mouseX * -20}px ${y * 0.12 + mouseY * -20}px`;
    if (heroA) heroA.style.transform = `translate(${mouseX * 40}px, ${y * -0.25 + mouseY * 40}px)`;
    if (heroB) heroB.style.transform = `translate(${mouseX * 30}px, ${y * -0.1 + mouseY * 30}px)`;
  }
  if (story && storyCookie) {
    const r = story.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      const progress = (window.innerHeight - r.top) / (r.height + window.innerHeight);
      storyCookie.style.transform = `rotate(${progress * 360}deg) scale(${0.85 + Math.sin(progress * Math.PI) * 0.2})`;
    }
  }
}
window.addEventListener('scroll', requestFrame, { passive: true });
update();

/* ---------- Testimonials ---------- */
const quotes = $$('.quote');
const dots = $$('.quotes__dots button');
if (quotes.length) {
  let current = 0, quoteTimer;
  const showQuote = i => {
    quotes[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = i;
    quotes[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  };
  const startQuotes = () => {
    clearInterval(quoteTimer);
    quoteTimer = setInterval(() => showQuote((current + 1) % quotes.length), 6000);
  };
  dots.forEach((d, i) => d.addEventListener('click', () => { showQuote(i); startQuotes(); }));
  startQuotes();
}

/* ---------- Toast ---------- */
const toast = $('.toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

/* ---------- Footer ---------- */
$('.news')?.addEventListener('submit', e => {
  e.preventDefault();
  e.target.reset();
  showToast(i18n.t("You're on the list 🍪"));
});
if ($('#year')) $('#year').textContent = new Date().getFullYear();

/* =================== WHOLESALE (index.html) =================== */

/* ---------- Catalog filters ---------- */
const catalog = $('.catalog');
if (catalog) {
  const chips = $$('.catalog__filters button', catalog);
  const items = $$('.cat-item', catalog);
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.setAttribute('aria-pressed', c === chip));
    const cat = chip.dataset.filter;
    items.forEach(it => { it.hidden = cat !== 'all' && it.dataset.cat !== cat; if (!it.hidden) it.classList.add('is-in'); });
  }));
}

/* ---------- Inquiry list: products a buyer wants pricing for ---------- */
const form = $('.form');
const inquiryList = $('.inquiry__list');
const inquiryBar = $('.inquiry-bar');
let inquiry = [];
try { inquiry = JSON.parse(localStorage.getItem('ldn-inquiry') || '[]'); } catch (e) {}
const saveInquiry = () => { try { localStorage.setItem('ldn-inquiry', JSON.stringify(inquiry)); } catch (e) {} };
const nameOf = handle => $(`.cat-item[data-handle="${handle}"] h3`)?.textContent.trim() || handle;
const contactInView = () => { const r = $('#contact')?.getBoundingClientRect(); return r && r.top < window.innerHeight && r.bottom > 0; };

function renderInquiry() {
  inquiry = inquiry.filter(h => $(`.cat-item[data-handle="${h}"]`));
  $$('.cat-item').forEach(it => {
    const on = inquiry.includes(it.dataset.handle);
    it.classList.toggle('is-picked', on);
    $('.cat-item__add', it).setAttribute('aria-pressed', on);
  });
  if (inquiryList) {
    inquiryList.innerHTML = '';
    inquiry.forEach(h => {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = nameOf(h);
      const x = document.createElement('button');
      x.type = 'button'; x.textContent = '×';
      x.setAttribute('aria-label', i18n.f('removeItem', nameOf(h)));
      x.addEventListener('click', () => { inquiry = inquiry.filter(v => v !== h); saveInquiry(); renderInquiry(); });
      li.append(label, x);
      inquiryList.append(li);
    });
    $('.inquiry__empty').hidden = inquiry.length > 0;
  }
  if (inquiryBar) {
    $('.inquiry-bar__count', inquiryBar).textContent = inquiry.length;
    $('.inquiry-bar__label', inquiryBar).textContent = i18n.t(inquiry.length === 1 ? 'product in your inquiry' : 'products in your inquiry');
    inquiryBar.hidden = inquiry.length === 0 || contactInView();
  }
}
$$('.cat-item__add').forEach(btn => btn.addEventListener('click', () => {
  const h = btn.closest('.cat-item').dataset.handle;
  const adding = !inquiry.includes(h);
  inquiry = adding ? [...inquiry, h] : inquiry.filter(v => v !== h);
  saveInquiry(); renderInquiry();
  if (adding) showToast(i18n.f('addedInquiry', nameOf(h)));
}));
if (inquiryBar) window.addEventListener('scroll', () => { inquiryBar.hidden = inquiry.length === 0 || contactInView(); }, { passive: true });
renderInquiry();

/* ---------- Pricing request form ----------
   Front-end only here. On Shopify this is the store's contact form. */
form?.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  $$('[required]', form).forEach(input => {
    const valid = input.value.trim() && (input.type !== 'email' || /^\S+@\S+\.\S+$/.test(input.value));
    input.closest('.field').classList.toggle('is-invalid', !valid);
    if (!valid) ok = false;
  });
  if (!ok) { showToast(i18n.t('Please fill in your name and a valid email')); return; }
  form.reset();
  inquiry = []; saveInquiry(); renderInquiry();
  $('.form__success', form).hidden = false;
  showToast(i18n.t('Enquiry sent. Speak soon!'));
});

/* ---------- Channel tabs ---------- */
const tabs = $$('.channels__tabs [role="tab"]');
function selectTab(tab) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    panel.hidden = !on;
    if (on) $$('.reveal', panel).forEach(el => el.classList.add('is-in'));
  });
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', e => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    selectTab(next); next.focus();
  });
});

/* ---------- Enquiry links pre-fill the form ---------- */
$$('.case__link').forEach(link => {
  link.addEventListener('click', () => {
    if (!form) return;
    const radio = form.querySelector(`input[name="type"][value="${link.dataset.type}"]`);
    if (radio) radio.checked = true;
    form.querySelector('textarea').value = i18n.f('interested', i18n.t(link.dataset.case));
  });
});

/* ---------- Gallery: drag to scroll on desktop ---------- */
const track = $('.gallery__track');
if (track) {
  let dragX = null, startScroll = 0;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    dragX = e.clientX; startScroll = track.scrollLeft;
    track.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', e => { if (dragX !== null) track.scrollLeft = startScroll - (e.clientX - dragX); });
  window.addEventListener('pointerup', () => { dragX = null; track.classList.remove('is-dragging'); });
}

/* ---------- Catalog PDF follows the language ---------- */
const pdfLink = $('.catalog__pdf');
const syncPdf = () => {
  if (!pdfLink) return;
  pdfLink.dataset.hrefEn ??= pdfLink.getAttribute('href');
  pdfLink.setAttribute('href', i18n.lang === 'fr' ? pdfLink.dataset.hrefFr : pdfLink.dataset.hrefEn);
};
syncPdf();

/* =================== RETAIL (shop.html) =================== */

let bag = 0;
$$('.add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    bag++;
    const name = btn.closest('.box').querySelector('h3').textContent;
    showToast(i18n.f('added', name, bag));
    btn.textContent = i18n.t('Added ✓');
    setTimeout(() => (btn.textContent = i18n.t('Add to bag')), 1600);
  });
});

/* ---------- Build your own box ---------- */
const builder = $('#builder');
let renderBuilder = () => {};
if (builder) {
  const sizeInputs = $$('input[name="size"]', builder);
  const rows = $$('.builder__list li', builder);
  const bar = $('.builder__bar span', builder);
  const status = $('.builder__status', builder);
  const priceEl = $('.builder__price', builder);
  const addBox = $('.builder__add', builder);
  const counts = new Map(rows.map(r => [r, 0]));
  const boxSize = () => +sizeInputs.find(i => i.checked).value;
  const total = () => [...counts.values()].reduce((a, b) => a + b, 0);

  renderBuilder = () => {
    const size = boxSize(), n = total();
    rows.forEach(r => {
      const c = counts.get(r);
      $('output', r).textContent = c;
      r.classList.toggle('has-qty', c > 0);
      const [minus, plus] = $$('button', r);
      minus.disabled = c === 0;
      plus.disabled = n >= size;
    });
    bar.style.width = `${(n / size) * 100}%`;
    status.textContent = n === size ? i18n.t('Box full! Ready to add.') : i18n.f('chosen', n, size);
    priceEl.textContent = i18n.price(sizeInputs.find(i => i.checked).dataset.price);
    addBox.disabled = n !== size;
  };

  rows.forEach(r => {
    const [minus, plus] = $$('button', r);
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
    showToast(i18n.f('boxAdded', boxSize(), bag));
    rows.forEach(r => counts.set(r, 0));
    renderBuilder();
  });
  renderBuilder();
}

document.addEventListener('langchange', () => {
  renderBuilder();
  renderInquiry();
  syncPdf();
  toast.classList.remove('is-visible');
});
