/* collections.js — filtering, search and sort for the catalog grid.
   State lives in the URL so filtered views are shareable and back/forward work. */

document.addEventListener('DOMContentLoaded', () => {
  const els = {
    results: document.querySelector('[data-results]'),
    empty: document.querySelector('[data-empty]'),
    filters: document.querySelector('[data-filters]'),
    search: document.querySelector('[data-search]'),
    sort: document.querySelector('[data-sort]'),
    count: document.querySelector('[data-count]'),
    title: document.querySelector('[data-title]'),
    blurb: document.querySelector('[data-blurb]'),
    crumb: document.querySelector('[data-crumb]')
  };

  const state = readState();

  els.filters.innerHTML = [{ slug: '', name: 'All seeds' }, ...catalog.categories]
    .map(c => `<button class="chip" type="button" data-cat="${c.slug}"
      aria-pressed="${state.cat === c.slug}">${catalog.escapeHtml(c.name)}</button>`).join('');

  els.filters.addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    state.cat = btn.dataset.cat;
    apply({ push: true });
  });

  els.search.addEventListener('input', debounce(() => {
    state.q = els.search.value;
    apply({ push: false });
  }, 180));

  els.sort.addEventListener('change', () => {
    state.sort = els.sort.value;
    apply({ push: true });
  });

  document.querySelector('[data-clear]').addEventListener('click', () => {
    state.cat = '';
    state.q = '';
    els.search.value = '';
    apply({ push: true });
  });

  window.addEventListener('popstate', () => {
    Object.assign(state, readState());
    apply({ push: false, syncInputs: true });
  });

  apply({ push: false, syncInputs: true });

  /* ------------------------------------------------------------ helpers */

  function readState() {
    const p = new URLSearchParams(location.search);
    return {
      cat: p.get('c') || '',
      q: p.get('q') || '',
      sort: p.get('sort') || 'popular'
    };
  }

  function apply({ push, syncInputs }) {
    if (syncInputs) {
      els.search.value = state.q;
      els.sort.value = state.sort;
    }

    const q = state.q.trim().toLowerCase();
    let list = catalog.products.filter(p => {
      if (state.cat && p.category !== state.cat) return false;
      if (!q) return true;
      return [p.name, p.tagline, p.description, catalog.categoryName(p.category)]
        .join(' ').toLowerCase().includes(q);
    });

    list = sortList(list, state.sort);

    els.results.innerHTML = list.map(productCard).join('');
    els.results.hidden = list.length === 0;
    els.empty.hidden = list.length > 0;
    bindProductCards(els.results);

    els.count.textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}`;

    const cat = catalog.categories.find(c => c.slug === state.cat);
    const title = cat ? cat.name : 'All seeds';
    els.title.textContent = title;
    els.crumb.textContent = title;
    els.blurb.textContent = cat
      ? `${cat.blurb} — ${catalog.countIn(cat.slug)} ${catalog.unitFor(cat.slug)}, ${catalog.tailFor(cat.slug)}`
      : 'Growing kits and every seed variety we stock — non-GMO, open pollinated and germination tested batch by batch.';
    document.title = `${title} — SeedNest`;

    els.filters.querySelectorAll('[data-cat]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.cat === state.cat));
    });

    const params = new URLSearchParams();
    if (state.cat) params.set('c', state.cat);
    if (state.q.trim()) params.set('q', state.q.trim());
    if (state.sort !== 'popular') params.set('sort', state.sort);
    const url = location.pathname + (params.toString() ? '?' + params : '');
    history[push ? 'pushState' : 'replaceState']({}, '', url);
  }

  function sortList(list, sort) {
    const copy = [...list];
    switch (sort) {
      case 'price-asc': return copy.sort((a, b) => a.price - b.price);
      case 'price-desc': return copy.sort((a, b) => b.price - a.price);
      case 'discount': return copy.sort((a, b) => (1 - b.price / b.mrp) - (1 - a.price / a.mrp));
      case 'name': return copy.sort((a, b) => a.name.localeCompare(b.name));
      default: return copy.sort((a, b) => b.sold - a.sold);
    }
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }
});
