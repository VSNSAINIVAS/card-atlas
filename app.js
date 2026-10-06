'use strict';
const $ = (s) => document.querySelector(s);
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
const dateLabel = (s) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(s + 'T00:00:00+05:30'));
const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
const expired = (o) => Boolean(o.expiry && o.expiry < today());
let data,
  limits,
  selectedCard = 'all',
  category = 'All',
  query = '',
  type = 'all',
  region = 'domestic',
  merchant = 'all',
  view = 'offers';
const poolInfo = {
  hdfc: {
    name: 'HDFC shared limit',
    cards: 'Millennia + Regalia Gold',
    theme: 'blue',
    color: '#77d7be',
  },
  pixel: {
    name: 'HDFC PIXEL Play',
    cards: 'PIXEL Play',
    theme: 'purple',
    color: '#b8a1e7',
  },
  axis: {
    name: 'Axis shared limit',
    cards: 'Airtel Axis + My Zone',
    theme: 'berry',
    color: '#e19aac',
  },
  au: {
    name: 'AU ixigo',
    cards: 'ixigo AU',
    theme: 'orange',
    color: '#f3b06d',
  },
};
const cats = [
  'All',
  'Shopping',
  'Dining',
  'Travel',
  'Lounges',
  'Bills',
  'Entertainment',
  'Rewards',
  'Milestones',
  'Fuel',
  'UPI',
  'Welcome',
  'Fees',
];
const icons = {
  All: 'M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h6v6h-6z',
  Shopping: 'M4 7h16l-1 14H5z M8 8V6a4 4 0 0 1 8 0v2',
  Dining: 'M5 2v7m4-7v7M3 6h8M7 9v13M18 2v20M18 2c-5 3-5 9 0 9',
  Travel: 'M3 12l7-2 5-8 3 1-3 7 6 2v2l-6 1-2 7-2-1v-6l-8-1z',
  Lounges: 'M5 12V5h14v7M3 11h3v7h12v-7h3v10H3z',
  Bills: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6',
  Entertainment: 'M3 5h18v14H3zM10 9l5 3-5 3z',
  Rewards: 'M12 3l3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1z',
  Milestones: 'M5 22V3h13l-3 4 3 4H5',
  Fuel: 'M4 21V4h10v17M4 9h10M14 12h3v6c0 3 4 3 4 0V8l-3-3M2 21h14',
  UPI: 'M4 4h5v5H4zM15 4h5v5h-5zM4 15h5v5H4zM15 15h5v5h-5z',
  Welcome: 'M3 9h18v4H3zM5 13v8h14v-8M12 9v12M12 9C2 9 6-2 12 9c6-11 10 0 0 0',
};
function icon(c) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="${icons[c] || icons.Bills}"/></svg>`;
}
function safeURL(url) {
  const u = new URL(url);
  if (u.protocol !== 'https:') throw new Error('Insecure source URL');
  return u.href;
}
async function getJSON(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}
function validateLimits(v) {
  return (
    v &&
    v.currency === 'INR' &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.updated) &&
    Object.keys(poolInfo).every(
      (k) => Number.isSafeInteger(v.pools?.[k]) && v.pools[k] >= 0,
    ) &&
    Object.keys(v.pools).length === 4
  );
}
function renderLimits() {
  const total = Object.values(limits.pools).reduce((a, b) => a + b, 0);
  $('#total-limit').textContent = fmt(total);
  $('#allocation').innerHTML = Object.entries(limits.pools)
    .map(
      ([k, v]) =>
        `<span style="flex:${total ? v : 1};background:${poolInfo[k].color}"></span>`,
    )
    .join('');
  $('#pool-grid').innerHTML = Object.entries(poolInfo)
    .map(
      ([k, p]) =>
        `<article class="pool ${p.theme}"><span>${['hdfc', 'axis'].includes(k) ? 'SHARED POOL' : 'INDIVIDUAL POOL'}</span><h3>${p.name}</h3><strong>${fmt(limits.pools[k])}</strong><p>${p.cards}</p></article>`,
    )
    .join('');
  $('#limits-updated').textContent =
    `Limits last updated ${dateLabel(limits.updated)} · Provided by Nivas`;
}
function renderCards() {
  $('#card-grid').innerHTML = data.cards
    .map(
      (c) =>
        `<button class="wallet-card ${c.theme}${selectedCard === c.id ? ' selected' : ''}" data-card="${c.id}" aria-pressed="${selectedCard === c.id}" aria-label="Filter by ${esc(c.bank + ' ' + c.name)}"><span class="mini-card" aria-hidden="true"><span class="issuer">${esc(c.bank.toUpperCase())}</span><span class="card-wordmark">${esc(c.name)}</span><span class="mini-bottom"><span class="mini-chip"></span><span>•••• ••••</span></span></span><span class="name">${esc(c.name)}</span><span class="amount">${limits ? fmt(limits.pools[c.pool]) : 'Unavailable'}</span><span class="limit-label">${['hdfc', 'axis'].includes(c.pool) ? 'Shared pool' : 'Individual limit'}</span><span class="card-subtitle">${esc(c.tagline)}</span></button>`,
    )
    .join('');
  $('#all-cards').setAttribute('aria-pressed', String(selectedCard === 'all'));
}
function renderCategories() {
  $('#categories').innerHTML = cats
    .filter(
      (c) =>
        c === 'All' ||
        data.offers.some((o) => o.category === c && o.regions.includes(region)),
    )
    .map(
      (c) =>
        `<button class="category" data-category="${c}" aria-pressed="${category === c}">${icon(c)}${c === 'All' ? 'All benefits' : c}</button>`,
    )
    .join('');
}
const normalized = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
function merchantNames() {
  return [...new Set(data.offers.flatMap((o) => o.merchants))].sort();
}
function activeMerchant() {
  return merchant !== 'all'
    ? merchant
    : merchantNames().find((m) => normalized(m) === normalized(query)) || 'all';
}
function offerTitle(o, m = activeMerchant()) {
  if (m === 'all' || !o.merchants.includes(m)) return o.title;
  if (o.merchantTitles?.[m]) return o.merchantTitles[m];
  if (o.id === 'o1') return `${m} · online cashback`;
  if (o.id === 'o16') return `${m} · selected pack cashback`;
  if (o.id === 'o17') return `${m} · selected platform cashback`;
  if (o.id === 'o8') return `${m} · accelerated reward points`;
  if (o.id === 'o12') return `${m} · quarterly voucher`;
  return o.title;
}
function offerValue(o) {
  return o.merchantValues?.[activeMerchant()] || o.value;
}
// Search uses words rather than raw substrings, so plurals and punctuation are harmless.
// Access is implicit for lounge records; this also matches “airport lounge access”.
const searchWords = (s) =>
  String(s)
    .toLowerCase()
    .replace(/cash\s+back/g, 'cashback')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (w) =>
        ({
          lounges: 'lounge',
          longue: 'lounge',
          longues: 'lounge',
          lougne: 'lounge',
          lougnes: 'lounge',
          loungue: 'lounge',
          loungues: 'lounge',
          louge: 'lounge',
          louges: 'lounge',
          airports: 'airport',
          rewards: 'reward',
          cards: 'card',
          benefits: 'benefit',
          visits: 'visit',
          stations: 'station',
          rail: 'railway',
          dine: 'dining',
        })[w] || w,
    );
function matchesQuery(o, c) {
  if (!query) return true;
  const requested = searchWords(query);
  if (o.category === 'Lounges' && requested.includes('lounge')) {
    const railway = /railway/i.test(o.title);
    if (
      (requested.includes('airport') && railway) ||
      (requested.includes('railway') && !railway)
    )
      return false;
  }
  const words = searchWords(
    [
      c.bank,
      c.name,
      c.tagline,
      o.title,
      o.summary,
      o.details,
      o.category,
      o.value,
      o.code || '',
      ...o.merchants,
      o.category === 'Lounges'
        ? /railway/i.test(o.title)
          ? 'lounge access railway'
          : 'lounge access airport'
        : '',
    ].join(' '),
  );
  return searchWords(query).every((q) => words.some((w) => w.startsWith(q)));
}
function filteredOffers() {
  const m = activeMerchant();
  return data.offers.filter((o) => {
    const c = data.cards.find((c) => c.id === o.card);
    const queryMatch =
      (m !== 'all' && normalized(query) === normalized(m)) ||
      matchesQuery(o, c);
    return (
      o.regions.includes(region) &&
      (selectedCard === 'all' || o.card === selectedCard) &&
      (category === 'All' || o.category === category) &&
      (m === 'all' || o.merchants.includes(m)) &&
      queryMatch &&
      (type === 'all' ||
        (type === 'dated' && o.expiry) ||
        (type === 'check' && o.flag))
    );
  });
}
function offerHTML(o) {
  const c = data.cards.find((c) => c.id === o.card),
    isExpired = expired(o),
    source = data.sources[o.source];
  return `<article class="offer-card ${c.theme}${isExpired ? ' expired' : ''}"><div class="offer-top"><span class="card-label"><span class="card-dot"></span>${esc(c.name)}</span><span class="category-label">${esc(o.category)}${o.kind === 'fee' ? ' · Cost' : ''}</span></div><div class="offer-value">${esc(offerValue(o))}</div><h3>${esc(offerTitle(o))}</h3><p>${esc(o.summary)}</p>${o.flag ? `<span class="flag">ⓘ ${esc(o.flag)}</span>` : ''}${o.code && !isExpired ? `<div class="inline-code"><span>Coupon</span><code>${esc(o.code)}</code></div>` : ''}<details class="inline-terms"><summary>Conditions & eligibility</summary><p>${esc(o.details)}</p><a href="${esc(safeURL(source.url))}" target="_blank" rel="noopener noreferrer">Official terms ↗</a><small>Reviewed ${dateLabel(o.checked || data.checked)}</small></details><div class="offer-bottom"><small>${isExpired ? 'Expired ' + dateLabel(o.expiry) : o.expiry ? 'Until ' + dateLabel(o.expiry) : o.kind === 'fee' ? 'Fee · applicable taxes extra' : 'Terms & eligibility apply'}</small><button data-offer="${o.id}" aria-label="Details for ${esc(c.name + ' — ' + offerTitle(o))}">Full details ↗</button></div></article>`;
}
function renderOffers() {
  const offers = filteredOffers(),
    m = activeMerchant();
  $('#result-count').textContent =
    `${offers.length} ${offers.length === 1 ? 'result' : 'results'} · ${region === 'domestic' ? 'Domestic' : 'International'}${selectedCard !== 'all' ? ' · ' + data.cards.find((c) => c.id === selectedCard).name : ''}${m !== 'all' ? ' · ' + m : ''}`;
  $('#clear-filters').hidden =
    selectedCard === 'all' &&
    (category === 'All' || (view === 'lounges' && category === 'Lounges')) &&
    !query &&
    type === 'all' &&
    merchant === 'all';
  $('#empty').hidden = offers.length > 0;
  const loungeSearch = searchWords(query).includes('lounge');
  $('#empty-lounges').hidden = !loungeSearch || view === 'lounges';
  $('#empty-copy').textContent =
    view === 'lounges'
      ? 'No lounge benefits match this search in ' +
        (region === 'domestic' ? 'India.' : 'the international view.') +
        ' Clear the search or switch region to explore more.'
      : loungeSearch
        ? 'No lounge benefits match these filters. Open Lounges to see all recorded lounge access for your wallet.'
        : 'No benefits match these filters. Clear them to explore your wallet again.';
  $('#offer-grid').classList.toggle('grouped', view === 'cards');
  $('#offer-grid').innerHTML =
    view === 'cards'
      ? data.cards
          .filter((c) => selectedCard === 'all' || selectedCard === c.id)
          .map((c) => {
            const rows = offers.filter((o) => o.card === c.id);
            if (!rows.length) return '';
            return `<section class="benefit-group ${c.theme}" aria-labelledby="group-${c.id}"><div class="group-heading"><span class="card-dot"></span><h3 id="group-${c.id}">${esc(c.name)}</h3><span>${rows.length} ${rows.length === 1 ? 'result' : 'results'}</span></div><div class="group-grid">${rows.map(offerHTML).join('')}</div></section>`;
          })
          .join('')
      : offers.map(offerHTML).join('');
  $('#offer-title').textContent =
    view === 'lounges'
      ? 'Lounge access, without the guesswork'
      : m !== 'all'
        ? `${m} offers & benefits`
        : view === 'cards'
          ? 'Benefits, card by card'
          : region === 'international'
            ? 'Overseas perks & costs'
            : 'Find your next little win';
  $('#merchant-note').hidden = m === 'all';
  $('#merchant-note').textContent =
    m === 'Swiggy'
      ? 'Only Swiggy-linked benefits. Food delivery, Dineout and welcome memberships have different conditions; offers are not assumed to stack.'
      : `Only benefits explicitly linked to ${m}. Shared caps and selection requirements still apply.`;
  $('#mode-description').textContent =
    view === 'lounges'
      ? region === 'domestic'
        ? 'Domestic airport and railway access. Spending requirements and participating-location eligibility apply.'
        : 'Overseas lounge access. Confirm membership, participating lounges and your eligibility before travel.'
      : region === 'domestic'
        ? 'India offers and everyday card benefits. Overseas-specific perks are in International.'
        : 'Verified overseas perks and costs. Domestic merchant deals are excluded; general overseas reward eligibility is not assumed.';
  document
    .querySelectorAll('[data-region]')
    .forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.region === region)),
    );
  document
    .querySelectorAll('[data-merchant]')
    .forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.merchant === m)),
    );
  const context = $('#card-context');
  context.hidden = selectedCard === 'all';
  if (selectedCard !== 'all') {
    const c = data.cards.find((c) => c.id === selectedCard);
    context.innerHTML = `<div><p class="eyebrow">${esc(c.bank)} · ${region === 'domestic' ? 'DOMESTIC' : 'INTERNATIONAL'}</p><h3>${esc(c.name)} benefits</h3><p>${region === 'domestic' ? esc(c.tagline) + '. Select a merchant or category below.' : 'Only verified overseas-specific items are listed. Your network and personal eligibility still need checking.'}</p></div><div><span>${['hdfc', 'axis'].includes(c.pool) ? 'Shared credit limit' : 'Credit limit'}</span><strong>${limits ? fmt(limits.pools[c.pool]) : 'Unavailable'}</strong></div>`;
  }
}
function reset() {
  selectedCard = 'all';
  category = view === 'lounges' ? 'Lounges' : 'All';
  query = '';
  type = 'all';
  merchant = 'all';
  $('#search').value = '';
  $('#merchant').value = 'all';
  $('#offer-type').value = 'all';
  renderCards();
  renderCategories();
  renderOffers();
}
function chooseMerchant(m) {
  merchant = m;
  query = '';
  category = 'All';
  type = 'all';
  $('#search').value = '';
  $('#merchant').value = m;
  $('#offer-type').value = 'all';
  renderCategories();
  renderOffers();
}
function showOffer(id) {
  const o = data.offers.find((o) => o.id === id);
  if (!o) return;
  const c = data.cards.find((c) => c.id === o.card),
    s = data.sources[o.source],
    isExpired = expired(o);
  $('#detail-card').textContent = `${c.bank} / ${c.name}`;
  $('#detail-content').innerHTML =
    `<p class="detail-value">${esc(offerValue(o))}</p><h2 id="detail-title">${esc(offerTitle(o))}</h2><p class="detail-summary">${esc(o.summary)}</p>${isExpired ? '<p class="notice error">This dated offer has expired. Check the source for a replacement.</p>' : ''}${o.flag ? `<p class="flag">ⓘ ${esc(o.flag)}</p>` : ''}<div class="detail-rules"><h3>What to know</h3><p>${esc(o.details)}</p></div>${o.code && !isExpired ? `<div class="coupon"><code id="coupon-code">${esc(o.code)}</code><button id="copy-code">Copy code</button></div>` : ''}<a class="detail-source" href="${esc(safeURL(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><p class="detail-meta">Reviewed ${dateLabel(o.checked || data.checked)}${o.expiry ? ' · Listed expiry ' + dateLabel(o.expiry) : ' · No fixed expiry verified'}. Bank and merchant conditions apply.</p>`;
  $('#offer-dialog').showModal();
  const copy = $('#copy-code');
  if (copy)
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(o.code);
        toast('Code copied');
      } catch {
        toast('Copy unavailable. Select the displayed code.');
      }
    });
}
function toast(t) {
  $('#toast').textContent = t;
  $('#toast').style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => ($('#toast').style.display = 'none'), 3000);
}
function repoDetails() {
  // GitHub Pages project and user sites resolve without storing credentials.
  // config.json can override these values for a custom domain or non-main branch.
  if (
    window.ATLAS_CONFIG?.repository &&
    /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(window.ATLAS_CONFIG.repository)
  )
    return {
      repository: window.ATLAS_CONFIG.repository,
      branch: window.ATLAS_CONFIG.branch || 'main',
    };
  const match = location.hostname.match(/^([a-z0-9-]+)\.github\.io$/i);
  if (!match) return null;
  const owner = match[1],
    repo =
      location.pathname.split('/').filter(Boolean)[0] || `${owner}.github.io`;
  return { repository: `${owner}/${repo}`, branch: 'main' };
}
function showEdit() {
  const repo = repoDetails();
  $('#edit-action').innerHTML = repo
    ? `<a class="primary" href="https://github.com/${esc(repo.repository)}/edit/${encodeURIComponent(repo.branch)}/limits.json" target="_blank" rel="noopener noreferrer">Open limits on GitHub ↗</a>`
    : '<p class="notice">This preview is not connected to a repository yet. Once published on GitHub Pages, the owner editing link will be available here.</p>';
  $('#edit-dialog').showModal();
}
function route() {
  const requested = location.hash.slice(1),
    previous = view;
  view = ['offers', 'cards', 'lounges', 'limits', 'sources'].includes(requested)
    ? requested
    : requested === 'explore'
      ? view === 'lounges'
        ? 'lounges'
        : 'offers'
      : 'offers';
  document.body.dataset.view = view;
  $('#page-name').textContent = {
    offers: 'Overview',
    cards: 'My cards',
    lounges: 'Lounges',
    limits: 'Credit limits',
    sources: 'Sources & coverage',
  }[view];
  $('.intro').hidden = view !== 'offers';
  $('#collection').hidden = view === 'lounges';
  $('#lounge-intro').hidden = view !== 'lounges';
  $('#offers-view').setAttribute(
    'aria-labelledby',
    view === 'lounges' ? 'offer-title' : 'wallet-title',
  );
  $('#search').placeholder =
    view === 'lounges'
      ? 'Try airport lounges, railway or a card name'
      : 'Try ‘Swiggy’, ‘lounge access’ or ‘travel’';
  $('#search-hint').textContent =
    view === 'lounges'
      ? 'Search your lounge benefits'
      : 'Search across all your cards ↙';
  $('#explore-eyebrow').textContent =
    view === 'lounges'
      ? 'YOUR BOARDING PASS TO BETTER BREAKS'
      : 'LESS SEARCHING. MORE SAVING.';
  for (const id of ['offers', 'limits', 'sources'])
    $(`#${id}-view`).hidden =
      id !== (['cards', 'lounges'].includes(view) ? 'offers' : view);
  document.querySelectorAll('.nav-link').forEach((a) => {
    const active = a.hash === '#' + view;
    a.classList.toggle('active', active);
    active
      ? a.setAttribute('aria-current', 'page')
      : a.removeAttribute('aria-current');
  });
  if (
    (view === 'lounges' && previous !== 'lounges') ||
    (previous === 'lounges' && view !== 'lounges')
  ) {
    selectedCard = 'all';
    category = view === 'lounges' ? 'Lounges' : 'All';
    query = '';
    merchant = 'all';
    type = 'all';
    $('#search').value = '';
    $('#merchant').value = 'all';
    $('#offer-type').value = 'all';
    if (data) {
      renderCards();
      renderCategories();
    }
  }
  if (data) renderOffers();
  // Views share a single document. Anchor navigation to a real section keeps its position.
  if (requested !== 'explore' && requested !== 'main')
    window.scrollTo({ top: 0, behavior: 'instant' });
}
function setupTheme() {
  const media = matchMedia('(prefers-color-scheme: dark)');
  const trigger = $('#theme'),
    menu = $('#theme-menu');
  const choices = [...menu.querySelectorAll('[data-theme-choice]')];
  let theme = document.documentElement.dataset.theme || 'system';
  const apply = () => {
    const dark = theme === 'dark' || (theme === 'system' && media.matches);
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = dark
      ? '#101b23'
      : '#f6f7f9';
    $('#theme-value').textContent = {
      system: 'Device theme',
      light: 'Light theme',
      dark: 'Dark theme',
    }[theme];
    choices.forEach((choice) =>
      choice.setAttribute(
        'aria-checked',
        String(choice.dataset.themeChoice === theme),
      ),
    );
  };
  const close = (restoreFocus = false) => {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  };
  const open = () => {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    choices.find((choice) => choice.dataset.themeChoice === theme).focus();
  };
  trigger.addEventListener('click', () => (menu.hidden ? open() : close(true)));
  trigger.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      open();
    }
  });
  menu.addEventListener('click', (e) => {
    const choice = e.target.closest('[data-theme-choice]');
    if (!choice) return;
    theme = choice.dataset.themeChoice;
    try {
      localStorage.setItem('atlas-theme', theme);
    } catch {}
    apply();
    close(true);
  });
  menu.addEventListener('keydown', (e) => {
    const index = choices.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      const next =
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? choices.length - 1
            : (index + (e.key === 'ArrowDown' ? 1 : -1) + choices.length) %
              choices.length;
      choices[next].focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      close(true);
      if (!e.shiftKey) $('.owner-button').focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-picker')) close();
  });
  document.addEventListener('focusin', (e) => {
    if (!e.target.closest('.theme-picker')) close();
  });
  if (media.addEventListener) media.addEventListener('change', apply);
  else if (media.addListener) media.addListener(apply);
  apply();
}
async function init() {
  setupTheme();
  route();
  const [offerResult, limitResult, configResult] = await Promise.allSettled([
    getJSON('offers.json'),
    getJSON('limits.json'),
    Promise.resolve({ repository: 'VSNSAINIVAS/card-atlas', branch: 'main' }),
  ]);
  if (configResult.status === 'fulfilled')
    window.ATLAS_CONFIG = configResult.value;
  if (limitResult.status === 'fulfilled' && validateLimits(limitResult.value)) {
    limits = limitResult.value;
    renderLimits();
  } else {
    $('#pool-grid').innerHTML =
      '<p class="notice error">Limits could not be loaded. No saved amount is being assumed. Refresh or ask the owner to check the limits file.</p>';
  }
  if (offerResult.status !== 'fulfilled') {
    $('#load-status').textContent =
      'Benefits could not be loaded. Refresh to try again.';
    $('#load-status').classList.add('error');
    return;
  }
  data = offerResult.value;
  data.sources && Object.values(data.sources).forEach((s) => safeURL(s.url));
  renderCards();
  renderCategories();
  renderOffers();
  $('#merchant').innerHTML =
    '<option value="all">All merchants</option>' +
    merchantNames()
      .map((m) => `<option>${esc(m)}</option>`)
      .join('');
  $('#quick-merchants').innerHTML = [
    'Swiggy',
    'Amazon',
    'Flipkart',
    'ixigo',
    'Airtel',
  ]
    .map(
      (m) => `<button data-merchant="${m}" aria-pressed="false">${m}</button>`,
    )
    .join('');
  $('#merchant').addEventListener('change', (e) =>
    chooseMerchant(e.target.value),
  );
  $('#quick-merchants').addEventListener('click', (e) => {
    const b = e.target.closest('[data-merchant]');
    if (b)
      chooseMerchant(
        merchant === b.dataset.merchant ? 'all' : b.dataset.merchant,
      );
  });
  document.querySelectorAll('[data-region]').forEach((b) =>
    b.addEventListener('click', () => {
      region = b.dataset.region;
      category = view === 'lounges' ? 'Lounges' : 'All';
      query = '';
      merchant = 'all';
      type = 'all';
      $('#search').value = '';
      $('#merchant').value = 'all';
      $('#offer-type').value = 'all';
      renderCategories();
      renderOffers();
    }),
  );
  $('#review-date').textContent = 'Reviewed ' + dateLabel(data.checked);
  $('#source-list').innerHTML = Object.values(data.sources)
    .map(
      (s) =>
        `<a class="source-link" href="${esc(safeURL(s.url))}" target="_blank" rel="noopener noreferrer"><span><strong>${esc(s.title)}</strong><small>${new URL(s.url).hostname} · checked ${dateLabel(s.checked || data.checked)}</small></span><span aria-hidden="true">↗</span></a>`,
    )
    .join('');
  const age =
    (Date.now() - new Date(data.checked + 'T00:00:00+05:30').getTime()) /
    86400000;
  if (!limits) {
    $('#load-status').textContent =
      'Benefits loaded. Credit limits are unavailable; refresh or ask the owner to check the limits file.';
    $('#load-status').classList.add('error');
  } else if (age > 30) {
    $('#load-status').textContent =
      `Benefits were last reviewed ${dateLabel(data.checked)}. Check official sources for changes.`;
  } else $('#load-status').hidden = true;
  $('#card-grid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-card]');
    if (!b) return;
    selectedCard = selectedCard === b.dataset.card ? 'all' : b.dataset.card;
    renderCards();
    renderOffers();
    $('#card-grid').querySelector(`[data-card="${b.dataset.card}"]`).focus();
  });
  $('#categories').addEventListener('click', (e) => {
    const b = e.target.closest('[data-category]');
    if (!b) return;
    category = b.dataset.category;
    renderCategories();
    renderOffers();
    $('#categories').querySelector(`[data-category="${category}"]`).focus();
  });
  $('#offer-grid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-offer]');
    if (b) showOffer(b.dataset.offer);
  });
  $('#search').addEventListener('input', (e) => {
    query = e.target.value.trim();
    if (query) {
      selectedCard = 'all';
      merchant = 'all';
      category = view === 'lounges' ? 'Lounges' : 'All';
      type = 'all';
      $('#merchant').value = 'all';
      $('#offer-type').value = 'all';
      renderCards();
      renderCategories();
    }
    renderOffers();
  });
  $('#offer-type').addEventListener('change', (e) => {
    type = e.target.value;
    renderOffers();
  });
  $('#all-cards').addEventListener('click', () => {
    selectedCard = 'all';
    renderCards();
    renderOffers();
  });
  $('#clear-filters').addEventListener('click', reset);
  $('#empty-reset').addEventListener('click', reset);
}
window.addEventListener('hashchange', route);
// The slash shortcut mirrors the search hint, without interrupting typing or dialogs.
document.addEventListener('keydown', (e) => {
  if (
    e.key === '/' &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.altKey &&
    !e.isComposing &&
    !e.repeat &&
    !e.target.closest('input,textarea,select,[contenteditable],dialog')
  ) {
    e.preventDefault();
    if (['limits', 'sources'].includes(view)) {
      location.hash = 'offers';
      route();
    }
    $('#search').focus();
    $('#search').scrollIntoView({ block: 'center' });
  }
});
document
  .querySelectorAll('[data-edit]')
  .forEach((b) => b.addEventListener('click', showEdit));
document
  .querySelectorAll('[data-close]')
  .forEach((b) =>
    b.addEventListener('click', () => b.closest('dialog').close()),
  );
document.querySelectorAll('dialog').forEach((d) =>
  d.addEventListener('click', (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }
  }),
);
init().catch(() => {
  $('#load-status').hidden = false;
  $('#load-status').classList.add('error');
  $('#load-status').textContent =
    'Some wallet data could not be displayed. Refresh or check the data files.';
});
