/* cart-page.js — the full cart view, coupon box and order summary. */

document.addEventListener('DOMContentLoaded', () => {
  const host = document.querySelector('[data-cart-page]');
  const crossSell = document.querySelector('[data-cross-sell]');
  const crossGrid = document.querySelector('[data-cross-grid]');

  render();
  document.addEventListener('cart:change', render);

  function render() {
    const t = cart.totals();

    if (!t.lines.length) {
      host.innerHTML = `
        <div class="empty">
          <h2>Your cart is empty</h2>
          <p>Nothing sown yet. The 7-in-1 microgreens combo is where most people start — first harvest inside a week.</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:8px">
            <a class="btn" href="collections.html">Browse all seeds</a>
            <a class="btn btn--ghost" href="product.html?p=7-in-1-microgreens-seed-combo">The 7-in-1 combo</a>
          </div>
        </div>`;
      crossSell.hidden = true;
      return;
    }

    host.innerHTML = `
      <div class="cart-layout">
        <div class="panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong>${t.lines.length} ${t.lines.length === 1 ? 'item' : 'items'}</strong>
            <button class="line__remove" type="button" data-clear-cart>Clear cart</button>
          </div>
          ${t.lines.map(line).join('')}
        </div>

        <aside class="panel summary">
          <h2 style="font-size:22px;margin-bottom:18px">Order summary</h2>

          ${t.toFreeShip > 0
            ? `<p style="font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--warm-grey);margin-bottom:6px">Add <strong>${inr(t.toFreeShip)}</strong> more for free shipping</p>
               <div class="ship-bar"><i style="width:${t.freeShipProgress}%"></i></div>`
            : `<p class="summary__free" style="font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;display:flex;gap:8px;align-items:center">
                 ${icon('check', 15)} You've unlocked free shipping</p>`}

          <form class="coupon" data-coupon-form>
            <label class="visually-hidden" for="coupon">Coupon code</label>
            <input class="field" id="coupon" placeholder="Coupon code" autocomplete="off"
              value="${cart.coupon || ''}" ${cart.coupon ? 'readonly' : ''}>
            <button class="btn btn--ghost" type="submit">${cart.coupon ? 'Remove' : 'Apply'}</button>
          </form>
          <p style="font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--warm-grey);margin-top:0">
            Try <strong>SPROUT10</strong>, <strong>WELCOME50</strong> or <strong>FREESHIP</strong>
          </p>
          <p data-coupon-msg style="font-size:11px;min-height:1.2em"></p>

          <div class="summary__row"><span>Subtotal</span><span>${inr(t.subtotal)}</span></div>
          ${t.savedOnMrp > 0 ? `<div class="summary__row summary__free"><span>MRP savings</span><span>− ${inr(t.savedOnMrp)}</span></div>` : ''}
          ${t.discount > 0 ? `<div class="summary__row summary__free"><span>Coupon ${cart.coupon}</span><span>− ${inr(t.discount)}</span></div>` : ''}
          <div class="summary__row">
            <span>Shipping</span>
            <span>${t.shipping === 0 ? '<span class="summary__free">Free</span>' : inr(t.shipping)}</span>
          </div>
          <div class="summary__row summary__row--total"><span>Total</span><span>${inr(t.total)}</span></div>
          <p style="font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--warm-grey);margin:8px 0 0">Inclusive of all taxes</p>

          <a class="btn btn--block btn--lg" href="checkout.html" style="margin-top:16px">Proceed to checkout</a>
          <a class="btn btn--ghost btn--block" href="collections.html" style="margin-top:8px">Continue shopping</a>

          <ul class="usp-list" style="margin-top:20px;padding-top:18px;border-top:1px solid var(--line)">
            <li>${icon('shield', 16)}<span style="font-size:12.5px">98% germination guarantee</span></li>
            <li>${icon('truck', 16)}<span style="font-size:12.5px">Dispatched within 24 hours</span></li>
            <li>${icon('lock', 16)}<span style="font-size:12.5px">Secure checkout · UPI, cards, COD</span></li>
          </ul>
        </aside>
      </div>`;

    bindCartControls(host);

    host.querySelector('[data-clear-cart]').addEventListener('click', () => {
      cart.clear();
      toast('Cart cleared');
    });

    const form = host.querySelector('[data-coupon-form]');
    const msg = host.querySelector('[data-coupon-msg]');
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (cart.coupon) {
        cart.removeCoupon();
        toast('Coupon removed');
        return;
      }
      const result = cart.applyCoupon(form.querySelector('#coupon').value);
      msg.textContent = result.message;
      msg.style.color = result.ok ? 'var(--green-700)' : 'var(--clay-600)';
      if (result.ok) toast(result.message);
    });

    renderCrossSell(t.lines);
  }

  function line(l) {
    return `
      <div class="line">
        <a class="line__art" href="product.html?p=${l.product.slug}">${catalog.art(l.product)}</a>
        <div>
          <a class="line__title" href="product.html?p=${l.product.slug}">${catalog.escapeHtml(l.product.name)}</a>
          <div class="line__variant">${catalog.escapeHtml(l.variant ? l.variant.label : '')} · ${catalog.escapeHtml(l.variant ? l.variant.note : '')}</div>
          <div class="line__variant" style="color:var(--green-700)">${inr(l.price)} each</div>
          <div class="line__controls">
            ${qtyControl(l.slug, l.variantId, l.qty)}
            <button class="line__remove" type="button" data-remove data-slug="${l.slug}" data-variant="${l.variantId}">Remove</button>
          </div>
        </div>
        <div class="line__price">
          ${inr(l.lineTotal)}
          ${l.lineMrp > l.lineTotal ? `<small>${inr(l.lineMrp)}</small>` : ''}
        </div>
      </div>`;
  }

  function renderCrossSell(lines) {
    const inCart = new Set(lines.map(l => l.slug));
    const picks = [...catalog.products]
      .filter(p => !inCart.has(p.slug))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4);

    crossSell.hidden = picks.length === 0;
    crossGrid.innerHTML = picks.map(productCard).join('');
    bindProductCards(crossGrid);
  }
});
