/* ==========================================================================
   landing.js — the immersive landing experience.

   One procedural growth system drives both hero and scroll sections: a sprout
   is a stem curve plus leaf pairs, drawn at a given progress 0..1. The hero
   runs it on a timeline; the "seven days" section drives the same function
   from scroll position. Canvas 2D only — no libraries, nothing to load.
   ========================================================================== */

/* Guarded: an unqualified `matchMedia` throws at load where it is absent,
   which would take the whole page down rather than just the motion check. */
const REDUCED = typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const HAS_IO = typeof window.IntersectionObserver === 'function';

/* ------------------------------------------------------------- utilities -- */

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);

/** Deterministic pseudo-random so a reload looks the same, not jarringly new. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Returns null where 2D canvas isn't available, so the page degrades to its
    static layout instead of throwing. */
function fitCanvas(canvas) {
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return null;
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(r.width * DPR));
  canvas.height = Math.max(1, Math.round(r.height * DPR));
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  return { ctx, w: r.width, h: r.height };
}

/* --------------------------------------------------------- growth drawing -- */

/**
 * Draw one sprout rising from (x, baseY).
 * @param {number} p 0..1 growth progress
 */
function drawSprout(ctx, x, baseY, p, o) {
  if (p <= 0.001) return;
  const grow = easeOut(clamp(p, 0, 1));
  const h = o.height * grow;
  const sway = Math.sin(o.phase + o.t * o.swaySpeed) * o.swayAmp * grow;
  const tipX = x + sway;
  const tipY = baseY - h;

  ctx.save();
  ctx.globalAlpha = o.alpha;

  // Stem: a quadratic curve so the sway bends rather than tilts.
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + sway * 0.35, baseY - h * 0.55, tipX, tipY);
  ctx.strokeStyle = o.stem;
  ctx.lineWidth = o.width;
  ctx.lineCap = 'round';
  if (o.glow) { ctx.shadowColor = o.glowColor; ctx.shadowBlur = o.glow; }
  ctx.stroke();

  // Leaf pairs unfurl in sequence up the stem.
  const pairs = o.pairs;
  for (let i = 0; i < pairs; i++) {
    const at = (i + 1) / (pairs + 0.6);
    const startAt = at * 0.55;
    const lp = clamp((grow - startAt) / (1 - startAt), 0, 1);
    if (lp <= 0.02) continue;

    const ly = baseY - h * at;
    const lx = x + sway * at * 0.7;
    const size = o.leaf * lp * (0.75 + 0.25 * at);

    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.quadraticCurveTo(
        lx + dir * size * 0.9, ly - size * 0.55,
        lx + dir * size * 1.45, ly - size * 0.1
      );
      ctx.quadraticCurveTo(
        lx + dir * size * 0.8, ly + size * 0.34,
        lx, ly
      );
      ctx.fillStyle = o.leafFill;
      ctx.fill();
    }
  }

  // Cotyledon tip while young.
  if (grow < 0.99) {
    ctx.beginPath();
    ctx.arc(tipX, tipY, o.width * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = o.tip;
    ctx.fill();
  }
  ctx.restore();
}

/* ------------------------------------------------------------ hero field -- */

class GerminationField {
  constructor(canvas) {
    this.canvas = canvas;
    this.plants = [];
    this.motes = [];
    this.t = 0;
    this.visible = true;
    this.resize();

    // Pause the loop when the hero scrolls away; without IO, just keep running.
    if (HAS_IO) {
      new IntersectionObserver(
        ([e]) => { this.visible = e.isIntersecting; },
        { threshold: 0 }
      ).observe(canvas);
    }
  }

  resize() {
    const fit = fitCanvas(this.canvas);
    if (!fit) { this.ctx = null; return; }
    this.ctx = fit.ctx; this.w = fit.w; this.h = fit.h;
    this.seed();
  }

