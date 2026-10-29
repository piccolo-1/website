/* ============================================================
   Les délices Nadia — Shopify theme interactions
   Every block checks its section exists, so sections can be
   removed or reordered in the theme editor.
   ============================================================ */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const designMode = !!(window.Shopify && window.Shopify.designMode);
  const T = (window.theme && window.theme.strings) || {};
  const R = (window.theme && window.theme.routes) || { cartAdd: '/cart/add.js', cart: '/cart', cartJs: '/cart.js' };
  const fill = (str, vars) => Object.entries(vars).reduce((s, [k, v]) => s.split(`[${k}]`).join(v), str || '');

  /* ---------- Loader (home page, once per visit) ---------- */
  const loader = document.querySelector('.loader');
  let seen = false;
  try { seen = sessionStorage.getItem('ldn-loaded') === '1'; sessionStorage.setItem('ldn-loaded', '1'); } catch (e) {}
  function finishLoading() {
    if (loader) loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    setTimeout(() => document.body.classList.add('is-ready'), loader && !seen ? 250 : 0);
  }
  if (loader && !seen && !designMode && !reduceMotion) {
    document.body.classList.add('is-loading');
    window.addEventListener('load', () => setTimeout(finishLoading, 900));
    setTimeout(finishLoading, 3500);
  } else {
    if (loader) loader.remove();
    finishLoading();
  }

  /* ---------- Nav ---------- */
  const nav = document.querySelector('.nav');
  let lastY = 0;
  function onNavScroll() {
    if (!nav) return;
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > lastY && y > 400 && !document.body.classList.contains('menu-open'));
    lastY = y;
  }

  const burger = document.querySelector('.nav__burger');
  const menu = document.querySelector('.menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger && menu) {
    burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  }

  /* ---------- Toast ---------- */
  const toast = document.querySelector('.toast');
  let toastTimer;
  function showToast(msg, withBagLink) {
    if (!toast) return;
    toast.textContent = msg;
    if (withBagLink) {
      const a = document.createElement('a');
      a.href = R.cart; a.textContent = T.viewBag;
      toast.append(a);
    }
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4000);
  }

  /* ---------- Cart ---------- */
  async function refreshCount() {
    try {
      const cart = await (await fetch(R.cartJs, { headers: { Accept: 'application/json' } })).json();
      document.querySelectorAll('[data-cart-count]').forEach(el => {
        el.textContent = cart.item_count;
        el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      });
    } catch (e) {}
  }
  async function addToCart(items) {
    const res = await fetch(R.cartAdd, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error((await res.json()).description || 'add failed');
    refreshCount();
  }

  /* ---------- Per-section setup (runs again when a section reloads in the editor) ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count || 0;
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

  let quoteTimer;

  function init(root) {
    // reveal
    root.querySelectorAll('.reveal').forEach(el => {
      if (designMode) { el.classList.add('is-in'); return; }
      const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(el);
      if (idx > 0) el.style.setProperty('--delay', `${Math.min(idx * 0.08, 0.5)}s`);
      revealObserver.observe(el);
    });
    root.querySelectorAll('[data-count]').forEach(el => designMode ? (el.textContent = el.dataset.count) : countObserver.observe(el));

    // testimonials
    const quotes = [...root.querySelectorAll('.quote')];
    const dots = [...root.querySelectorAll('.quotes__dots button')];
    if (quotes.length) {
      let current = 0;
      const show = i => {
        quotes[current].classList.remove('is-active'); dots[current]?.classList.remove('is-active');
        current = i;
        quotes[current].classList.add('is-active'); dots[current]?.classList.add('is-active');
      };
      const start = () => { clearInterval(quoteTimer); quoteTimer = setInterval(() => show((current + 1) % quotes.length), 6000); };
      dots.forEach((d, i) => d.addEventListener('click', () => { show(i); start(); }));
      start();
    }

    // ready-made boxes
    root.querySelectorAll('.add-btn[data-variant-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          await addToCart([{ id: +btn.dataset.variantId, quantity: 1 }]);
          showToast(fill(T.addedToast, { item: btn.dataset.name }), true);
          btn.textContent = T.added;
          setTimeout(() => { btn.textContent = T.addToBag; btn.disabled = false; }, 1600);
        } catch (e) {
          showToast(T.addError);
          btn.disabled = false;
        }
      });
    });

    // build your own box
    const builder = root.querySelector('#builder');
    if (builder) {
      const sizeInputs = [...builder.querySelectorAll('input[name="builder-size"]')];
      const rows = [...builder.querySelectorAll('.builder__list li')];
      const bar = builder.querySelector('.builder__bar span');
      const status = builder.querySelector('.builder__status');
      const priceEl = builder.querySelector('.builder__price');
      const addBox = builder.querySelector('.builder__add');
      const counts = new Map(rows.map(r => [r, 0]));
      const selected = () => sizeInputs.find(i => i.checked) || sizeInputs[0];
      const boxSize = () => +selected().dataset.size || 0;
      const total = () => [...counts.values()].reduce((a, b) => a + b, 0);

      const render = () => {
        const size = boxSize(), n = total();
        rows.forEach(r => {
          const c = counts.get(r);
          r.querySelector('output').textContent = c;
          r.classList.toggle('has-qty', c > 0);
          const [minus, plus] = r.querySelectorAll('button');
          minus.disabled = c === 0;
          plus.disabled = n >= size;
        });
        bar.style.width = size ? `${(n / size) * 100}%` : '0';
        status.textContent = n === size && size ? T.full : fill(T.chosen, { n, size });
        priceEl.textContent = selected().dataset.price;
        addBox.disabled = !size || n !== size;
      };

      rows.forEach(r => {
        const [minus, plus] = r.querySelectorAll('button');
        plus.addEventListener('click', () => {
          counts.set(r, counts.get(r) + 1);
          r.classList.remove('bump'); void r.offsetWidth; r.classList.add('bump');
          setTimeout(() => r.classList.remove('bump'), 500);
          render();
        });
        minus.addEventListener('click', () => { counts.set(r, counts.get(r) - 1); render(); });
      });

      sizeInputs.forEach(i => i.addEventListener('change', () => {
        let over = total() - boxSize();
        for (const r of [...rows].reverse()) {
          if (over <= 0) break;
          const take = Math.min(counts.get(r), over);
          counts.set(r, counts.get(r) - take);
          over -= take;
        }
        render();
      }));

      addBox.addEventListener('click', async () => {
        // the chosen flavours travel with the order as line item properties
        const properties = {};
        rows.forEach(r => { if (counts.get(r)) properties[r.dataset.flavour] = counts.get(r); });
        addBox.disabled = true;
        try {
          await addToCart([{ id: +selected().value, quantity: 1, properties }]);
          showToast(fill(T.addedToast, { item: fill(T.boxName, { size: boxSize() }) }), true);
          rows.forEach(r => counts.set(r, 0));
        } catch (e) {
          showToast(T.addError);
        }
        render();
      });

      render();
    }

    // retail & wholesale tabs
    const tabs = [...root.querySelectorAll('.channels__tabs [role="tab"]')];
    const selectTab = tab => tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = !on;
        if (on) panel.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
      }
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => selectTab(t));
      t.addEventListener('keydown', e => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        const next = tabs[(i + dir + tabs.length) % tabs.length];
        selectTab(next); next.focus();
      });
    });

    // enquiry links pre-fill the contact form
    root.querySelectorAll('.case__link[data-what]').forEach(link => {
      link.addEventListener('click', () => {
        const form = document.getElementById('ContactForm');
        if (!form) return;
        const radio = form.querySelector(`input[data-type="${link.dataset.type}"]`);
        if (radio) radio.checked = true;
        const body = form.querySelector('textarea');
        if (body) body.value = fill(T.interested, { what: link.dataset.what });
      });
    });

    // gallery drag-to-scroll
    const track = root.querySelector('.gallery__track');
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
  }

  init(document);
  document.addEventListener('shopify:section:load', e => init(e.target));

  /* ---------- Contact form: light check before sending, then return to it ---------- */
  document.addEventListener('submit', e => {
    const form = e.target;
    if (form.id !== 'ContactForm') return;
    let ok = true;
    form.querySelectorAll('[required]').forEach(input => {
      const valid = input.value.trim() && (input.type !== 'email' || /^\S+@\S+\.\S+$/.test(input.value));
      input.closest('.field')?.classList.toggle('is-invalid', !valid);
      if (!valid) ok = false;
    });
    if (!ok) { e.preventDefault(); showToast(T.formInvalid); }
  });
  const posted = document.querySelector('#ContactForm [data-posted]');
  if (posted) setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 300);
  if (/customer_posted=true/.test(location.search)) setTimeout(() => document.querySelector('.footer')?.scrollIntoView(), 300);

  /* ---------- Product page: price follows the chosen variant ---------- */
  const variantSelect = document.getElementById('ProductVariant');
  const priceTag = document.querySelector('[data-product-price]');
  if (variantSelect && priceTag) {
    variantSelect.addEventListener('change', () => {
      const opt = variantSelect.selectedOptions[0];
      if (opt && opt.dataset.price) priceTag.textContent = opt.dataset.price;
    });
  }

  /* ---------- Parallax ---------- */
  let mouseX = 0, mouseY = 0, ticking = false;
  const requestFrame = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };
  function update() {
    onNavScroll();
    if (reduceMotion) return;
    const y = window.scrollY;
    const heroMain = document.querySelector('.hero__cookie--main');
    const heroA = document.querySelector('.hero__polaroid--b');
    const heroB = document.querySelector('.hero__polaroid--a');
    if (heroMain && y < window.innerHeight * 1.2) {
      heroMain.style.translate = `${mouseX * -20}px ${y * 0.12 + mouseY * -20}px`;
      if (heroA) heroA.style.transform = `translate(${mouseX * 40}px, ${y * -0.25 + mouseY * 40}px)`;
      if (heroB) heroB.style.transform = `translate(${mouseX * 30}px, ${y * -0.1 + mouseY * 30}px)`;
    }
    const story = document.querySelector('.story');
    const storyCookie = document.querySelector('.story__cookie');
    if (story && storyCookie) {
      const r = story.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        const progress = (window.innerHeight - r.top) / (r.height + window.innerHeight);
        storyCookie.style.transform = `rotate(${progress * 360}deg) scale(${0.85 + Math.sin(progress * Math.PI) * 0.2})`;
      }
    }
  }
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
    requestFrame();
  }, { passive: true });
  window.addEventListener('scroll', requestFrame, { passive: true });
  update();
})();
