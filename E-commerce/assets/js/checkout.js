/* checkout.js — address form, validation, simulated payment, confirmation.

   NOTE: order placement is simulated client-side. Wiring a real gateway
   (Razorpay/Stripe) means POSTing `order` to a server that creates the payment
   intent — the client must never compute the amount it charges. */

const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttarakhand', 'Uttar Pradesh', 'West Bengal'];

const PAYMENTS = [
  { id: 'upi', title: 'UPI', note: 'GPay, PhonePe, Paytm or any UPI app' },
  { id: 'card', title: 'Credit / debit card', note: 'Visa, Mastercard, RuPay and Amex' },
  { id: 'netbanking', title: 'Netbanking', note: 'All major Indian banks' },
  { id: 'cod', title: 'Cash on delivery', note: 'Pay the courier · ₹25 handling fee' }
];

const COD_FEE = 25;

const FIELDS = [
  { id: 'name', label: 'Full name', type: 'text', autocomplete: 'name', span: 2, validate: v => v.trim().length >= 3 || 'Enter your full name.' },
  { id: 'email', label: 'Email', type: 'email', autocomplete: 'email', validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address.' },
  { id: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel', inputmode: 'numeric', validate: v => /^[6-9]\d{9}$/.test(v.replace(/\D/g, '')) || 'Enter a 10-digit Indian mobile number.' },
  { id: 'address', label: 'Address', type: 'text', autocomplete: 'street-address', span: 2, validate: v => v.trim().length >= 8 || 'Enter your street address.' },
  { id: 'landmark', label: 'Landmark (optional)', type: 'text', span: 2, optional: true },
  { id: 'city', label: 'City', type: 'text', autocomplete: 'address-level2', validate: v => v.trim().length >= 2 || 'Enter your city.' },
  { id: 'state', label: 'State', type: 'select', options: STATES, autocomplete: 'address-level1', validate: v => STATES.includes(v) || 'Select your state.' },
  { id: 'pincode', label: 'Pincode', type: 'text', autocomplete: 'postal-code', inputmode: 'numeric', validate: v => /^\d{6}$/.test(v.trim()) || 'Enter a 6-digit pincode.' }
];

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-checkout-root]');
  const orderId = new URLSearchParams(location.search).get('order');

  if (orderId) return renderConfirmation(root, orderId);
  renderCheckout(root);
});

/* ----------------------------------------------------------- checkout ---- */

