/* home.js — populates the homepage sections from the catalog. */

const TRUST = [
  { icon: 'award', title: 'ISF member seed house', body: 'We buy and test to the same standards commercial seed houses use worldwide — not repackaged bulk stock.' },
  { icon: 'shield', title: '98% germination guarantee', body: 'Fewer than 9 in 10 sprout when sown as directed? Send a photo within 30 days and we replace the pack.' },
  { icon: 'leaf', title: '30 years in horticulture', body: 'Growing, trialling and selecting varieties out of Dehradun since 1994. Two generations of it.' },
  { icon: 'globe', title: 'Ships to 40+ countries', body: 'Phytosanitary certification handled in-house, so international orders clear customs without drama.' }
];

const FEATURE_USPS = [
  'Approx. 3,385 seeds across 7 varieties — 25 to 30 trays',
  'First cut in 7 days; radish and mustard are ready first',
  'Needs only a tray, an inch of coco peat and a spray bottle',
  'Free replacement if germination falls below 98%'
];

const MARQUEE = [
  'Non-GMO', 'Open pollinated', '98% germination', 'ISF member', 'Free shipping over ₹499',
  'Packed in Dehradun', '24-hour dispatch', '30+ years', 'Ships to 40+ countries'
];

document.addEventListener('DOMContentLoaded', () => {
  const { products, categories, art, escapeHtml } = catalog;

  /* Hero photography, then the flagship product for the feature block. */
  const flagship = catalog.bySlug('7-in-1-microgreens-seed-combo');
  document.querySelector('[data-hero-art]')
    .insertAdjacentHTML('afterbegin', catalog.keyArt('_hero', 'Microgreens growing in a seed tray'));
  document.querySelector('[data-feature-art]').innerHTML = art(flagship, { view: 0 });

  document.querySelector('[data-feature-usps]').innerHTML = FEATURE_USPS
    .map(u => `<li>${icon('check', 17)}<span>${u}</span></li>`).join('');

  document.querySelector('[data-trust]').innerHTML = TRUST.map(t => `
    <div class="trust__item">
      <span class="trust__icon">${icon(t.icon, 20)}</span>
      <div><strong>${t.title}</strong><p>${t.body}</p></div>
    </div>`).join('');

  document.querySelector('[data-categories]').innerHTML = categories.map(c => `
    <a class="cat-card" href="collections.html?c=${c.slug}">
      ${catalog.keyArt('_cat-' + c.slug, c.name)}
      <div class="cat-card__body">
        <strong>${escapeHtml(c.name)}</strong>
        <span>${catalog.countIn(c.slug)} ${catalog.unitFor(c.slug)} · ${escapeHtml(c.blurb)}</span>
      </div>
    </a>`).join('');

  /* Kits lead the page: cheapest first, so the entry point is the first thing seen. */
  const kits = catalog.byCategory('growing-kits').sort((a, b) => a.price - b.price).slice(0, 4);
  document.querySelector('[data-kits]').innerHTML = kits.map(productCard).join('');

  const bestsellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);
  // "New" badges first, topped up with the newest kits so the rail always fills.
  const newest = products.filter(p => p.badge === 'New')
    .concat(catalog.byCategory('growing-kits'))
    .filter((p, i, arr) => arr.findIndex(x => x.slug === p.slug) === i)
    .slice(0, 4);

  document.querySelector('[data-bestsellers]').innerHTML = bestsellers.map(productCard).join('');
  document.querySelector('[data-newest]').innerHTML = newest.map(productCard).join('');

  /* Duplicated so the CSS -50% translate loops seamlessly. */
  const strip = MARQUEE.map(m => `<span>${m}</span>`).join('');
  document.querySelector('[data-marquee]').innerHTML = strip + strip;

  bindProductCards(document);
});