  seed() {
    const rand = rng(20260812);
    const count = Math.round(clamp(this.w / 26, 16, 68));
    this.plants = Array.from({ length: count }, (_, i) => {
      const depth = rand();                       // 0 far, 1 near
      return {
        x: (i / count) * this.w + rand() * (this.w / count),
        depth,
        height: lerp(this.h * 0.16, this.h * 0.52, depth) * (0.7 + rand() * 0.6),
        width: lerp(1.1, 3.4, depth),
        leaf: lerp(5, 15, depth),
        pairs: 2 + Math.floor(rand() * 3),
        phase: rand() * Math.PI * 2,
        swayAmp: lerp(4, 15, depth),
        swaySpeed: 0.22 + rand() * 0.3,
        // Staggered so the field fills in rather than popping at once. Kept
        // short, and the loop pre-warms, so the hero is never seen empty.
        delay: rand() * 5,
        span: 3.5 + rand() * 4
      };
    }).sort((a, b) => a.depth - b.depth);

    this.motes = Array.from({ length: Math.round(clamp(this.w / 22, 18, 60)) }, () => ({
      x: rand() * this.w,
      y: rand() * this.h,
      r: 0.6 + rand() * 1.9,
      vy: -(3 + rand() * 10),
      vx: (rand() - 0.5) * 5,
      a: 0.12 + rand() * 0.38,
      ph: rand() * Math.PI * 2
    }));
  }

  step(dt) {
    this.t += dt;
    for (const m of this.motes) {
      m.y += m.vy * dt;
      m.x += m.vx * dt + Math.sin(this.t * 0.5 + m.ph) * 3 * dt;
      if (m.y < -12) { m.y = this.h + 12; m.x = Math.random() * this.w; }
      if (m.x < -12) m.x = this.w + 12;
      if (m.x > this.w + 12) m.x = -12;
    }
  }