function renderCheckout(root) {
  const t = cart.totals();

  if (!t.lines.length) {
    root.innerHTML = `
      <div class="empty">
        <h1>Nothing to check out</h1>
        <p>Your cart is empty — add a few packs and come back.</p>
        <a class="btn" href="collections.html">Browse all seeds</a>
      </div>`;
    return;
  }

  let payment = 'upi';

  root.innerHTML = `
    <p class="steps"><a href="cart.html">1. Cart</a><span>›</span><b>2. Details</b><span>›</span><span>3. Payment</span></p>
    <h1 style="margin-bottom:24px">Checkout</h1>

    <form class="cart-layout" data-checkout-form novalidate>
      <div>
        <div class="panel" style="margin-bottom:20px">
          <h2 style="font-size:22px;margin-bottom:20px">Delivery details</h2>
          <div class="form-grid">
            ${FIELDS.map(fieldMarkup).join('')}
          </div>
        </div>

        <div class="panel">
          <h2 style="font-size:22px;margin-bottom:20px">Payment method</h2>
          ${PAYMENTS.map(p => `
            <label class="pay-opt">
              <input type="radio" name="payment" value="${p.id}" ${p.id === payment ? 'checked' : ''}>
              <span>
                <strong>${p.title}</strong>
                <span>${p.note}</span>
              </span>
            </label>`).join('')}
          <p style="font-size:11px;color:var(--warm-grey);margin-top:16px;display:flex;gap:8px;align-items:center;line-height:1.6">
            ${icon('lock', 14)} Payments are encrypted end to end. <em style="font-style:normal;opacity:.75">(Presentation mockup — the gateway is not connected, so no payment is taken.)</em>
          </p>
        </div>
      </div>

      <aside class="panel summary">
        <h2 style="font-size:22px;margin-bottom:18px">Your order</h2>
        <div style="max-height:280px;overflow-y:auto;margin-bottom:8px">
          ${t.lines.map(l => `
            <div style="display:grid;grid-template-columns:52px 1fr auto;gap:12px;padding:10px 0;border-bottom:1px solid var(--line-soft);align-items:center">
              <div style="border-radius:var(--r-sm);overflow:hidden;border:1px solid var(--line)">${catalog.art(l.product)}</div>
              <div>
                <div style="font-family:var(--font-serif);font-size:15px;line-height:1.3">${catalog.escapeHtml(l.product.name)}</div>
                <div style="font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--warm-grey);margin-top:3px">${catalog.escapeHtml(l.variant ? l.variant.label : '')} × ${l.qty}</div>
              </div>
              <div style="font-family:var(--font-serif);font-size:15px;white-space:nowrap">${inr(l.lineTotal)}</div>
            </div>`).join('')}
        </div>

        <div class="summary__row"><span>Subtotal</span><span>${inr(t.subtotal)}</span></div>
        ${t.discount > 0 ? `<div class="summary__row summary__free"><span>Coupon ${cart.coupon}</span><span>− ${inr(t.discount)}</span></div>` : ''}
        <div class="summary__row">
          <span>Shipping</span>
          <span>${t.shipping === 0 ? '<span class="summary__free">Free</span>' : inr(t.shipping)}</span>
        </div>
        <div class="summary__row" data-cod-row hidden><span>COD handling</span><span>${inr(COD_FEE)}</span></div>
        <div class="summary__row summary__row--total"><span>Total</span><span data-grand>${inr(t.total)}</span></div>
        <p style="font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--warm-grey);margin:8px 0 0">Inclusive of all taxes</p>

        <button class="btn btn--block btn--lg" type="submit" style="margin-top:16px" data-place>
          Place order · <span data-grand-btn>${inr(t.total)}</span>
        </button>
        <a class="btn btn--ghost btn--block" href="cart.html" style="margin-top:8px">Back to cart</a>
      </aside>
    </form>`;

  const form = root.querySelector('[data-checkout-form]');

  /* COD adds a handling fee — reflect it in both totals as soon as it's picked. */
  form.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      payment = radio.value;
      const isCod = payment === 'cod';
      const total = t.total + (isCod ? COD_FEE : 0);
      root.querySelector('[data-cod-row]').hidden = !isCod;
      root.querySelector('[data-grand]').textContent = inr(total);
      root.querySelector('[data-grand-btn]').textContent = inr(total);
    });
  });

  /* Validate on blur once touched, so errors don't fire mid-typing. */
  FIELDS.filter(f => !f.optional).forEach(f => {
    const input = form.querySelector(`#f-${f.id}`);
    input.addEventListener('blur', () => validateField(form, f));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validateField(form, f);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const failed = FIELDS.filter(f => !f.optional).filter(f => !validateField(form, f));
    if (failed.length) {
      const first = form.querySelector(`#f-${failed[0].id}`);
      first.focus();
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('Please fix the highlighted fields.');
      return;
    }

    const btn = form.querySelector('[data-place]');
    btn.disabled = true;
    btn.textContent = 'Placing your order…';

    // Stand-in for a gateway round trip.
    setTimeout(() => {
      const totals = cart.totals();
      const codFee = payment === 'cod' ? COD_FEE : 0;
      const order = {
        id: newOrderId(),
        placedAt: new Date().toISOString(),
        payment,
        codFee,
        coupon: cart.coupon,
        customer: Object.fromEntries(FIELDS.map(f => [f.id, form.querySelector(`#f-${f.id}`).value.trim()])),
        items: totals.lines.map(l => ({
          slug: l.slug,
          name: l.product.name,
          variant: l.variant ? l.variant.label : '',
          qty: l.qty,
          price: l.price,
          lineTotal: l.lineTotal
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        total: totals.total + codFee
      };

      orders.place(order);
      cart.clear();
      location.href = `checkout.html?order=${order.id}`;
    }, 900);
  });
}

function fieldMarkup(f) {
  const span = f.span === 2 ? 'grid-column:1/-1;' : '';
  const control = f.type === 'select'
    ? `<select class="select" id="f-${f.id}" name="${f.id}" style="width:100%" ${f.autocomplete ? `autocomplete="${f.autocomplete}"` : ''}>
         <option value="">Select a state</option>
         ${f.options.map(o => `<option>${o}</option>`).join('')}
       </select>`
    : `<input class="field" id="f-${f.id}" name="${f.id}" type="${f.type}"
         ${f.autocomplete ? `autocomplete="${f.autocomplete}"` : ''}
         ${f.inputmode ? `inputmode="${f.inputmode}"` : ''}>`;

  return `
    <div class="form-row" style="${span}">
      <label for="f-${f.id}">${f.label}</label>
      ${control}
      <span class="err" data-err="${f.id}"></span>
    </div>`;
}

function validateField(form, f) {
  const input = form.querySelector(`#f-${f.id}`);
  const err = form.querySelector(`[data-err="${f.id}"]`);
  const result = f.validate ? f.validate(input.value) : true;
  const ok = result === true;
  input.setAttribute('aria-invalid', String(!ok));
  err.textContent = ok ? '' : result;
  return ok;
}

function newOrderId() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `SN-${stamp}${rand}`;
}

/* ------------------------------------------------------- confirmation ---- */

function renderConfirmation(root, id) {
  const order = orders.find(id);

  if (!order) {
    root.innerHTML = `
      <div class="empty">
        <h1>Order not found</h1>
        <p>We can't find order <strong>${catalog.escapeHtml(id)}</strong> on this device. Orders are stored locally in this demo, so they won't appear in a different browser.</p>
        <a class="btn" href="collections.html">Back to shop</a>
      </div>`;
    return;
  }

  const placed = new Date(order.placedAt);
  const eta = new Date(placed.getTime() + 5 * 86400000);
  const payLabel = (PAYMENTS.find(p => p.id === order.payment) || {}).title || order.payment;

  document.title = `Order ${order.id} confirmed — SeedNest`;

  root.innerHTML = `
    <p class="steps"><span>1. Cart</span><span>›</span><span>2. Details</span><span>›</span><b>3. Confirmed</b></p>

    <div style="text-align:center;max-width:620px;margin:0 auto 40px">
      <div class="confirm-art">${icon('check', 40)}</div>
      <h1>Order confirmed</h1>
      <p class="lede" style="margin:12px auto 0">
        Thanks, ${catalog.escapeHtml(order.customer.name.split(' ')[0])} — your seeds are being packed in Dehradun.
        A confirmation is on its way to <strong>${catalog.escapeHtml(order.customer.email)}</strong>.
      </p>
    </div>

    <div class="cart-layout">
      <div class="panel">
        <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-bottom:16px;border-bottom:1px solid var(--line);margin-bottom:8px">
          <div>
            <div style="font-size:9.5px;text-transform:uppercase;letter-spacing:.16em;color:var(--warm-grey);font-weight:600">Order number</div>
            <strong style="font-family:var(--font-serif);font-size:26px;font-weight:400">${order.id}</strong>
          </div>
          <div style="text-align:right">
            <div style="font-size:9.5px;text-transform:uppercase;letter-spacing:.16em;color:var(--warm-grey);font-weight:600">Estimated delivery</div>
            <strong>${eta.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
          </div>
        </div>

        ${order.items.map(i => `
          <div class="line">
            <a class="line__art" href="product.html?p=${i.slug}">${catalog.art(catalog.bySlug(i.slug) || { slug: i.slug, name: i.name, category: 'microgreens' })}</a>
            <div>
              <a class="line__title" href="product.html?p=${i.slug}">${catalog.escapeHtml(i.name)}</a>
              <div class="line__variant">${catalog.escapeHtml(i.variant)} · Qty ${i.qty}</div>
            </div>
            <div class="line__price">${inr(i.lineTotal)}</div>
          </div>`).join('')}

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--line);display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px">
          <div>
            <h3 style="font-size:9.5px;text-transform:uppercase;letter-spacing:.16em;font-family:var(--font-sans);font-weight:600;color:var(--warm-grey);margin-bottom:12px">Shipping to</h3>
            <p style="font-size:13px;line-height:1.8">
              ${catalog.escapeHtml(order.customer.name)}<br>
              ${catalog.escapeHtml(order.customer.address)}<br>
              ${order.customer.landmark ? catalog.escapeHtml(order.customer.landmark) + '<br>' : ''}
              ${catalog.escapeHtml(order.customer.city)}, ${catalog.escapeHtml(order.customer.state)} ${catalog.escapeHtml(order.customer.pincode)}<br>
              ${catalog.escapeHtml(order.customer.phone)}
            </p>
          </div>
          <div>
            <h3 style="font-size:9.5px;text-transform:uppercase;letter-spacing:.16em;font-family:var(--font-sans);font-weight:600;color:var(--warm-grey);margin-bottom:12px">Payment</h3>
            <p style="font-size:13px;line-height:1.8">
              ${catalog.escapeHtml(payLabel)}<br>
              ${order.payment === 'cod' ? 'Pay the courier on delivery' : 'Paid in full'}<br>
              Placed ${placed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <aside class="panel summary">
        <h2 style="font-size:22px;margin-bottom:16px">Summary</h2>
        <div class="summary__row"><span>Subtotal</span><span>${inr(order.subtotal)}</span></div>
        ${order.discount > 0 ? `<div class="summary__row summary__free"><span>Coupon ${catalog.escapeHtml(order.coupon || '')}</span><span>− ${inr(order.discount)}</span></div>` : ''}
        <div class="summary__row"><span>Shipping</span><span>${order.shipping === 0 ? '<span class="summary__free">Free</span>' : inr(order.shipping)}</span></div>
        ${order.codFee > 0 ? `<div class="summary__row"><span>COD handling</span><span>${inr(order.codFee)}</span></div>` : ''}
        <div class="summary__row summary__row--total"><span>Total</span><span>${inr(order.total)}</span></div>

        <ul class="usp-list" style="margin-top:20px;padding-top:18px;border-top:1px solid var(--line)">
          <li>${icon('truck', 16)}<span style="font-size:12.5px">Tracking link by SMS once dispatched</span></li>
          <li>${icon('shield', 16)}<span style="font-size:12.5px">98% germination guarantee applies</span></li>
          <li>${icon('chat', 16)}<span style="font-size:12.5px">Questions? support@seedsnest.in</span></li>
        </ul>

        <a class="btn btn--block" href="collections.html" style="margin-top:16px">Continue shopping</a>
      </aside>
    </div>`;
}
