/* ==========================================================================
   store.js — cart state, shared chrome (header/footer/drawer), pricing.
   Loaded on every page, after catalog.js.
   ========================================================================== */

const CART_KEY = 'seednest.cart.v1';
const WISH_KEY = 'seednest.wishlist.v1';
const ORDER_KEY = 'seednest.orders.v1';

const FREE_SHIP_OVER = 499;
const SHIP_FEE = 49;

const COUPONS = {
  SPROUT10: { kind: 'percent', value: 10, min: 0, label: '10% off your order' },
  WELCOME50: { kind: 'flat', value: 50, min: 399, label: '₹50 off orders over ₹399' },
  FREESHIP: { kind: 'shipping', value: 0, min: 0, label: 'Free shipping, any order value' }
};

/* ------------------------------------------------------------ storage ---- */

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota — the session keeps working, it just won't persist */
  }
}

/* ------------------------------------------------------------- pricing ---- */

const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');

/** Resolve a product + variant id into its effective price and MRP. */
function priceOf(product, variantId) {
  const variant = (product.variants || []).find(v => v.id === variantId) || (product.variants || [])[0];
  const mult = variant ? variant.multiplier : 1;
  return {
    variant,
    price: Math.round(product.price * mult),
    mrp: Math.round(product.mrp * mult),
    off: Math.round((1 - product.price / product.mrp) * 100)
  };
}

/* ---------------------------------------------------------------- cart ---- */

const cart = {
  items: read(CART_KEY, []),
  coupon: read(CART_KEY + '.coupon', null),

  save() {
    write(CART_KEY, this.items);
    write(CART_KEY + '.coupon', this.coupon);
    document.dispatchEvent(new CustomEvent('cart:change'));
  },

  add(slug, variantId, qty = 1) {
    const existing = this.items.find(i => i.slug === slug && i.variantId === variantId);
    if (existing) existing.qty = Math.min(99, existing.qty + qty);
    else this.items.push({ slug, variantId, qty: Math.min(99, qty) });
    this.save();
  },

  setQty(slug, variantId, qty) {
    const item = this.items.find(i => i.slug === slug && i.variantId === variantId);
    if (!item) return;
    if (qty <= 0) return this.remove(slug, variantId);
    item.qty = Math.min(99, qty);
    this.save();
  },

  remove(slug, variantId) {
    this.items = this.items.filter(i => !(i.slug === slug && i.variantId === variantId));
    this.save();
  },

  clear() {
    this.items = [];
    this.coupon = null;
    this.save();
  },

  count() {
    return this.items.reduce((n, i) => n + i.qty, 0);
  },

  /** Join cart lines against the catalog, dropping anything no longer stocked. */
  detailed() {
    return this.items
      .map(item => {
        const product = catalog.bySlug(item.slug);
        if (!product) return null;
        const p = priceOf(product, item.variantId);
        return { ...item, product, ...p, lineTotal: p.price * item.qty, lineMrp: p.mrp * item.qty };
      })
      .filter(Boolean);
  },

  applyCoupon(code) {
    const key = String(code || '').trim().toUpperCase();
    const def = COUPONS[key];
    if (!def) return { ok: false, message: 'That code is not valid.' };
    if (this.totals().subtotal < def.min) {
      return { ok: false, message: `Add ${inr(def.min - this.totals().subtotal)} more to use ${key}.` };
    }
    this.coupon = key;
    this.save();
    return { ok: true, message: `${key} applied — ${def.label}.` };
  },

  removeCoupon() {
    this.coupon = null;
    this.save();
  },

  totals() {
    const lines = this.detailed();
    const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
    const mrpTotal = lines.reduce((n, l) => n + l.lineMrp, 0);
    const def = this.coupon ? COUPONS[this.coupon] : null;

    let discount = 0;
    let freeShipOverride = false;
    if (def && subtotal >= def.min) {
      if (def.kind === 'percent') discount = Math.round(subtotal * def.value / 100);
      else if (def.kind === 'flat') discount = def.value;
      else if (def.kind === 'shipping') freeShipOverride = true;
    }

    const afterDiscount = Math.max(0, subtotal - discount);
    const shipping = subtotal === 0 || freeShipOverride || subtotal >= FREE_SHIP_OVER ? 0 : SHIP_FEE;

    return {
      lines,
      subtotal,
      savedOnMrp: mrpTotal - subtotal,
      discount,
      shipping,
      total: afterDiscount + shipping,
      toFreeShip: Math.max(0, FREE_SHIP_OVER - subtotal),
      freeShipProgress: Math.min(100, (subtotal / FREE_SHIP_OVER) * 100)
    };
  }
};