  draw() {
    if (!this.ctx) return;
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#050907');
    g.addColorStop(0.55, '#081109');
    g.addColorStop(1, '#0C1A12');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (const m of this.motes) {
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(160, 232, 190, ${m.a})`;
      ctx.fill();
    }

    const baseY = h * 1.02;
    for (const pl of this.plants) {
      const local = REDUCED ? 1 : clamp((this.t - pl.delay) / pl.span, 0, 1);
      const near = pl.depth;
      drawSprout(ctx, pl.x, baseY, local, {
        t: this.t,
        height: pl.height,
        width: pl.width,
        leaf: pl.leaf,
        pairs: pl.pairs,
        phase: pl.phase,
        swayAmp: pl.swayAmp,
        swaySpeed: pl.swaySpeed,
        alpha: lerp(0.34, 1, near),
        stem: `rgba(${Math.round(lerp(48, 116, near))}, ${Math.round(lerp(110, 214, near))}, ${Math.round(lerp(74, 150, near))}, 1)`,
        leafFill: `rgba(${Math.round(lerp(40, 132, near))}, ${Math.round(lerp(104, 226, near))}, ${Math.round(lerp(68, 163, near))}, ${lerp(0.5, 0.95, near)})`,
        tip: `rgba(190, 245, 212, ${lerp(0.3, 0.9, near)})`,
        glow: near > 0.55 ? 16 * near : 0,
        glowColor: 'rgba(127, 224, 165, .5)'
      });
    }
  }
}

/* ------------------------------------------------- scroll-driven tray viz -- */

class GrowthTray {
  constructor(canvas) {
    this.canvas = canvas;
    this.p = 0;
    this.t = 0;
    this.resize();
  }

  resize() {
    const fit = fitCanvas(this.canvas);
    if (!fit) { this.ctx = null; return; }
    const { ctx, w, h } = fit;
    this.ctx = ctx; this.w = w; this.h = h;
    const rand = rng(77001);
    const count = Math.round(clamp(w / 17, 14, 54));
    this.plants = Array.from({ length: count }, (_, i) => ({
      x: lerp(w * 0.12, w * 0.88, count === 1 ? 0.5 : i / (count - 1)) + (rand() - 0.5) * 8,
      // Slight per-plant offset so the tray grows unevenly, like a real one.
      off: rand() * 0.16,
      scale: 0.72 + rand() * 0.55,
      pairs: 2 + Math.floor(rand() * 2),
      phase: rand() * Math.PI * 2,
      sway: 3 + rand() * 6
    }));
  }

  setProgress(p) { this.p = clamp(p, 0, 1); }

  draw(t) {
    if (!this.ctx) return;
    const { ctx, w, h } = this;
    this.t = t;
    ctx.clearRect(0, 0, w, h);

    const trayY = h * 0.78;
    const trayW = w * 0.84;
    const trayX = (w - trayW) / 2;
    const trayH = h * 0.1;

    // Glow pool under the tray grows with the crop.
    const pool = ctx.createRadialGradient(w / 2, trayY, 0, w / 2, trayY, w * 0.62);
    pool.addColorStop(0, `rgba(62, 156, 104, ${0.10 + this.p * 0.20})`);
    pool.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = pool;
    ctx.fillRect(0, 0, w, h);

    const baseY = trayY;
    for (const pl of this.plants) {
      const local = clamp((this.p - pl.off) / (1 - pl.off), 0, 1);
      drawSprout(ctx, pl.x, baseY, local, {
        t,
        height: h * 0.46 * pl.scale,
        width: 2.4 * pl.scale,
        leaf: 13 * pl.scale,
        pairs: pl.pairs,
        phase: pl.phase,
        swayAmp: pl.sway,
        swaySpeed: 0.3,
        alpha: 1,
        stem: 'rgba(116, 214, 150, 1)',
        leafFill: 'rgba(132, 226, 163, .92)',
        tip: 'rgba(206, 250, 224, .95)',
        glow: 14,
        glowColor: 'rgba(127, 224, 165, .55)'
      });
    }

    // Tray: medium band, then the vessel.
    ctx.fillStyle = 'rgba(28, 44, 34, .95)';
    ctx.fillRect(trayX, trayY, trayW, trayH * 0.42);
    ctx.fillStyle = 'rgba(242, 247, 243, .10)';
    ctx.fillRect(trayX, trayY + trayH * 0.42, trayW, trayH * 0.58);
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.lineWidth = 1;
    ctx.strokeRect(trayX + 0.5, trayY + 0.5, trayW - 1, trayH - 1);

    // Seeds sitting on the medium before germination.
    if (this.p < 0.3) {
      const a = 1 - this.p / 0.3;
      ctx.globalAlpha = a;
      for (const pl of this.plants) {
        ctx.beginPath();
        ctx.ellipse(pl.x, trayY - 1.5, 2.6 * pl.scale, 1.9 * pl.scale, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(206, 186, 148, .95)';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
}

/* ------------------------------------------------------------------ boot -- */

document.addEventListener('DOMContentLoaded', () => {
  // Each piece is an independent enhancement: isolate them so a failure in one
  // (an unsupported API, a missing canvas) cannot take the rest of the page
  // down with it. Content stays readable either way.
  [measureChrome, buildHeadline, startHero, startGrowth, startReveals,
   startHeaderState, startCardSheen, renderProducts, renderTicker]
    .forEach(fn => {
      try { fn(); }
      catch (err) { console.warn(`landing: ${fn.name} skipped —`, err.message); }
    });
});

/** Wrap each headline word in its own span so they can stagger in.
    Inline markup (<em>) is preserved as a wrapper, with its words split too —
    otherwise an emphasised phrase animates as one block against the rest. */
function buildHeadline() {
  document.querySelectorAll('[data-split]').forEach(el => {
    const frag = document.createDocumentFragment();
    let i = 0;

    const splitInto = (text, target) => {
      text.split(/(\s+)/).forEach(chunk => {
        if (!chunk) return;
        if (!chunk.trim()) { target.appendChild(document.createTextNode(chunk)); return; }
        const s = document.createElement('span');
        s.className = 'lx-word';
        s.style.setProperty('--d', (i++ * 70) + 'ms');
        s.textContent = chunk;
        target.appendChild(s);
      });
    };

    el.childNodes.forEach(node => {
      if (node.nodeType === 3) {
        splitInto(node.textContent, frag);
      } else {
        const wrapper = node.cloneNode(false);   // keep <em>, drop its children
        splitInto(node.textContent, wrapper);
        frag.appendChild(wrapper);
      }
    });

    el.replaceChildren(frag);
    void el.offsetWidth;
    requestAnimationFrame(() => el.classList.add('is-in'));
  });
}

function startHero() {
  const canvas = document.querySelector('[data-hero-canvas]');
  if (!canvas) return;
  const field = new GerminationField(canvas);

  let last = performance.now();
  const loop = now => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (field.visible) { field.step(dt); field.draw(); }
    if (!REDUCED) requestAnimationFrame(loop);
  };

  // Open on an established field rather than bare soil, then keep evolving.
  field.t = 9;
  if (REDUCED) field.draw();
  else requestAnimationFrame(loop);

  addEventListener('resize', debounce(() => { field.resize(); field.draw(); }, 180));
}

function startGrowth() {
  const rail = document.querySelector('[data-grow-rail]');
  const canvas = document.querySelector('[data-grow-canvas]');
  if (!rail || !canvas) return;

  const tray = new GrowthTray(canvas);
  const panels = [...document.querySelectorAll('[data-step]')];
  const bar = document.querySelector('[data-grow-bar]');

  let t = 0, last = performance.now(), running = true;

  if (HAS_IO) {
    new IntersectionObserver(([e]) => { running = e.isIntersecting; }, { threshold: 0 }).observe(rail);
  }

  const update = () => {
    const r = rail.getBoundingClientRect();
    const total = r.height - innerHeight;
    const p = clamp(-r.top / Math.max(total, 1), 0, 1);
    tray.setProgress(p);
    if (bar) bar.style.height = (p * 100) + '%';

    const idx = Math.min(panels.length - 1, Math.floor(p * panels.length * 0.999));
    panels.forEach((el, i) => el.setAttribute('data-active', String(i === idx)));
  };

  const loop = now => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (running) { t += REDUCED ? 0 : dt; tray.draw(t); }
    requestAnimationFrame(loop);
  };

  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', debounce(() => { tray.resize(); update(); }, 180));
  update();
  requestAnimationFrame(loop);
}

function startReveals() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  // No observer, or motion is unwanted: show everything rather than nothing.
  if (REDUCED || !HAS_IO) {
    items.forEach(el => {
      el.classList.add('is-in');
      if (el.hasAttribute('data-count')) {
        const n = el.querySelector('[data-count-to]');
        if (n) n.textContent = (n.dataset.pre || '') + n.dataset.countTo + (n.dataset.suf || '');
      }
    });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target.hasAttribute('data-count')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => io.observe(el));
}

/** Animate a stat from 0 to its target, preserving prefix/suffix. */
function countUp(el) {
  const node = el.querySelector('[data-count-to]') || el;
  const target = parseFloat(node.dataset.countTo);
  if (!isFinite(target)) return;
  const pre = node.dataset.pre || '';
  const suf = node.dataset.suf || '';
  const dec = parseInt(node.dataset.dec || '0', 10);
  const dur = 1500;
  const t0 = performance.now();

  const tick = now => {
    const p = clamp((now - t0) / dur, 0, 1);
    const v = target * easeOut(p);
    node.textContent = pre + v.toFixed(dec) + suf;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function startHeaderState() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => header.setAttribute('data-solid', String(scrollY > 40));
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/** Publish the announce-bar + header height so the hero can end at the fold.
    Measured rather than hard-coded, since the announce bar wraps when narrow. */
function measureChrome() {
  const chrome = document.querySelector('[data-chrome="header"]');
  if (!chrome) return;
  const apply = () => document.documentElement.style
    .setProperty('--chrome-h', Math.round(chrome.getBoundingClientRect().height) + 'px');
  apply();
  addEventListener('resize', debounce(apply, 150));
  if (typeof ResizeObserver === 'function') new ResizeObserver(apply).observe(chrome);
}

function startCardSheen() {
  if (REDUCED) return;
  document.querySelectorAll('.lx-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });
}

/** Product rail, drawn from the same catalogue the storefront uses. */
function renderProducts() {
  const rail = document.querySelector('[data-lx-rail]');
  if (!rail || !window.catalog) return;

  const picks = [
    'microgreens-starter-tray-kit',
    '7-in-1-microgreens-seed-combo',
    'microgreens-continuous-harvest-kit',
    'hydroponic-microgreens-kit',
    'red-cherry-tomato-seeds',
    'microgreens-gift-kit',
    'wheatgrass-juicing-kit',
    'italian-basil-seeds'
  ].map(s => catalog.bySlug(s)).filter(Boolean);

  rail.innerHTML = picks.map(p => {
    const { price, mrp } = priceOf(p, null);
    return `
      <a class="lx-prod" href="product.html?p=${p.slug}">
        <div class="lx-prod__media">
          ${p.badge ? `<span class="lx-prod__tag">${catalog.escapeHtml(p.badge)}</span>` : ''}
          ${catalog.art(p)}
        </div>
        <div class="lx-prod__body">
          <span class="lx-prod__cat">${catalog.escapeHtml(catalog.categoryName(p.category))}</span>
          <span class="lx-prod__name">${catalog.escapeHtml(p.name)}</span>
          <span class="lx-prod__foot">
            <span class="lx-prod__price">${inr(price)}</span>
            <span class="lx-prod__was">${inr(mrp)}</span>
          </span>
        </div>
      </a>`;
  }).join('');
}

function renderTicker() {
  const el = document.querySelector('[data-lx-ticker]');
  if (!el) return;
  const items = ['Harvest in 7 days', 'Non-GMO', '98% germination', 'Complete kits',
    'Open pollinated', 'Ships to 40+ countries', 'Packed in Dehradun', 'Since 1994'];
  const strip = items.map(i => `<span>${i}</span><b>&#8226;</b>`).join('');
  el.innerHTML = strip + strip;
}

function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
