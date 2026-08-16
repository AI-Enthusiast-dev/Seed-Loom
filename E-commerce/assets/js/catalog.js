/* ==========================================================================
   catalog.js — product data + the SVG artwork generator.

   Every product image is drawn from the product's own palette + motif, so the
   storefront has zero external asset dependencies. Swap `art()` for real <img>
   tags when you have photography.
   ========================================================================== */

const CATEGORIES = [
  // `unit`/`tail` let collection copy read correctly for kits as well as seed.
  { slug: 'growing-kits', name: 'Growing Kits', blurb: 'Everything in one box', motif: 'combo', palette: ['#7a5c3a', '#ddc6a6'],
    unit: 'kits', tail: 'each arriving complete with trays, growing medium, seed and tools.' },
  { slug: 'microgreens', name: 'Microgreens', blurb: 'Harvest in 7–12 days', motif: 'micro', palette: ['#1f5c3d', '#a8dcbc'] },
  { slug: 'vegetable-seeds', name: 'Vegetable Seeds', blurb: 'Kitchen-garden staples', motif: 'sprout', palette: ['#2c7a52', '#8ecda8'] },
  { slug: 'herb-seeds', name: 'Herb Seeds', blurb: 'Aromatics for every dish', motif: 'herb', palette: ['#3d7a3a', '#c6e39a'] },
  { slug: 'combo-packs', name: 'Combo Packs', blurb: 'Curated multi-seed kits', motif: 'combo', palette: ['#b4552f', '#f3c9a8'] },
  { slug: 'tree-seeds', name: 'Tree Seeds', blurb: 'Natives, fruit & flowering', motif: 'tree', palette: ['#265c4a', '#9ecfbb'] },
  { slug: 'bamboo-seeds', name: 'Bamboo Seeds', blurb: 'Fast-growing screens', motif: 'bamboo', palette: ['#4a7b2a', '#d3e7a4'] }
];

/* Shared blocks so product records stay readable. */
const SHIPPING_FAQ = [
  { q: 'How long does delivery take?', a: 'Orders are dispatched within 24 working hours. Delivery takes 3–7 days across India and 8–18 days for international destinations. You get a tracking link by SMS and email the moment your parcel leaves our Dehradun facility.' },
  { q: 'What if the seeds do not germinate?', a: 'Every pack is backed by our 98% germination guarantee. If fewer than 9 in 10 seeds sprout when sown as directed, send us a photo within 30 days of delivery and we replace the pack free — no return shipping needed.' }
];

const BASE_SPECS = {
  'Country of Origin': 'India',
  'Manufactured & Packed By': 'SeedNest Horticulture Pvt. Ltd., Dehradun, Uttarakhand 248001',
  'Customer Care': 'support@seedsnest.in · +91 74550 25717',
  'Seed Type': 'Non-GMO, Open Pollinated, untreated',
  'Shelf Life': '24 months from packing date when stored cool & dry'
};