/* ----------------------------------------------------------- wishlist ---- */

const wishlist = {
  slugs: read(WISH_KEY, []),
  has(slug) { return this.slugs.includes(slug); },
  toggle(slug) {
    const on = this.has(slug);
    this.slugs = on ? this.slugs.filter(s => s !== slug) : [...this.slugs, slug];
    write(WISH_KEY, this.slugs);
    document.dispatchEvent(new CustomEvent('wishlist:change'));
    return !on;
  }
};

/* -------------------------------------------------------------- orders ---- */

const orders = {
  all() { return read(ORDER_KEY, []); },
  place(order) {
    const list = this.all();
    list.unshift(order);
    write(ORDER_KEY, list.slice(0, 20));
  },
  find(id) { return this.all().find(o => o.id === id); }
};

/* --------------------------------------------------------------- toast ---- */

function toast(message) {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `${icon('check', 18)}<span>${catalog.escapeHtml(message)}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.dataset.leaving = 'true';
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 2600);
}

/* --------------------------------------------------------------- icons ---- */

const ICON_PATHS = {
  cart: '<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6"/>',
  heart: '<path d="M12 20.5s-7.6-4.8-7.6-10A4.4 4.4 0 0 1 12 8.2a4.4 4.4 0 0 1 7.6 2.3c0 5.2-7.6 10-7.6 10z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  leaf: '<path d="M4 20c0-9 7-16 16-16 0 9-7 16-16 16z"/><path d="M4 20c4-6 8-9 13-11"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9z"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5"/>',
  sprout: '<path d="M12 21v-8"/><path d="M12 13c0-4-3-7-7-7 0 4 3 7 7 7z"/><path d="M12 13c0-4 3-7 7-7 0 4-3 7-7 7z"/>',
  star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/>',
  lock: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8S9.5 3.5 7 5s1 3 5 3zM12 8s2.5-4.5 5-3-1 3-5 3z"/>'
};

function icon(name, size = 20, extra = '') {
  const d = ICON_PATHS[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
}

/* ------------------------------------------------------- shared chrome ---- */

const NAV_LINKS = [
  { href: 'index.html', label: 'Home' },
  { href: 'collections.html?c=growing-kits', label: 'Kits' },
  { href: 'collections.html?c=microgreens', label: 'Microgreens' },
  { href: 'collections.html?c=vegetable-seeds', label: 'Vegetables' },
  { href: 'collections.html?c=herb-seeds', label: 'Herbs' },
  { href: 'collections.html?c=combo-packs', label: 'Combos' },
  { href: 'collections.html', label: 'Shop all' }
];

function renderChrome() {
  const page = document.body.dataset.page || '';
  const header = document.querySelector('[data-chrome="header"]');
  const footer = document.querySelector('[data-chrome="footer"]');

  if (header) {
    header.innerHTML = `
      <div class="announce">
        <div class="wrap announce__inner">
          <span>${icon('truck', 15)}</span>
          <span>Free shipping over <strong>₹499</strong> · 98% germination guarantee</span>
          <span class="announce__timer">Monsoon Sale ends in
            <span class="countdown" data-countdown>
              <span data-cd="d">00</span><span data-cd="h">00</span><span data-cd="m">00</span><span data-cd="s">00</span>
            </span>
          </span>
        </div>
      </div>
      <div class="header">
        <div class="wrap header__bar">
          <a class="logo" href="index.html">
            <span class="logo__mark">${icon('sprout', 20, 'stroke="#fff"')}</span>
            SeedNest
          </a>
          <nav class="nav" id="site-nav" aria-label="Primary">
            ${NAV_LINKS.map(l => `<a href="${l.href}"${navCurrent(l, page)}>${l.label}</a>`).join('')}
          </nav>
          <div class="header__actions">
            <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Menu" data-nav-toggle>
              ${icon('menu')}
            </button>
            <a class="icon-btn" href="collections.html" aria-label="Search products">${icon('search')}</a>
            <button class="icon-btn" type="button" aria-label="Open cart" data-cart-open>
              ${icon('cart')}
              <span class="cart-count" data-cart-count hidden>0</span>
            </button>
          </div>
        </div>
      </div>`;

    header.querySelector('[data-nav-toggle]').addEventListener('click', e => {
      const nav = header.querySelector('#site-nav');
      const open = nav.dataset.open !== 'true';
      nav.dataset.open = String(open);
      e.currentTarget.setAttribute('aria-expanded', String(open));
      document.documentElement.style.setProperty('--header-offset', header.offsetHeight + 'px');
    });
    header.querySelector('[data-cart-open]').addEventListener('click', openDrawer);
    startCountdown(header);
  }

  if (footer) {
    footer.innerHTML = `
      <footer class="footer">
        <div class="wrap footer__grid">
          <div>
            <a class="logo" href="index.html">
              <span class="logo__mark">${icon('sprout', 20, 'stroke="#fff"')}</span>
              SeedNest
            </a>
            <p>Microgreens growing kits and non-GMO, open-pollinated seed from a 30-year-old Dehradun seed house. Backed by a 98% germination guarantee and shipped to 40+ countries.</p>
            <form class="newsletter" data-newsletter>
              <label class="visually-hidden" for="nl-email">Email address</label>
              <input id="nl-email" type="email" required placeholder="Growing tips, monthly" autocomplete="email">
              <button class="btn btn--accent btn--sm" type="submit">Join</button>
            </form>
            <div class="socials">
              <a href="#" data-stub aria-label="Instagram">${icon('chat', 17)}</a>
              <a href="#" data-stub aria-label="Facebook">${icon('globe', 17)}</a>
              <a href="#" data-stub aria-label="WhatsApp">${icon('chat', 17)}</a>
              <a href="#" data-stub aria-label="LinkedIn">${icon('user', 17)}</a>
            </div>
          </div>
          <div>
            <h3>Shop</h3>
            <ul>${catalog.categories.map(c =>
              `<li><a href="collections.html?c=${c.slug}">${c.name}</a></li>`).join('')}
            </ul>
          </div>
          <div>
            <h3>Information</h3>
            <ul>
              <li><a href="collections.html">All seeds</a></li>
              <li><a href="#" data-stub>Growing guides</a></li>
              <li><a href="#" data-stub>Germination guarantee</a></li>
              <li><a href="#" data-stub>Bulk &amp; nursery orders</a></li>
              <li><a href="#" data-stub>About SeedNest</a></li>
              <li><a href="#" data-stub>Contact us</a></li>
              <li><a href="credits.html">Image credits</a></li>
            </ul>
          </div>
          <div>
            <h3>Policies</h3>
            <ul>
              <li><a href="#" data-stub>Shipping policy</a></li>
              <li><a href="#" data-stub>Refund &amp; replacement</a></li>
              <li><a href="#" data-stub>Terms of service</a></li>
              <li><a href="#" data-stub>Privacy policy</a></li>
              <li><a href="#" data-stub>Phytosanitary info</a></li>
            </ul>
          </div>
        </div>
        <div class="wrap footer__bar">
          <span>© ${new Date().getFullYear()} SeedNest Horticulture Pvt. Ltd. · Dehradun, India</span>
          <span>support@seedsnest.in · +91 74550 25717</span>
        </div>
      </footer>`;

    const nl = footer.querySelector('[data-newsletter]');
    nl.addEventListener('submit', e => {
      e.preventDefault();
      toast('Thanks — check your inbox to confirm.');
      nl.reset();
    });
  }

  mountDrawer();
  syncCartCount();
}

function navCurrent(link, page) {
  const params = new URLSearchParams(location.search);
  const activeCat = params.get('c');
  const linkCat = new URLSearchParams(link.href.split('?')[1] || '').get('c');
  const samePage = link.href.split('?')[0] === (location.pathname.split('/').pop() || 'index.html');
  if (samePage && linkCat === activeCat) return ' aria-current="page"';
  if (page === 'home' && link.href === 'index.html') return ' aria-current="page"';
  return '';
}

/* ------------------------------------------------------------- drawer ---- */

let drawerEl, backdropEl;

function mountDrawer() {
  if (document.querySelector('[data-drawer]')) return;

  backdropEl = document.createElement('div');
  backdropEl.className = 'drawer-backdrop';
  backdropEl.addEventListener('click', closeDrawer);

  drawerEl = document.createElement('aside');
  drawerEl.className = 'drawer';
  drawerEl.setAttribute('data-drawer', '');
  drawerEl.setAttribute('role', 'dialog');
  drawerEl.setAttribute('aria-modal', 'true');
  drawerEl.setAttribute('aria-label', 'Shopping cart');
  drawerEl.innerHTML = `
    <div class="drawer__head">
      <h2>Your cart</h2>
      <button class="drawer__close" type="button" aria-label="Close cart" data-drawer-close>${icon('close', 22)}</button>
    </div>
    <div class="drawer__body" data-drawer-body></div>
    <div class="drawer__foot" data-drawer-foot></div>`;

  document.body.append(backdropEl, drawerEl);
  drawerEl.querySelector('[data-drawer-close]').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawerEl.dataset.open === 'true') closeDrawer();
  });
  renderDrawer();
}

function openDrawer() {
  renderDrawer();
  backdropEl.dataset.open = 'true';
  drawerEl.dataset.open = 'true';
  document.body.style.overflow = 'hidden';
  drawerEl.querySelector('[data-drawer-close]').focus();
}

function closeDrawer() {
  backdropEl.dataset.open = 'false';
  drawerEl.dataset.open = 'false';
  document.body.style.overflow = '';
}

function renderDrawer() {
  if (!drawerEl) return;
  const body = drawerEl.querySelector('[data-drawer-body]');
  const foot = drawerEl.querySelector('[data-drawer-foot]');
  const t = cart.totals();

  if (!t.lines.length) {
    body.innerHTML = `
      <div class="empty">
        <h2>Nothing here yet</h2>
        <p>Your cart is empty — the microgreens combo is where most people start.</p>
        <a class="btn" href="collections.html">Browse seeds</a>
      </div>`;
    foot.innerHTML = '';
    return;
  }

  body.innerHTML = t.lines.map(l => `
    <div class="line">
      <a class="line__art" href="product.html?p=${l.product.slug}">${catalog.art(l.product)}</a>
      <div>
        <a class="line__title" href="product.html?p=${l.product.slug}">${catalog.escapeHtml(l.product.name)}</a>
        <div class="line__variant">${catalog.escapeHtml(l.variant ? l.variant.label : '')}</div>
        <div class="line__controls">
          ${qtyControl(l.slug, l.variantId, l.qty)}
          <button class="line__remove" type="button" data-remove data-slug="${l.slug}" data-variant="${l.variantId}">Remove</button>
        </div>
      </div>
      <div class="line__price">${inr(l.lineTotal)}${l.lineMrp > l.lineTotal ? `<small>${inr(l.lineMrp)}</small>` : ''}</div>
    </div>`).join('');

  foot.innerHTML = `
    ${t.toFreeShip > 0
      ? `<p style="font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--warm-grey);margin-bottom:8px">Add <strong>${inr(t.toFreeShip)}</strong> for free shipping</p>
         <div class="ship-bar"><i style="width:${t.freeShipProgress}%"></i></div>`
      : `<p class="summary__free" style="font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;display:flex;gap:8px;align-items:center">${icon('check', 14)} Free shipping unlocked</p>`}
    <div class="summary__row summary__row--total"><span>Subtotal</span><span>${inr(t.subtotal)}</span></div>
    <a class="btn btn--block" href="checkout.html" style="margin-top:12px">Checkout · ${inr(t.total)}</a>
    <a class="btn btn--ghost btn--block" href="cart.html" style="margin-top:8px">View full cart</a>`;

  bindCartControls(body);
}

/* ------------------------------------------------- reusable cart bits ---- */

function qtyControl(slug, variantId, qty) {
  return `
    <div class="qty" data-qty>
      <button type="button" data-step="-1" data-slug="${slug}" data-variant="${variantId}" aria-label="Decrease quantity"${qty <= 1 ? ' disabled' : ''}>−</button>
      <input type="number" min="1" max="99" value="${qty}" data-slug="${slug}" data-variant="${variantId}" aria-label="Quantity">
      <button type="button" data-step="1" data-slug="${slug}" data-variant="${variantId}" aria-label="Increase quantity">+</button>
    </div>`;
}

/** Wire up +/-/input/remove inside any container that used qtyControl(). */
function bindCartControls(root) {
  root.querySelectorAll('[data-qty] button').forEach(btn => {
    btn.addEventListener('click', () => {
      const { slug, variant, step } = btn.dataset;
      const line = cart.items.find(i => i.slug === slug && i.variantId === variant);
      if (line) cart.setQty(slug, variant, line.qty + Number(step));
    });
  });
  root.querySelectorAll('[data-qty] input').forEach(input => {
    input.addEventListener('change', () => {
      const n = Math.max(1, Math.min(99, parseInt(input.value, 10) || 1));
      input.value = n;
      cart.setQty(input.dataset.slug, input.dataset.variant, n);
    });
  });
  root.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.remove(btn.dataset.slug, btn.dataset.variant);
      toast('Removed from cart');
    });
  });
}

function syncCartCount() {
  const n = cart.count();
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = n;
    el.hidden = n === 0;
  });
}

/* ------------------------------------------------------- product card ---- */

function productCard(product) {
  const { price, mrp, off } = priceOf(product, null);
  const wished = wishlist.has(product.slug);
  return `
    <article class="card">
      <div class="card__media">
        <div class="card__flags">
          ${product.badge ? `<span class="badge${product.badge === 'New' ? ' badge--new' : ''}">${product.badge}</span>` : ''}
          ${off >= 40 ? `<span class="badge badge--sale">${off}% off</span>` : ''}
        </div>
        <button class="card__wish" type="button" data-wish="${product.slug}"
          aria-pressed="${wished}" aria-label="Save ${catalog.escapeHtml(product.name)} to wishlist">
          ${icon('heart', 17)}
        </button>
        <a href="product.html?p=${product.slug}" aria-label="${catalog.escapeHtml(product.name)}">
          ${catalog.art(product)}
        </a>
      </div>
      <div class="card__body">
        <span class="card__cat">${catalog.categoryName(product.category)}</span>
        <a class="card__title" href="product.html?p=${product.slug}">${catalog.escapeHtml(product.name)}</a>
        <span class="card__meta">${product.seeds
          ? product.seeds.toLocaleString('en-IN') + ' seeds'
          : 'Hardware only'} · ${product.sold.toLocaleString('en-IN')} sold</span>
        <div class="card__foot">
          <span class="price">
            <span class="price__now">${inr(price)}</span>
            <span class="price__was">${inr(mrp)}</span>
          </span>
          <button class="btn btn--sm" type="button" data-add="${product.slug}">Add</button>
        </div>
      </div>
    </article>`;
}

/** Wire card-level add/wishlist buttons inside `root`. */
function bindProductCards(root) {
  root.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = catalog.bySlug(btn.dataset.add);
      if (!product) return;
      cart.add(product.slug, (product.variants[0] || {}).id, 1);
      toast(`${product.name} added to cart`);
    });
  });
  root.querySelectorAll('[data-wish]').forEach(btn => {
    btn.addEventListener('click', () => {
      const on = wishlist.toggle(btn.dataset.wish);
      btn.setAttribute('aria-pressed', String(on));
      toast(on ? 'Saved to wishlist' : 'Removed from wishlist');
    });
  });
}

/* ------------------------------------------------------------ countdown ---- */

function startCountdown(scope) {
  const root = scope.querySelector('[data-countdown]');
  if (!root) return;
  // Sale ends at the close of the coming Sunday — stable across reloads.
  const end = new Date();
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7 || 7));
  end.setHours(23, 59, 59, 0);

  const pad = n => String(Math.max(0, n)).padStart(2, '0');
  const tick = () => {
    const ms = end - Date.now();
    const s = Math.max(0, Math.floor(ms / 1000));
    root.querySelector('[data-cd="d"]').textContent = pad(Math.floor(s / 86400));
    root.querySelector('[data-cd="h"]').textContent = pad(Math.floor(s / 3600) % 24);
    root.querySelector('[data-cd="m"]').textContent = pad(Math.floor(s / 60) % 60);
    root.querySelector('[data-cd="s"]').textContent = pad(s % 60);
  };
  tick();
  setInterval(tick, 1000);
}

/* ---------------------------------------------------------------- boot ---- */

document.addEventListener('cart:change', () => {
  syncCartCount();
  renderDrawer();
});

/* Placeholder links: keep a click from jumping to the top of the page, and say
   plainly that the page is outside this mockup's scope. */
document.addEventListener('click', e => {
  const stub = e.target.closest('a[data-stub]');
  if (!stub) return;
  e.preventDefault();
  const name = (stub.getAttribute('aria-label') || stub.textContent).trim();
  toast(`${name} is not built in this mockup`);
});

document.addEventListener('DOMContentLoaded', renderChrome);

Object.assign(window, {
  cart, wishlist, orders, toast, icon, inr, priceOf,
  productCard, bindProductCards, bindCartControls, qtyControl,
  openDrawer, closeDrawer, COUPONS, FREE_SHIP_OVER, SHIP_FEE
});
