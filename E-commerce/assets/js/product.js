/* product.js — the product detail page: gallery, variants, tabs, related. */

const PIN_PREFIXES_METRO = ['110', '400', '560', '600', '500', '700', '411', '380', '302', '641'];

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-pdp-root]');
  const slug = new URLSearchParams(location.search).get('p');
  const product = slug ? catalog.bySlug(slug) : null;

  if (!product) {
    root.innerHTML = `
      <div class="wrap">
        <div class="empty">
          <h1>We can't find that seed</h1>
          <p>The product you asked for isn't in our catalog — it may have been renamed or sold out for the season.</p>
          <a class="btn" href="collections.html">Browse all seeds</a>
        </div>
      </div>`;
    return;
  }

  document.title = `${product.name} — SeedNest`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', product.tagline);

  /* View state, local to this page. */
  const view = {
    variantId: (product.variants[0] || {}).id,
    qty: 1,
    image: 0,
    tab: 'description'
  };

  render();

  /* ------------------------------------------------------------- render */

  function render() {
    const { price, mrp, off, variant } = priceOf(product, view.variantId);
    const cat = catalog.categories.find(c => c.slug === product.category);
    const related = catalog.related(product, 4);

    root.innerHTML = `
      <div class="wrap">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Home</a><span>/</span>
          <a href="collections.html?c=${product.category}">${catalog.escapeHtml(cat.name)}</a><span>/</span>
          <span>${catalog.escapeHtml(product.name)}</span>
        </nav>

        <div class="pdp">
          <!-- ------------------------------------------------- gallery -->
          <div class="gallery">
            <div class="gallery__main">
              <div class="gallery__flags">
                ${product.badge ? `<span class="badge${product.badge === 'New' ? ' badge--new' : ''}">${product.badge}</span>` : ''}
                <span class="badge badge--sale">${off}% off</span>
              </div>
              <div data-gallery-main>${catalog.art(product, { view: view.image })}</div>
            </div>
            <div class="gallery__thumbs" role="tablist" aria-label="Product images">
              ${[0, 1, 2].map(i => `
                <button class="gallery__thumb" type="button" role="tab"
                  aria-selected="${i === view.image}" aria-label="View ${i + 1} of 3" data-thumb="${i}">
                  ${catalog.art(product, { view: i })}
                </button>`).join('')}
            </div>
          </div>

          <!-- ----------------------------------------------- buy panel -->
          <div>
            <p class="eyebrow">${catalog.escapeHtml(cat.name)}</p>
            <h1 class="pdp__title">${catalog.escapeHtml(product.name)}</h1>
            <p class="lede">${catalog.escapeHtml(product.tagline)}</p>

            <p class="card__meta" style="margin-top:14px">
              ${product.seeds ? product.seeds.toLocaleString('en-IN') + ' seeds' : 'Hardware only'}
              &#183; ${product.sold.toLocaleString('en-IN')} sold
            </p>

            <div class="pdp__price">
              <span class="price__now">${inr(price)}</span>
              <span class="price__was">${inr(mrp)}</span>
              <span class="badge badge--sale">Save ${inr(mrp - price)} (${off}%)</span>
            </div>
            <p class="pdp__tax">Inclusive of all taxes · Free shipping over ${inr(FREE_SHIP_OVER)}</p>

            ${product.variants.length > 1 ? `
              <div class="opt-group">
                <div class="opt-group__label">
                  <span>Pack size</span>
                  <span style="text-transform:none;letter-spacing:0;font-weight:400;color:var(--text-muted)">${catalog.escapeHtml(variant.note)}</span>
                </div>
                <div class="opt-list">
                  ${product.variants.map(v => {
                    const vp = priceOf(product, v.id);
                    return `<button class="opt" type="button" data-variant="${v.id}" aria-pressed="${v.id === view.variantId}">
                      <strong>${catalog.escapeHtml(v.label)} · ${inr(vp.price)}</strong>
                      <span>${catalog.escapeHtml(v.note)}</span>
                    </button>`;
                  }).join('')}
                </div>
              </div>` : ''}

            <div class="opt-group">
              <div class="opt-group__label"><span>Quantity</span></div>
              <div class="qty" data-pdp-qty>
                <button type="button" data-qty-step="-1" aria-label="Decrease quantity"${view.qty <= 1 ? ' disabled' : ''}>−</button>
                <input type="number" min="1" max="99" value="${view.qty}" aria-label="Quantity" data-qty-input>
                <button type="button" data-qty-step="1" aria-label="Increase quantity">+</button>
              </div>
            </div>

            <div class="pdp__buy">
              <button class="btn btn--lg" type="button" data-add-to-cart>${icon('cart', 18)} Add to cart</button>
              <button class="btn btn--accent btn--lg" type="button" data-buy-now>Buy now</button>
              <button class="icon-btn" type="button" data-wish="${product.slug}"
                aria-pressed="${wishlist.has(product.slug)}" aria-label="Save to wishlist"
                style="width:50px;height:50px;flex:0 0 auto">${icon('heart')}</button>
            </div>

            <ul class="usp-list">
              ${product.highlights.map(h => `<li>${icon('check', 17)}<span>${catalog.escapeHtml(h)}</span></li>`).join('')}
            </ul>

            <div class="deliver">
              <strong>${icon('truck', 16)} Check delivery to your pincode</strong>
              <form class="deliver__row" data-pin-form>
                <label class="visually-hidden" for="pin">Pincode</label>
                <input id="pin" class="field" inputmode="numeric" maxlength="6" placeholder="6-digit pincode" autocomplete="postal-code">
                <button class="btn btn--ghost" type="submit">Check</button>
              </form>
              <p class="deliver__out" data-pin-out role="status"></p>
            </div>

            <ul class="usp-list" style="margin-top:22px;padding-top:20px;border-top:1px solid var(--line)">
              <li>${icon('shield', 17)}<span><strong>98% germination guarantee</strong> — free replacement within 30 days</span></li>
              <li>${icon('truck', 17)}<span><strong>Dispatched in 24 hours</strong> — 3–7 days across India</span></li>
              <li>${icon('lock', 17)}<span><strong>Secure checkout</strong> — UPI, cards, netbanking and COD</span></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ---------------------------------------------------------- tabs -->
      <section class="section section--paper" id="details">
        <div class="wrap">
          <div class="tabs" role="tablist" aria-label="Product information">
            ${tabDef().map(t => `<button class="tab" type="button" role="tab"
              aria-selected="${t.id === view.tab}" data-tab="${t.id}">${t.label}</button>`).join('')}
          </div>

          <div class="tabpanel" role="tabpanel" data-panel="description" ${view.tab === 'description' ? '' : 'hidden'}>
            <div style="max-width:70ch">
              <p style="font-size:15px;line-height:1.8;color:var(--ink-700)">${catalog.escapeHtml(product.description)}</p>
              <h3 style="margin:26px 0 12px">How to grow</h3>
              <p>${growingNotes(product)}</p>
            </div>
          </div>

          <div class="tabpanel" role="tabpanel" data-panel="specs" ${view.tab === 'specs' ? '' : 'hidden'}>
            <table class="spec-table">
              <caption class="visually-hidden">Product specifications</caption>
              <tbody>
                ${Object.entries({ ...product.specs, ...specBase() })
                  .map(([k, v]) => `<tr><th scope="row">${catalog.escapeHtml(k)}</th><td>${catalog.escapeHtml(v)}</td></tr>`)
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="tabpanel" role="tabpanel" data-panel="faq" ${view.tab === 'faq' ? '' : 'hidden'}>
            <div style="max-width:76ch">
              ${product.faqs.map(f => `
                <details class="faq">
                  <summary>${catalog.escapeHtml(f.q)}</summary>
                  <p>${catalog.escapeHtml(f.a)}</p>
                </details>`).join('')}
            </div>
          </div>

        </div>
      </section>

      <!-- ------------------------------------------------------- related -->
      <section class="section">
        <div class="wrap">
          <div class="section-head">
            <div>
              <p class="eyebrow">Grown together</p>
              <h2>You may also like</h2>
            </div>
            <a class="btn btn--ghost btn--sm" href="collections.html?c=${product.category}">More ${catalog.escapeHtml(cat.name.toLowerCase())}</a>
          </div>
          <div class="grid grid--4" data-related>${related.map(productCard).join('')}</div>
        </div>
      </section>`;

    wire();
  }

  /* --------------------------------------------------------------- wire */

  function wire() {
    root.querySelectorAll('[data-thumb]').forEach(btn => {
      btn.addEventListener('click', () => {
        view.image = Number(btn.dataset.thumb);
        root.querySelector('[data-gallery-main]').innerHTML = catalog.art(product, { view: view.image });
        root.querySelectorAll('[data-thumb]').forEach(b =>
          b.setAttribute('aria-selected', String(b === btn)));
      });
    });

    root.querySelectorAll('[data-variant]').forEach(btn => {
      btn.addEventListener('click', () => {
        view.variantId = btn.dataset.variant;
        render();
      });
    });

    const qtyInput = root.querySelector('[data-qty-input]');
    root.querySelectorAll('[data-qty-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        view.qty = clampQty(view.qty + Number(btn.dataset.qtyStep));
        qtyInput.value = view.qty;
        root.querySelector('[data-qty-step="-1"]').disabled = view.qty <= 1;
      });
    });
    qtyInput.addEventListener('change', () => {
      view.qty = clampQty(parseInt(qtyInput.value, 10) || 1);
      qtyInput.value = view.qty;
      root.querySelector('[data-qty-step="-1"]').disabled = view.qty <= 1;
    });

    root.querySelector('[data-add-to-cart]').addEventListener('click', () => {
      cart.add(product.slug, view.variantId, view.qty);
      toast(`${product.name} added to cart`);
      openDrawer();
    });

    root.querySelector('[data-buy-now]').addEventListener('click', () => {
      cart.add(product.slug, view.variantId, view.qty);
      location.href = 'checkout.html';
    });

    root.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        view.tab = btn.dataset.tab;
        root.querySelectorAll('[data-tab]').forEach(b =>
          b.setAttribute('aria-selected', String(b.dataset.tab === view.tab)));
        root.querySelectorAll('[data-panel]').forEach(p => {
          p.hidden = p.dataset.panel !== view.tab;
        });
      });
    });

    const pinForm = root.querySelector('[data-pin-form]');
    pinForm.addEventListener('submit', e => {
      e.preventDefault();
      const out = root.querySelector('[data-pin-out]');
      const pin = pinForm.querySelector('#pin').value.trim();
      if (!/^\d{6}$/.test(pin)) {
        out.className = 'deliver__out bad';
        out.textContent = 'Please enter a valid 6-digit pincode.';
        return;
      }
      const fast = PIN_PREFIXES_METRO.includes(pin.slice(0, 3));
      const days = fast ? 3 : 5 + (Number(pin[5]) % 3);
      const eta = new Date(Date.now() + days * 86400000);
      out.className = 'deliver__out ok';
      out.textContent = `Delivers to ${pin} by ${eta.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · ${fast ? 'Express route' : 'Standard route'} · COD available`;
    });

    /* Wishlist button on the buy panel shares the card handler contract. */
    bindProductCards(root);
  }

  /* ------------------------------------------------------------ content */

  function tabDef() {
    return [
      { id: 'description', label: 'Description' },
      { id: 'specs', label: 'Specifications' },
      { id: 'faq', label: `FAQ (${product.faqs.length})` }
    ];
  }

  function specBase() {
    return {
      'Country of Origin': 'India',
      'Manufactured & Packed By': 'SeedNest Horticulture Pvt. Ltd., Dehradun, Uttarakhand 248001',
      'Marketed By': 'SeedNest Horticulture Pvt. Ltd.',
      'Customer Care': 'support@seedsnest.in · +91 74550 25717',
      'Seed Treatment': 'Untreated · Non-GMO · Open pollinated',
      'Shelf Life': '24 months from packing when stored cool and dry',
      'Net Quantity': `1 ${product.category === 'combo-packs' ? 'kit' : 'pack'}`
    };
  }

  function growingNotes(p) {
    if (p.category === 'microgreens') {
      return 'Fill a shallow tray with about an inch of moist coco peat and level it. Scatter the seed densely across the surface — microgreens are sown far thicker than you would sow a vegetable bed — and press it gently into the medium without burying it. Cover for the first two to three days to keep the humidity up, then move to indirect light and mist twice daily. Cut just above the soil line when the first true leaves appear.';
    }
    if (p.category === 'tree-seeds' || p.category === 'bamboo-seeds') {
      return 'Sow into a deep pot of free-draining mix at roughly twice the seed\'s own depth, following any pre-treatment noted in the specifications. Keep the medium consistently moist but never waterlogged, and hold the pot somewhere warm and bright while it germinates. Transplant to the final position once the seedling is 20–30 cm tall and has hardened off over a week outdoors.';
    }
    if (p.category === 'herb-seeds') {
      return 'Sow shallowly into moist potting mix — most herb seed needs light to germinate, so barely cover it. Keep it evenly damp until seedlings appear, then thin to give each plant room. Pinch the growing tips regularly rather than stripping whole stems: it keeps the plant bushy and delays flowering, which is what ends the harvest.';
    }
    return 'Sow into well-worked soil or a grow bag at the spacing given in the specifications, about 1 cm deep. Water in gently and keep the bed evenly moist until seedlings establish. Feed with compost or a balanced organic fertiliser every three weeks once the plants are away, and stake or trellis anything that climbs before it needs it rather than after.';
  }

  function clampQty(n) {
    return Math.max(1, Math.min(99, n));
  }
});