const PRODUCTS = [
  {
    slug: '7-in-1-microgreens-seed-combo',
    name: '7-in-1 Microgreens Seed Combo',
    category: 'microgreens',
    price: 299, mrp: 499,
    sold: 41000,
    badge: 'Bestseller',
    seeds: 3385,
    tagline: 'Seven microgreen varieties, roughly 3,385 seeds, in one grower-grade kit.',
    description: 'A complete microgreens starter in a single box: broccoli, spinach, fenugreek, beetroot, golden radish, mustard and onion. Together they cover the full flavour range — the mild sweetness of beetroot and spinach, the peppery bite of radish and mustard, and the deep mineral notes of broccoli and fenugreek. Sow a tray a week and you will have fresh greens on the counter year round, with the first cut ready in as little as seven days.',
    highlights: [
      '7 varieties · approx. 3,385 seeds · enough for 25–30 trays',
      'Harvest in 7–12 days on a windowsill — no garden required',
      '98% germination guaranteed with free replacement',
      'Non-GMO, open pollinated, untreated seed from an ISF-member house'
    ],
    variants: [
      { id: 'standard', label: 'Standard Kit', note: '7 packs · 3,385 seeds', multiplier: 1 },
      { id: 'family', label: 'Family Kit', note: '14 packs · 6,770 seeds', multiplier: 1.8 },
      { id: 'grower', label: 'Grower Kit', note: '35 packs · 16,925 seeds', multiplier: 3.9 }
    ],
    specs: { 'Varieties Included': 'Broccoli, Spinach, Fenugreek, Beetroot, Golden Radish, Mustard, Onion', 'Approx. Seed Count': '3,385', 'Days to Harvest': '7–12 days', 'Sowing Season': 'All year, indoors' },
    faqs: [
      { q: 'When can I harvest my microgreens?', a: 'Most varieties in this combo are ready in 7–12 days. Radish and mustard are the quickest at around 7 days; beetroot and onion take closer to 12. Cut just above the soil line with scissors when the first true leaves appear.' },
      { q: 'What equipment do I need?', a: 'A shallow tray with drainage, about an inch of coco peat or potting mix, and a spray bottle. That is genuinely all — no grow lights, no fertiliser and no greenhouse.' },
      { q: 'Can I grow these entirely indoors?', a: 'Yes. Microgreens are harvested before they need strong light, so a windowsill with 4–6 hours of indirect daylight is plenty. Rotate the tray daily so the stems grow straight.' },
      ...SHIPPING_FAQ
    ]
  },
  {
    slug: 'indian-veggie-combo-12-in-1',
    name: 'Indian Veggie Combo — 12 in 1',
    category: 'combo-packs',
    price: 299, mrp: 499,
    sold: 28500,
    badge: 'Bestseller',
    seeds: 1240,
    tagline: 'Twelve everyday Indian vegetables for a full season of kitchen-garden harvests.',
    description: 'The vegetables an Indian kitchen actually runs on, chosen so that something is always ready to pick. Tomato, chilli, brinjal, okra, bottle gourd, ridge gourd, bitter gourd, cucumber, spinach, coriander, radish and beans — sown in sequence they will keep a 4x6 ft bed or a row of grow bags productive for eight months.',
    highlights: [
      '12 varieties · approx. 1,240 seeds across the set',
      'Chosen for Indian climate zones from coastal to lower Himalayan',
      'Sowing calendar and spacing chart included in every box',
      'Works in grow bags, terrace beds and raised beds alike'
    ],
    variants: [
      { id: 'standard', label: 'Standard Kit', note: '12 packs', multiplier: 1 },
      { id: 'family', label: 'Double Kit', note: '24 packs', multiplier: 1.8 }
    ],
    specs: { 'Varieties Included': 'Tomato, Chilli, Brinjal, Okra, Bottle Gourd, Ridge Gourd, Bitter Gourd, Cucumber, Spinach, Coriander, Radish, Cluster Beans', 'Approx. Seed Count': '1,240', 'Days to Harvest': '35–95 days by variety', 'Sowing Season': 'June–August & January–February' },
    faqs: [
      { q: 'How much space do I need for all twelve?', a: 'A 4x6 ft raised bed or about fifteen 12-inch grow bags will comfortably hold the full set if you sow in sequence rather than all at once. The included calendar shows which to start first.' },
      { q: 'Is this suitable for a complete beginner?', a: 'Yes — okra, spinach, coriander and radish are near foolproof and give you a harvest within six weeks, which is usually enough to get hooked before the slower gourds come in.' },
      ...SHIPPING_FAQ
    ]
  },
  {
    slug: 'broccoli-microgreens-seeds',
    name: 'Broccoli Microgreens Seeds',
    category: 'microgreens', price: 149, mrp: 299,
    sold: 15200, badge: 'Fast harvest', seeds: 2500,
    tagline: 'The sulforaphane classic — mild, nutty and ready in eight days.',
    description: 'Broccoli is the microgreen most people start with and most keep growing. The flavour is far gentler than mature broccoli — nutty and faintly sweet — which makes it easy to fold into salads, sandwiches and dals without anyone objecting. It is also among the fastest and most forgiving varieties in the tray.',
    highlights: ['Approx. 2,500 seeds · 8–10 trays', 'Ready to cut in 8–10 days', 'High-density sowing rate, 96%+ germination', 'Untreated and non-GMO'],
    variants: [{ id: 'std', label: '25 g pouch', note: 'approx. 2,500 seeds', multiplier: 1 }, { id: 'big', label: '100 g pouch', note: 'approx. 10,000 seeds', multiplier: 3.2 }],
    specs: { 'Days to Harvest': '8–10 days', 'Sowing Density': '25 g per 10x10 in tray', 'Approx. Seed Count': '2,500' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'red-cherry-tomato-seeds',
    name: 'Red Cherry Tomato Seeds',
    category: 'vegetable-seeds', price: 99, mrp: 249,
    sold: 33800, badge: 'Bestseller', seeds: 60,
    tagline: 'Heavy trusses of sweet, crack-resistant cherry tomatoes all season.',
    description: 'An indeterminate cherry that keeps setting fruit from the first truss right through to the cold. The fruit runs 15–20 g, holds its shape in a salad and resists splitting after rain — the failing that ruins most home-grown cherries in an Indian monsoon. Give it a stake and it will climb past six feet.',
    highlights: ['Approx. 60 seeds per pack', 'First harvest around 70 days from sowing', 'Indeterminate — pick continuously for 4–5 months', 'Crack-resistant skin, holds well after picking'],
    variants: [{ id: 'std', label: 'Standard pack', note: 'approx. 60 seeds', multiplier: 1 }, { id: 'pro', label: 'Grower pack', note: 'approx. 300 seeds', multiplier: 3 }],
    specs: { 'Days to Harvest': '70–80 days', 'Plant Height': '5–7 ft, needs staking', 'Sowing Season': 'June–July & December–January', 'Spacing': '45 cm between plants' },
    faqs: [
      { q: 'Does it need a large pot?', a: 'A 15-inch grow bag or a 20-litre pot per plant is the practical minimum for an indeterminate variety. Anything smaller and the plant will fruit but stall by mid-season.' },
      ...SHIPPING_FAQ
    ]
  },
  {
    slug: 'italian-basil-seeds',
    name: 'Italian Basil (Genovese) Seeds',
    category: 'herb-seeds', price: 99, mrp: 249,
    sold: 19400, badge: 'Bestseller', seeds: 400,
    tagline: 'Large, cupped, intensely aromatic leaves — the true pesto basil.',
    description: 'Genovese is the basil that makes pesto taste like pesto: big cupped leaves, low anise character and a heavy essential-oil content that survives being blitzed with oil and garlic. Pinch the growing tips weekly and one plant will crop for months.',
    highlights: ['Approx. 400 seeds', 'Cut-and-come-again for 5–6 months', 'Thrives in pots on a balcony', 'Germinates in 5–8 days at 20–30°C'],
    variants: [{ id: 'std', label: 'Standard pack', note: 'approx. 400 seeds', multiplier: 1 }],
    specs: { 'Days to Harvest': '55–65 days', 'Plant Height': '45–60 cm', 'Sowing Season': 'February–September' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'sunflower-microgreens-seeds',
    name: 'Sunflower Microgreens Seeds',
    category: 'microgreens', price: 129, mrp: 279,
    sold: 11800, seeds: 900,
    tagline: 'Thick, crunchy stems with a fresh nutty snap — the best texture in the tray.',
    description: 'If most microgreens are delicate, sunflower is the opposite: substantial, juicy stems that stand up to a warm dish. Soak the seeds overnight, weight the tray for the first two days and you get an unusually even, upright crop.',
    highlights: ['Approx. 900 black-oil seeds', 'Harvest in 8–12 days', 'Best texture of any microgreen', 'Pre-soak recommended for even germination'],
    variants: [{ id: 'std', label: '100 g pouch', note: 'approx. 900 seeds', multiplier: 1 }, { id: 'big', label: '500 g pouch', note: 'approx. 4,500 seeds', multiplier: 3.6 }],
    specs: { 'Days to Harvest': '8–12 days', 'Pre-treatment': 'Soak 8 hours before sowing', 'Approx. Seed Count': '900' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'green-chilli-seeds',
    name: 'Green Chilli (G4 Hybrid) Seeds',
    category: 'vegetable-seeds', price: 99, mrp: 249,
    sold: 24600, seeds: 80,
    tagline: 'Prolific, high-pungency chilli that fruits for the better part of a year.',
    description: 'A dependable workhorse chilli — straight 8–10 cm fruit, strong pungency, and a plant that keeps producing long after the first flush. It handles heat and humidity better than most, which is why it is the variety you see in half the terrace gardens in South India.',
    highlights: ['Approx. 80 seeds', 'First pick at 60–70 days', 'Fruits continuously for 8–10 months', 'Tolerates heat and humidity well'],
    variants: [{ id: 'std', label: 'Standard pack', note: 'approx. 80 seeds', multiplier: 1 }, { id: 'pro', label: 'Grower pack', note: 'approx. 400 seeds', multiplier: 3 }],
    specs: { 'Days to Harvest': '60–70 days', 'Plant Height': '60–90 cm', 'Sowing Season': 'All year in the plains' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'coriander-seeds-dhania',
    name: 'Coriander (Dhania) Seeds',
    category: 'herb-seeds', price: 79, mrp: 199,
    sold: 30200, seeds: 700,
    tagline: 'Slow-bolting coriander that gives you leaf for weeks, not days.',
    description: 'Ordinary coriander bolts the moment it feels heat, which is why most home-grown patches last a fortnight. This is a slow-bolting selection with broader leaves and a much longer cutting window — sow a short row every three weeks and you will not buy dhania again.',
    highlights: ['Approx. 700 split seeds', 'Slow-bolting — 4–5 weeks of cutting', 'First harvest in 25–30 days', 'Split the seed before sowing for faster germination'],
    variants: [{ id: 'std', label: '50 g pouch', note: 'approx. 700 seeds', multiplier: 1 }],
    specs: { 'Days to Harvest': '25–30 days', 'Sowing Season': 'October–February, shaded through summer', 'Spacing': 'Broadcast, thin to 5 cm' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'okra-bhindi-seeds',
    name: 'Okra (Bhindi) — Arka Anamika',
    category: 'vegetable-seeds', price: 89, mrp: 219,
    sold: 14100, seeds: 50,
    tagline: 'Spineless, tender pods from a variety bred for Indian summers.',
    description: 'Arka Anamika is the okra that made home growing worthwhile: spineless pods that stay tender well past the length at which ordinary bhindi turns fibrous, on a plant with real tolerance to yellow vein mosaic. Pick every second day and it will not stop.',
    highlights: ['Approx. 50 seeds', 'Ready in 45–50 days', 'Spineless, stays tender to 12 cm', 'Yellow vein mosaic tolerant'],
    variants: [{ id: 'std', label: 'Standard pack', note: 'approx. 50 seeds', multiplier: 1 }],
    specs: { 'Days to Harvest': '45–50 days', 'Plant Height': '90–120 cm', 'Sowing Season': 'February–March & June–July' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'wheatgrass-seeds',
    name: 'Wheatgrass Seeds',
    category: 'microgreens', price: 119, mrp: 249,
    sold: 9700, seeds: 5000,
    tagline: 'Juicing-grade wheatgrass — a fresh shot every seven days.',
    description: 'Hard red winter wheat selected for juicing: high yield per tray, sweet rather than grassy, and quick enough that two trays on rotation will keep one person supplied indefinitely.',
    highlights: ['Approx. 5,000 seeds · 500 g', 'Harvest at 7–9 days, around 6 inches', 'Sweet, juicing-grade selection', 'Re-cuts once for a smaller second crop'],
    variants: [{ id: 'std', label: '500 g pouch', note: 'approx. 5,000 seeds', multiplier: 1 }, { id: 'big', label: '2 kg pouch', note: 'approx. 20,000 seeds', multiplier: 3.4 }],
    specs: { 'Days to Harvest': '7–9 days', 'Pre-treatment': 'Soak 8–10 hours', 'Approx. Seed Count': '5,000' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'herb-garden-6-in-1-combo',
    name: 'Herb Garden 6-in-1 Combo',
    category: 'combo-packs', price: 249, mrp: 449,
    sold: 12600, badge: 'New', seeds: 1900,
    tagline: 'Basil, mint, coriander, dill, parsley and oregano for one windowsill.',
    description: 'Six herbs chosen because they will actually grow together on the same balcony under the same watering routine — no single fussy plant to derail the set. Between them they cover Italian, Indian and Middle Eastern cooking.',
    highlights: ['6 varieties · approx. 1,900 seeds', 'All six suit pots and window boxes', 'Staggered maturity so something is always ready', 'Includes a companion planting card'],
    variants: [{ id: 'std', label: 'Standard Kit', note: '6 packs', multiplier: 1 }, { id: 'family', label: 'Double Kit', note: '12 packs', multiplier: 1.8 }],
    specs: { 'Varieties Included': 'Genovese Basil, Mint, Coriander, Dill, Parsley, Oregano', 'Approx. Seed Count': '1,900', 'Days to Harvest': '25–70 days by variety' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'beetroot-microgreens-seeds',
    name: 'Beetroot Microgreens Seeds',
    category: 'microgreens', price: 139, mrp: 289,
    sold: 7300, seeds: 1200,
    tagline: 'Crimson stems and an earthy sweetness that plates beautifully.',
    description: 'Grown for colour as much as flavour — deep magenta stems under green leaves, with the mild earthy sweetness of young beet. Slower than the brassicas at 10–14 days, and worth the wait for any dish you care how it looks.',
    highlights: ['Approx. 1,200 seeds', 'Harvest at 10–14 days', 'Striking crimson stems', 'Soak 4 hours before sowing'],
    variants: [{ id: 'std', label: '50 g pouch', note: 'approx. 1,200 seeds', multiplier: 1 }],
    specs: { 'Days to Harvest': '10–14 days', 'Pre-treatment': 'Soak 4 hours', 'Approx. Seed Count': '1,200' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'moringa-tree-seeds',
    name: 'Moringa (Drumstick) Tree Seeds',
    category: 'tree-seeds', price: 149, mrp: 329,
    sold: 8900, seeds: 25,
    tagline: 'The fastest useful tree you can plant — pods within eighteen months.',
    description: 'Moringa grows faster than almost anything else you can put in the ground and gives you leaves within four months and pods inside two years. It asks for very little: full sun, free-draining soil and restraint with the watering can.',
    highlights: ['Approx. 25 winged seeds', 'Germinates in 7–14 days', 'Leaf harvest from 4 months, pods from 18', 'Drought-hardy once established'],
    variants: [{ id: 'std', label: '25 seeds', note: 'standard pack', multiplier: 1 }, { id: 'big', label: '100 seeds', note: 'plantation pack', multiplier: 3.2 }],
    specs: { 'Germination Time': '7–14 days', 'Mature Height': '8–12 m', 'Sowing Season': 'February–August', 'Spacing': '3 m between trees' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'curry-leaf-tree-seeds',
    name: 'Curry Leaf Tree Seeds',
    category: 'tree-seeds', price: 179, mrp: 379,
    sold: 6400, seeds: 20,
    tagline: 'Fresh-harvested berries — curry leaf seed loses viability fast.',
    description: 'Curry leaf seed is only worth buying fresh; it loses viability within weeks of harvest, which is why so many packets never sprout. These ship within days of depulping. Sow immediately on arrival, keep warm and moist, and expect germination in three to four weeks.',
    highlights: ['Approx. 20 fresh depulped seeds', 'Dispatched within days of harvest', 'Germinates in 21–30 days', 'Grows happily in a large pot'],
    variants: [{ id: 'std', label: '20 seeds', note: 'fresh pack', multiplier: 1 }],
    specs: { 'Germination Time': '21–30 days', 'Mature Height': '3–5 m, prunable to 1.5 m', 'Sowing Season': 'Sow immediately on arrival' },
    faqs: [
      { q: 'Why must I sow these immediately?', a: 'Curry leaf seed is recalcitrant — it cannot be dried and stored like most seed without dying. Ours ship fresh, but viability drops sharply after about three weeks, so sow the day the parcel arrives.' },
      ...SHIPPING_FAQ
    ]
  },
  {
    slug: 'golden-bamboo-seeds',
    name: 'Golden Bamboo Seeds',
    category: 'bamboo-seeds', price: 199, mrp: 449,
    sold: 3800, seeds: 100,
    tagline: 'A dense golden screen that clumps rather than runs.',
    description: 'Clumping golden bamboo for a privacy screen you will not regret — it stays where you plant it instead of sending runners under the wall. Culms turn a warm gold in full sun and reach a usable screening height in three seasons.',
    highlights: ['Approx. 100 seeds', 'Clumping habit — non-invasive', 'Screening height in 3 seasons', 'Germinates in 15–25 days'],
    variants: [{ id: 'std', label: '100 seeds', note: 'standard pack', multiplier: 1 }, { id: 'big', label: '500 seeds', note: 'screen pack', multiplier: 3.5 }],
    specs: { 'Germination Time': '15–25 days', 'Mature Height': '6–8 m', 'Habit': 'Clumping (non-invasive)', 'Spacing': '1.5 m for a solid screen' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'cucumber-seeds',
    name: 'Cucumber (Poinsett) Seeds',
    category: 'vegetable-seeds', price: 89, mrp: 219,
    sold: 10300, seeds: 30,
    tagline: 'Straight, dark 20 cm fruit with real disease resistance.',
    description: 'Poinsett earns its place through resistance — downy mildew, powdery mildew and anthracnose all bounce off it, which matters far more than yield once the monsoon sets in. Fruit is straight, dark green and crisp at around 20 cm.',
    highlights: ['Approx. 30 seeds', 'Harvest from 55 days', 'Resistant to mildew and anthracnose', 'Trellis or let it trail'],
    variants: [{ id: 'std', label: 'Standard pack', note: 'approx. 30 seeds', multiplier: 1 }],
    specs: { 'Days to Harvest': '55–65 days', 'Sowing Season': 'February–March & June–July', 'Spacing': '60 cm, trellised' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'mustard-microgreens-seeds',
    name: 'Mustard Microgreens Seeds',
    category: 'microgreens', price: 109, mrp: 229,
    sold: 6900, seeds: 3000,
    tagline: 'A clean wasabi-like heat, ready in a week.',
    description: 'The sharpest thing in the microgreen tray — a clean horseradish heat that cuts through rich food. Fast, cheap and near impossible to fail, which makes it the variety to hand a sceptical beginner.',
    highlights: ['Approx. 3,000 seeds', 'Harvest in 6–8 days', 'Sharp wasabi-like heat', 'No pre-soak needed'],
    variants: [{ id: 'std', label: '50 g pouch', note: 'approx. 3,000 seeds', multiplier: 1 }],
    specs: { 'Days to Harvest': '6–8 days', 'Approx. Seed Count': '3,000', 'Pre-treatment': 'None required' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'salad-greens-5-in-1-combo',
    name: 'Salad Greens 5-in-1 Combo',
    category: 'combo-packs', price: 229, mrp: 419,
    sold: 8200, seeds: 2600,
    tagline: 'Lettuce, rocket, spinach, Swiss chard and kale for a season of salads.',
    description: 'Five leaf crops that grow at compatible speeds in the same bed, so one sowing gives you a mixed harvest rather than a glut of one thing. Cut-and-come-again on all five — a single sowing yields three or four cuttings.',
    highlights: ['5 varieties · approx. 2,600 seeds', 'Cut-and-come-again, 3–4 harvests per sowing', 'First cut in 30–40 days', 'Ideal for the winter kitchen garden'],
    variants: [{ id: 'std', label: 'Standard Kit', note: '5 packs', multiplier: 1 }, { id: 'family', label: 'Double Kit', note: '10 packs', multiplier: 1.8 }],
    specs: { 'Varieties Included': 'Lettuce, Rocket, Spinach, Swiss Chard, Kale', 'Approx. Seed Count': '2,600', 'Sowing Season': 'September–February' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'mint-pudina-seeds',
    name: 'Mint (Pudina) Seeds',
    category: 'herb-seeds', price: 89, mrp: 209,
    sold: 13400, seeds: 800,
    tagline: 'Spearmint for chutney, chai and everything in between.',
    description: 'True spearmint from seed — slower to establish than a cutting, but you get a whole bed for the price of one nursery pot. Once away it is essentially permanent; grow it in a container unless you want it everywhere.',
    highlights: ['Approx. 800 seeds', 'First cut at 60–70 days', 'Perennial — crops for years', 'Grow in a pot to keep it contained'],
    variants: [{ id: 'std', label: 'Standard pack', note: 'approx. 800 seeds', multiplier: 1 }],
    specs: { 'Days to Harvest': '60–70 days', 'Plant Height': '30–45 cm', 'Sowing Season': 'February–April & August–September' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'radish-microgreens-seeds',
    name: 'Golden Radish Microgreens Seeds',
    category: 'microgreens', price: 119, mrp: 249,
    sold: 8100, seeds: 2200,
    tagline: 'The fastest crop in the tray — cut at six days.',
    description: 'Radish is where to start if you want proof the whole thing works: visible sprouts overnight, a full tray in under a week, and a bright peppery bite that tastes exactly like the root it would have become.',
    highlights: ['Approx. 2,200 seeds', 'Harvest in 5–7 days — fastest variety we sell', 'Bright peppery flavour', 'Extremely forgiving for beginners'],
    variants: [{ id: 'std', label: '50 g pouch', note: 'approx. 2,200 seeds', multiplier: 1 }, { id: 'big', label: '250 g pouch', note: 'approx. 11,000 seeds', multiplier: 3.4 }],
    specs: { 'Days to Harvest': '5–7 days', 'Approx. Seed Count': '2,200', 'Pre-treatment': 'None required' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'gulmohar-tree-seeds',
    name: 'Gulmohar (Flame Tree) Seeds',
    category: 'tree-seeds', price: 129, mrp: 299,
    sold: 5100, seeds: 30,
    tagline: 'Scarlet canopies in summer from a tree that grows fast.',
    description: 'Delonix regia — the flame tree that turns Indian streets scarlet in May. Fast-growing and shade-giving, it wants space and full sun; give it both and it flowers from year four or five.',
    highlights: ['Approx. 30 seeds', 'Scarify and soak 24 hours before sowing', 'Germinates in 10–20 days', 'Flowers from year 4–5'],
    variants: [{ id: 'std', label: '30 seeds', note: 'standard pack', multiplier: 1 }],
    specs: { 'Germination Time': '10–20 days', 'Mature Height': '10–12 m', 'Pre-treatment': 'Nick the coat, soak 24 hours', 'Sowing Season': 'March–July' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'dragon-bamboo-seeds',
    name: 'Dragon Bamboo Seeds',
    category: 'bamboo-seeds', price: 249, mrp: 549,
    sold: 2600, seeds: 50,
    tagline: 'Giant timber bamboo — culms to 20 m and 20 cm across.',
    description: 'Dendrocalamus giganteus, the largest bamboo there is. This is a plantation and large-property plant rather than a garden one: mature culms reach 20 m with a 20 cm diameter, and it needs deep soil and serious water to get there.',
    highlights: ['Approx. 50 seeds', 'Culms to 20 m tall, 20 cm diameter', 'Germinates in 20–30 days', 'Needs deep soil and reliable water'],
    variants: [{ id: 'std', label: '50 seeds', note: 'standard pack', multiplier: 1 }],
    specs: { 'Germination Time': '20–30 days', 'Mature Height': 'Up to 20 m', 'Habit': 'Clumping', 'Spacing': '5–8 m' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'spinach-palak-seeds',
    name: 'Spinach (Palak) — All Green',
    category: 'vegetable-seeds', price: 79, mrp: 189,
    sold: 21500, seeds: 350,
    tagline: 'Thick, dark leaves and four cuttings from a single sowing.',
    description: 'All Green is the palak variety worth growing at home: thick dark leaves, a long cutting window, and enough cold tolerance to carry a north Indian winter bed straight through to February.',
    highlights: ['Approx. 350 seeds', 'First cut in 30 days, then every 15', 'Up to 4 cuttings per sowing', 'Cold tolerant'],
    variants: [{ id: 'std', label: '25 g pouch', note: 'approx. 350 seeds', multiplier: 1 }, { id: 'big', label: '100 g pouch', note: 'approx. 1,400 seeds', multiplier: 3 }],
    specs: { 'Days to Harvest': '30 days to first cut', 'Sowing Season': 'September–February', 'Spacing': 'Broadcast, thin to 10 cm' },
    faqs: SHIPPING_FAQ
  },
  {
    slug: 'microgreens-starter-tray-kit',
    name: 'Microgreens Starter Tray Kit',
    category: 'growing-kits', price: 649, mrp: 1099,
    sold: 4900, badge: 'Bestseller', seeds: 3385,
    tagline: 'Everything but the windowsill — trays, medium, seed and a spray bottle.',
    description: 'The full setup for someone who does not want to source parts separately: three growing trays with drainage, three compressed coco peat blocks, a mister, a harvesting card and the complete 7-in-1 seed combo. Unbox it and you can be sowing in ten minutes.',
    highlights: ['3 growing trays + 3 coco peat blocks + mister', 'Includes the full 7-in-1 microgreens seed combo', 'Illustrated 12-page growing guide', 'First harvest within 7 days of unboxing'],
    variants: [{ id: 'std', label: 'Starter Kit', note: '3 trays', multiplier: 1 }, { id: 'pro', label: 'Continuous Kit', note: '6 trays', multiplier: 1.7 }],
    specs: { 'Kit Contents': '3 trays, 3 coco peat blocks, mister, harvest card, 7 seed packs, growing guide', 'Tray Size': '10 x 10 in', 'Approx. Seed Count': '3,385' },
    faqs: [
      { q: 'Do I need to buy soil separately?', a: 'No. The three compressed coco peat blocks expand to fill all three trays. You only need water to start.' },
      ...SHIPPING_FAQ
    ]
  },
  {
    slug: 'microgreens-continuous-harvest-kit',
    name: 'Continuous Harvest Microgreens Kit',
    category: 'growing-kits', price: 1149, mrp: 1899,
    sold: 3600, badge: 'Bestseller', seeds: 6770,
    tagline: 'Six trays on rotation — cut something fresh every single day.',
    description: 'One tray gives you a harvest; six trays give you a habit. This is the kit for anyone who tried microgreens, liked them, and got tired of the gap between one crop finishing and the next being ready. Sow one tray a day for six days and from then on there is always a tray at cutting stage, one germinating, and four in between. The sowing wheel in the box tells you which tray to start each morning.',
    highlights: [
      '6 growing trays + 6 coco peat blocks + mister and harvest shears',
      'Double seed allocation — 14 packs, approx. 6,770 seeds',
      'Printed sowing wheel so you never lose track of the rotation',
      'Yields roughly 150–200 g of cut microgreens a week'
    ],
    variants: [
      { id: 'std', label: 'Six-tray kit', note: '6 trays · 14 seed packs', multiplier: 1 },
      { id: 'twelve', label: 'Twelve-tray kit', note: '12 trays · 28 seed packs', multiplier: 1.75 }
    ],
    specs: { 'Kit Contents': '6 trays, 6 coco peat blocks, mister, harvest shears, sowing wheel, 14 seed packs', 'Tray Size': '10 x 10 in', 'Approx. Seed Count': '6,770', 'Weekly Yield': '150–200 g cut greens', 'Days to Harvest': '5–12 days by variety' },
    faqs: [
      { q: 'How much counter space does this need?', a: 'Six 10x10 inch trays need about 3 ft of run if you lay them flat, or roughly one square foot on the three-tier rack we sell separately. Most people split them between a windowsill and a kitchen counter.' },
      { q: 'Do I have to sow every day?', a: 'No — the wheel is a suggestion, not a rule. Sow two trays every other day and you get the same effect with half the fuss. The rotation only matters if you want a genuinely continuous supply.' },
      ...SHIPPING_FAQ
    ]
  },
  {
    slug: 'hydroponic-microgreens-kit',
    name: 'Hydroponic Microgreens Kit',
    category: 'growing-kits', price: 899, mrp: 1499,
    sold: 2400, badge: 'New', seeds: 3385,
    tagline: 'Hemp mats instead of soil — no mess, no compost, nothing to dispose of.',
    description: 'The same crop without the potting mix. Seeds go onto a biodegradable hemp mat sitting in a shallow water reservoir, and the roots do the rest. You lose the slight earthiness that soil gives and gain a kitchen that stays clean — no spilled coco peat, no soil in the sink when you rinse the harvest, and a spent mat that goes straight into the compost bin.',
    highlights: [
      '3 trays with reservoirs + 12 biodegradable hemp grow mats',
      'No soil, no compost, nothing to sweep up',
      'Roots stay clean — rinse and eat straight after cutting',
      'Includes the full 7-in-1 seed combo, approx. 3,385 seeds'
    ],
    variants: [
      { id: 'std', label: 'Starter kit', note: '3 trays · 12 mats', multiplier: 1 },
      { id: 'refillx', label: 'Kit + 24 spare mats', note: '3 trays · 36 mats', multiplier: 1.4 }
    ],
    specs: { 'Kit Contents': '3 trays with reservoirs, 12 hemp grow mats, mister, 7 seed packs, guide', 'Growing Medium': 'Biodegradable hemp fibre mat', 'Tray Size': '10 x 10 in', 'Approx. Seed Count': '3,385', 'Days to Harvest': '6–12 days' },
    faqs: [
      { q: 'Do hydroponic microgreens taste different?', a: 'Slightly. Soil-grown greens have a touch more mineral depth; hemp-grown are cleaner and a little sweeter. Most people cannot tell them apart in a salad, and the difference is smaller than the difference between varieties.' },
      { q: 'Do I need nutrients or plant food?', a: 'No. Microgreens are harvested before they exhaust the seed\'s own energy reserve, so plain water is enough from sowing to cutting. Adding nutrients does nothing except risk algae.' },
      { q: 'How many crops does one mat give?', a: 'One. The mat comes out with the root mass at harvest and goes into the compost. That is the trade-off for not handling soil — you buy mats instead of potting mix.' },
      ...SHIPPING_FAQ
    ]
  },
  {
    slug: 'microgreens-gift-kit',
    name: 'Microgreens Gift Kit',
    category: 'growing-kits', price: 799, mrp: 1299,
    sold: 2100, badge: 'New', seeds: 1450,
    tagline: 'A boxed, ribboned kit that gives someone a harvest within a week.',
    description: 'Most plant gifts ask the recipient to be patient for months. This one pays out in seven days, which is why it works for people who do not think of themselves as gardeners. Presented in a rigid kraft box with a cloth ribbon and a blank card, holding two trays, medium, a mister and four seed varieties chosen for speed and colour.',
    highlights: [
      'Gift-boxed with ribbon and a blank message card',
      '2 trays, 2 coco peat blocks, brass mister, 4 seed varieties',
      'Radish and mustard included so the first cut lands in a week',
      'Ships in outer packaging — the gift box arrives unmarked'
    ],
    variants: [
      { id: 'std', label: 'Gift kit', note: '2 trays · 4 varieties', multiplier: 1 },
      { id: 'lux', label: 'Deluxe gift kit', note: '3 trays · 7 varieties · linen bag', multiplier: 1.5 }
    ],
    specs: { 'Kit Contents': '2 trays, 2 coco peat blocks, brass mister, 4 seed packs, guide, message card', 'Varieties Included': 'Golden Radish, Mustard, Broccoli, Beetroot', 'Approx. Seed Count': '1,450', 'Presentation': 'Rigid kraft box, cloth ribbon', 'Days to Harvest': '6–12 days' },
    faqs: [
      { q: 'Can you send it straight to the recipient?', a: 'Yes — enter their address at checkout and add your message in the order notes. We write it onto the card by hand and leave the invoice out of the parcel.' },
      { q: 'Is this suitable for someone with no gardening experience?', a: 'It is designed for exactly that. The four varieties are the most forgiving we stock, and the guide is a single illustrated card rather than a booklet.' },
      ...SHIPPING_FAQ
    ]
  },
  {
    slug: 'kids-microgreens-grow-kit',
    name: "Kids' Grow-Your-Own Microgreens Kit",
    category: 'growing-kits', price: 549, mrp: 899,
    sold: 2900, seeds: 1800,
    tagline: 'Sprouts visible overnight and a harvest before a child loses interest.',
    description: 'The reason bean-in-a-jar projects fail is that nothing happens fast enough. Radish shows above the medium overnight and is ready to cut in under a week, which is inside a seven-year-old\'s attention span. The kit adds a growth chart to mark each morning, plant labels to write on, and a set of stickers — the parts that turn watching a tray into a daily ritual.',
    highlights: [
      '2 shallow trays sized for small hands, plus a growth chart and stickers',
      'Fast varieties only — visible sprouts overnight, harvest in 5–8 days',
      'Non-toxic, untreated seed; safe to handle and eat raw',
      'Illustrated 8-page activity guide with things to measure and record'
    ],
    variants: [
      { id: 'std', label: 'Kids kit', note: '2 trays · 3 varieties', multiplier: 1 },
      { id: 'class', label: 'Classroom pack', note: '10 trays · 3 varieties', multiplier: 3.4 }
    ],
    specs: { 'Kit Contents': '2 trays, 2 coco peat blocks, mister, 3 seed packs, growth chart, stickers, activity guide', 'Varieties Included': 'Golden Radish, Mustard, Sunflower', 'Approx. Seed Count': '1,800', 'Suitable Age': '5 years and up, with supervision for cutting', 'Days to Harvest': '5–8 days' },
    faqs: [
      { q: 'Is everything in the kit safe for children?', a: 'Yes. The seed is untreated and food-grade, the trays are BPA-free, and the medium is plain coco peat. The only thing needing an adult is the scissors at harvest.' },
      { q: 'Will this work as a school project?', a: 'It is one of our most common uses — the classroom pack has ten trays so a group can each run their own and compare growth rates. The chart is designed to be measured and graphed.' },
      ...SHIPPING_FAQ
    ]
  },
  {
    slug: 'wheatgrass-juicing-kit',
    name: 'Wheatgrass Juicing Kit',
    category: 'growing-kits', price: 749, mrp: 1249,
    sold: 1900, seeds: 10000,
    tagline: 'Four trays on rotation — a fresh shot every morning, indefinitely.',
    description: 'Wheatgrass is only worth growing if you can keep it going, and one tray cannot. Four trays on a four-day stagger means there is always one at cutting height while the next is coming through. The kit includes a kilo of juicing-grade hard red winter wheat, which is enough to run the rotation for about two months before you reorder.',
    highlights: [
      '4 trays + 1 kg juicing-grade wheat, approx. 10,000 seeds',
      'Four-day rotation gives a daily shot with no gaps',
      'Includes a soaking jar with a mesh lid for pre-germination',
      'Roughly two months of daily shots per kit'
    ],
    variants: [
      { id: 'std', label: 'Four-tray kit', note: '4 trays · 1 kg seed', multiplier: 1 },
      { id: 'big', label: 'Eight-tray kit', note: '8 trays · 2.5 kg seed', multiplier: 1.85 }
    ],
    specs: { 'Kit Contents': '4 trays, 4 coco peat blocks, soaking jar with mesh lid, 1 kg wheat seed, rotation card', 'Approx. Seed Count': '10,000', 'Days to Harvest': '7–9 days', 'Yield Per Tray': 'Approx. 250 g grass, 60–70 ml juice', 'Pre-treatment': 'Soak 8–10 hours in the supplied jar' },
    faqs: [
      { q: 'Does the kit include a juicer?', a: 'No. Wheatgrass needs a masticating or manual auger juicer — a centrifugal one shreds it without extracting much — and we would rather not bundle an appliance you may already own or want to choose yourself.' },
      { q: 'Can I re-cut a tray?', a: 'Yes, once. The second cut comes in thinner and slightly more bitter, and there is rarely a worthwhile third. Compost the tray after the second harvest and start a fresh one.' },
      ...SHIPPING_FAQ
    ]
  },
  {
    slug: 'microgreens-growing-rack-3-tier',
    name: 'Three-Tier Microgreens Rack',
    category: 'growing-kits', price: 1899, mrp: 2999,
    sold: 1400, seeds: 0,
    tagline: 'Nine trays in one square foot of floor, with lights on every shelf.',
    description: 'The constraint on growing microgreens at home is rarely enthusiasm — it is windowsill. This powder-coated steel rack takes nine trays across three shelves in about a square foot of floor space, with a full-spectrum LED strip under each shelf so it works in a corridor or a corner with no daylight at all. Assembles with the supplied key in about fifteen minutes.',
    highlights: [
      'Holds 9 standard 10x10 in trays across 3 shelves',
      'Full-spectrum LED strip per shelf, 30 W total, with an inline timer',
      'Powder-coated steel; drip trays catch run-off',
      'Footprint of roughly 1 sq ft — fits a corridor or balcony corner'
    ],
    variants: [
      { id: 'std', label: 'Three-tier rack', note: '9 trays · 3 LED strips', multiplier: 1 },
      { id: 'seeded', label: 'Rack + starter bundle', note: 'plus 9 trays of medium & seed', multiplier: 1.35 }
    ],
    specs: { 'Dimensions': '62 cm W x 32 cm D x 120 cm H', 'Tray Capacity': '9 trays (10 x 10 in)', 'Lighting': '3 x full-spectrum LED strips, 30 W total, inline timer', 'Material': 'Powder-coated steel', 'Assembly': 'Tool-free, approx. 15 minutes', 'Trays Included': 'Yes, 9 trays and drip trays' },
    faqs: [
      { q: 'Does it come with seeds?', a: 'The standard rack is hardware only — trays and lights but no seed or medium, since most people buying a rack already have their varieties. The starter bundle adds medium and seed for all nine trays.' },
      { q: 'How much electricity do the lights use?', a: 'About 30 W across all three shelves — comparable to a single old-style bulb. Running 14 hours a day works out to roughly 12 units a month.' },
      { q: 'Can it hold trays from another supplier?', a: 'Yes, if they are the standard 10x10 inch (1020 half-tray) size, which almost all microgreen trays are. Shelf clearance is 30 cm, so domed trays fit too.' },
      ...SHIPPING_FAQ
    ]
  },
  {
    slug: 'microgreens-refill-pack',
    name: 'Microgreens Refill Pack',
    category: 'growing-kits', price: 399, mrp: 649,
    sold: 5200, seeds: 3385,
    tagline: 'Medium, trays and seed to keep a kit you already own running.',
    description: 'Once the first kit is spent you need consumables, not another mister. This is the refill: six coco peat blocks, three replacement trays and the full seven-variety seed set, at roughly half what the trays and seed cost bought separately. Ordering one every couple of months is what most regular growers settle into.',
    highlights: [
      '6 coco peat blocks + 3 replacement trays + 7 seed packs',
      'Approx. 3,385 seeds — around 25 trays of growing',
      'Fits every SeedNest kit and any standard 10x10 in tray',
      'Roughly half the cost of buying the parts separately'
    ],
    variants: [
      { id: 'std', label: 'Refill pack', note: '6 blocks · 3 trays · 7 packs', multiplier: 1 },
      { id: 'double', label: 'Double refill', note: '12 blocks · 6 trays · 14 packs', multiplier: 1.8 }
    ],
    specs: { 'Pack Contents': '6 coco peat blocks, 3 trays, 7 seed packs', 'Approx. Seed Count': '3,385', 'Compatibility': 'All SeedNest kits and standard 10 x 10 in trays', 'Coverage': 'Approx. 25 trays of growing' },
    faqs: [
      { q: 'Will this fit the kit I already have?', a: 'If your trays are the standard 10x10 inch size, yes — that covers every kit we sell and nearly every tray sold elsewhere. The coco peat blocks are sized to fill one tray each with an inch of medium.' },
      ...SHIPPING_FAQ
    ]
  }
];

/* ------------------------------------------------------------------ art ---- */

const MOTIFS = {
  sprout: `<path d="M100 150V88" /><path d="M100 96c0-18-13-31-31-31 0 18 13 31 31 31z" fill="currentColor" stroke="none" opacity=".85"/><path d="M100 108c0-18 13-31 31-31 0 18-13 31-31 31z" fill="currentColor" stroke="none"/>`,
  micro: `<path d="M72 152V104M100 152V92M128 152V108" /><path d="M72 108c-14 0-24-10-24-23 14 0 24 10 24 23z" fill="currentColor" stroke="none"/><path d="M100 96c0-15 11-26 26-26 0 15-11 26-26 26z" fill="currentColor" stroke="none"/><path d="M128 112c11 0 20-9 20-20-11 0-20 9-20 20z" fill="currentColor" stroke="none" opacity=".8"/>`,
  herb: `<path d="M100 154V70" /><path d="M100 92c-16-4-25-17-22-33 16 4 25 17 22 33zM100 116c16-4 25-17 22-33-16 4-25 17-22 33zM100 140c-14-3-22-15-19-29 14 3 22 15 19 29z" fill="currentColor" stroke="none" opacity=".9"/>`,
  tree: `<path d="M100 154v-44" /><circle cx="100" cy="80" r="34" fill="currentColor" stroke="none" opacity=".9"/><circle cx="72" cy="98" r="20" fill="currentColor" stroke="none" opacity=".75"/><circle cx="128" cy="98" r="20" fill="currentColor" stroke="none" opacity=".75"/>`,
  bamboo: `<path d="M82 156V56M118 156V70" /><path d="M82 130h0M82 104h0M82 78h0" /><rect x="74" y="124" width="16" height="5" rx="2.5" fill="currentColor" stroke="none"/><rect x="74" y="96" width="16" height="5" rx="2.5" fill="currentColor" stroke="none"/><rect x="74" y="68" width="16" height="5" rx="2.5" fill="currentColor" stroke="none"/><rect x="110" y="130" width="16" height="5" rx="2.5" fill="currentColor" stroke="none"/><rect x="110" y="104" width="16" height="5" rx="2.5" fill="currentColor" stroke="none"/><path d="M118 84c14-6 22-2 26 6-14 6-22 2-26-6z" fill="currentColor" stroke="none"/>`,
  combo: `<circle cx="76" cy="80" r="17" fill="currentColor" stroke="none" opacity=".9"/><circle cx="124" cy="80" r="17" fill="currentColor" stroke="none" opacity=".65"/><circle cx="76" cy="128" r="17" fill="currentColor" stroke="none" opacity=".65"/><circle cx="124" cy="128" r="17" fill="currentColor" stroke="none" opacity=".9"/><circle cx="100" cy="104" r="13" fill="currentColor" stroke="none"/>`
};

/* Slots with real photography in assets/img/products/. Anything not listed here
   falls back to the generated seed-packet SVG, so new products still render. */
const PHOTOS = new Set([
  '7-in-1-microgreens-seed-combo', 'indian-veggie-combo-12-in-1', 'broccoli-microgreens-seeds',
  'red-cherry-tomato-seeds', 'italian-basil-seeds', 'sunflower-microgreens-seeds',
  'green-chilli-seeds', 'coriander-seeds-dhania', 'okra-bhindi-seeds', 'wheatgrass-seeds',
  'herb-garden-6-in-1-combo', 'beetroot-microgreens-seeds', 'moringa-tree-seeds',
  'curry-leaf-tree-seeds', 'golden-bamboo-seeds', 'cucumber-seeds', 'mustard-microgreens-seeds',
  'salad-greens-5-in-1-combo', 'mint-pudina-seeds', 'radish-microgreens-seeds',
  'gulmohar-tree-seeds', 'dragon-bamboo-seeds', 'spinach-palak-seeds',
  // Growing kits
  'microgreens-starter-tray-kit', 'microgreens-continuous-harvest-kit',
  'hydroponic-microgreens-kit', 'microgreens-gift-kit', 'kids-microgreens-grow-kit',
  'wheatgrass-juicing-kit', 'microgreens-growing-rack-3-tier', 'microgreens-refill-pack',
  // Hero + category tiles
  '_hero', '_cat-growing-kits', '_cat-vegetable-seeds', '_cat-microgreens',
  '_cat-herb-seeds', '_cat-combo-packs', '_cat-tree-seeds', '_cat-bamboo-seeds'
]);

/* One photo per product stands in for a multi-shot gallery: each "view" is a
   different crop of the same frame, which reads as a set without faking stock. */
const CROPS = [
  { pos: '50% 50%', zoom: 1 },
  { pos: '50% 28%', zoom: 1.45 },
  { pos: '32% 72%', zoom: 1.3 }
];

/**
 * Product imagery: a real photograph where we have one, else generated artwork.
 * @param {object} product  needs `slug`, `name`, `category`
 * @param {{view?: number, alt?: string}} [opts]
 */
function art(product, opts = {}) {
  const view = opts.view || 0;

  if (PHOTOS.has(product.slug)) {
    const crop = CROPS[view % CROPS.length];
    const alt = opts.alt || product.name;
    return `<img class="photo" src="assets/img/products/${product.slug}.jpg"
      alt="${escapeHtml(alt)}" loading="lazy" decoding="async"
      style="object-position:${crop.pos};transform:scale(${crop.zoom})">`;
  }

  return svgArt(product, view);
}

function svgArt(product, view) {
  const cat = CATEGORIES.find(c => c.slug === product.category) || CATEGORIES[0];
  const [dark, light] = cat.palette;
  const motif = MOTIFS[cat.motif] || MOTIFS.sprout;

  // Three "views" mimic a photo gallery: packet front, seed macro, growing tray.
  const scenes = [
    `<rect x="46" y="30" width="108" height="146" fill="#fff" opacity=".94"/>
     <rect x="46" y="30" width="108" height="40" fill="${dark}"/>
     <g stroke="${dark}" stroke-width="5" stroke-linecap="round" fill="none" color="${dark}" transform="translate(0,14) scale(1,.86)">${motif}</g>
     <rect x="64" y="150" width="72" height="5" fill="${dark}" opacity=".25"/>
     <rect x="76" y="162" width="48" height="4" fill="${dark}" opacity=".16"/>`,

    `<g fill="${dark}">
       <ellipse cx="72" cy="88" rx="15" ry="11" opacity=".9" transform="rotate(-18 72 88)"/>
       <ellipse cx="118" cy="72" rx="13" ry="9" opacity=".75" transform="rotate(22 118 72)"/>
       <ellipse cx="100" cy="112" rx="17" ry="12" opacity=".95" transform="rotate(-6 100 112)"/>
       <ellipse cx="140" cy="116" rx="12" ry="8" opacity=".7" transform="rotate(34 140 116)"/>
       <ellipse cx="66" cy="134" rx="14" ry="10" opacity=".8" transform="rotate(12 66 134)"/>
       <ellipse cx="112" cy="148" rx="11" ry="8" opacity=".6" transform="rotate(-24 112 148)"/>
     </g>`,

    `<rect x="34" y="112" width="132" height="52" fill="${dark}" opacity=".18"/>
     <rect x="34" y="112" width="132" height="14" fill="${dark}" opacity=".3"/>
     <g stroke="${dark}" stroke-width="4" stroke-linecap="round" fill="none" color="${dark}">
       <path d="M60 112V78M80 112V66M100 112V72M120 112V64M140 112V80"/>
       <path d="M60 82c-10 0-17-7-17-16 10 0 17 7 17 16z" fill="${dark}" stroke="none" opacity=".85"/>
       <path d="M80 70c0-11 8-19 19-19 0 11-8 19-19 19z" fill="${dark}" stroke="none" opacity=".9"/>
       <path d="M120 68c10-2 17-9 15-19-10 2-17 9-15 19z" fill="${dark}" stroke="none" opacity=".8"/>
       <path d="M140 84c-9 0-16-6-16-14 9 0 16 6 16 14z" fill="${dark}" stroke="none" opacity=".7"/>
     </g>`
  ];

  const id = `g-${product.slug}-${view}`;
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${escapeHtml(product.name)}" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;aspect-ratio:1">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${light}" stop-opacity=".55"/>
        <stop offset="1" stop-color="${dark}" stop-opacity=".18"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="url(#${id})"/>
    ${scenes[view % scenes.length]}
  </svg>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

/* ------------------------------------------------------------- lookups ---- */

const catalog = {
  categories: CATEGORIES,
  products: PRODUCTS,
  art,
  escapeHtml,
  /** Photography for a category tile or the hero, by image key (e.g. '_hero'). */
  keyArt: (key, alt, view = 0) => art({ slug: key, name: alt, category: 'microgreens' }, { view, alt }),
  bySlug: slug => PRODUCTS.find(p => p.slug === slug),
  byCategory: slug => PRODUCTS.filter(p => p.category === slug),
  categoryName: slug => (CATEGORIES.find(c => c.slug === slug) || {}).name || 'All seeds',
  countIn: slug => PRODUCTS.filter(p => p.category === slug).length,
  /** Noun for counting items in a category — 'kits' reads wrong as 'varieties'. */
  unitFor: slug => (CATEGORIES.find(c => c.slug === slug) || {}).unit || 'varieties',
  tailFor: slug => (CATEGORIES.find(c => c.slug === slug) || {}).tail
    || 'all non-GMO, open pollinated and germination tested.',
  /** Same-category products first, topped up with bestsellers. */
  related(product, limit = 4) {
    const same = PRODUCTS.filter(p => p.category === product.category && p.slug !== product.slug);
    const rest = PRODUCTS.filter(p => p.category !== product.category && p.slug !== product.slug)
      .sort((a, b) => b.sold - a.sold);
    return [...same, ...rest].slice(0, limit);
  }
};

window.catalog = catalog;
