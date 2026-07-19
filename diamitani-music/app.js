/*
 * Diamitani Music — front end for the label's operating-model backend.
 * Every section below is rendered from a live fetch to /api/diamitani-music/*
 * rather than hardcoded markup, so the roster, catalog, and operating model
 * stay correct as the label's own data changes.
 */
(function () {
  const API_BASE = '/api/diamitani-music';

  function money(n) {
    return '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function pct(n) {
    return Math.round(n * 100) + '%';
  }

  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  async function getJSON(path) {
    const res = await fetch(path, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
    return res.json();
  }

  // ---------- Roster ----------
  function renderRoster(data) {
    const list = document.getElementById('roster-list');
    list.innerHTML = '';
    document.getElementById('m-roster').textContent = data.count;

    data.roster.forEach((artist) => {
      const row = el('div', 'roster-row');

      const name = el('div', '', `<div class="rn">${artist.name}</div><div class="rr">${artist.role} · ${artist.genre}</div>`);
      const releases = el('div', 'rr', `${artist.releases} release${artist.releases === 1 ? '' : 's'}`);
      const splits = el('div', 'rr', splitSummary(artist.splitProfile));
      const status = el('span', `pill${artist.status === 'signed' ? ' pill-on' : ''}`, artist.status);

      row.append(name, releases, splits, status);
      list.appendChild(row);
    });
  }

  function splitSummary(splitProfile) {
    return Object.entries(splitProfile)
      .map(([k, v]) => `${k} ${pct(v)}`)
      .join(' · ');
  }

  // ---------- Catalog ----------
  function renderCatalog(data) {
    const list = document.getElementById('catalog-list');
    list.innerHTML = '';
    document.getElementById('m-catalog').textContent = data.count;

    data.releases.forEach((rel) => {
      const row = el('div', 'catalog-row');
      const title = el('div', '', `<div class="rn">${rel.title}</div><div class="rr">${rel.artistName} · ${rel.type}</div>`);
      const released = el('div', 'rr', rel.released);
      const linkText = rel.links && rel.links.youtube
        ? `<a class="hl" href="${rel.links.youtube.replace('embed/', 'watch?v=')}" target="_blank" rel="noopener">Listen →</a>`
        : '<span class="rv">—</span>';
      const link = el('div', '', linkText);
      const status = el('span', `pill${rel.status === 'released' ? ' pill-on' : ''}`, rel.status);

      row.append(title, released, link, status);
      list.appendChild(row);
    });
  }

  // ---------- Operating model flow ----------
  function renderFlow(model) {
    const flow = document.getElementById('op-flow');
    flow.innerHTML = '';
    model.flow.forEach((step, i) => {
      const card = el(
        'div',
        'op-step',
        `<div class="fs">Step 0${i + 1}</div><h4>${step.stage}</h4><p>${step.detail}</p>`
      );
      flow.appendChild(card);
    });
  }

  function renderServices(model) {
    const grid = document.getElementById('services-grid');
    grid.innerHTML = '';
    model.services.forEach((svc, i) => {
      const card = el(
        'div',
        'card',
        `<div class="ht">0${i + 1}</div><h3>${svc.name}</h3><p>${svc.detail}</p>`
      );
      grid.appendChild(card);
    });
  }

  // ---------- Calculator ----------
  function populateArtistSelect(roster) {
    const select = document.getElementById('calc-artist');
    select.innerHTML = '';
    roster
      .filter((a) => a.status === 'signed')
      .forEach((a) => {
        const opt = el('option', '', a.name);
        opt.value = a.id;
        select.appendChild(opt);
      });
    if (!select.options.length) {
      roster.forEach((a) => {
        const opt = el('option', '', a.name);
        opt.value = a.id;
        select.appendChild(opt);
      });
    }
  }

  function renderCalcResult(data) {
    const box = document.getElementById('calc-result');
    const b = data.breakdown;
    const colors = { artist: 'var(--accent)', label: 'var(--accent2)', producer: 'var(--violet)' };
    const segs = Object.entries(data.splitProfile)
      .map(([k, v]) => `<div class="split-seg" style="width:${v * 100}%;background:${colors[k] || 'var(--dim)'}"></div>`)
      .join('');
    const keys = Object.entries(data.splitProfile)
      .map(([k, v]) => `<span><i style="background:${colors[k] || 'var(--dim)'}"></i>${k} ${pct(v)}</span>`)
      .join('');

    box.innerHTML = `
      <div class="split-key">${keys}</div>
      <div class="split-bar">${segs}</div>
      <div class="calc-line"><span>Gross revenue</span><span>${money(data.grossRevenue)}</span></div>
      <div class="calc-line"><span>Label share</span><span>${money(b.labelShare)}</span></div>
      ${b.producerShare ? `<div class="calc-line"><span>Producer share</span><span>${money(b.producerShare)}</span></div>` : ''}
      <div class="calc-line"><span>Artist gross</span><span>${money(b.artistGross)}</span></div>
      <div class="calc-line"><span>Advance recouped</span><span>${money(b.recouped)}</span></div>
      <div class="calc-line total"><span>Artist net payable</span><span>${money(b.artistNetPayable)}</span></div>
      <div class="calc-line"><span>Remaining advance balance</span><span>${money(b.advanceBalanceAfter)}</span></div>
    `;
    box.classList.add('show');
  }

  async function handleCalcSubmit(evt) {
    evt.preventDefault();
    const btn = document.getElementById('calc-submit');
    const artistId = document.getElementById('calc-artist').value;
    const revenue = document.getElementById('calc-revenue').value;

    btn.disabled = true;
    btn.textContent = 'Calculating…';
    try {
      const res = await fetch(`${API_BASE}/royalties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId, revenue: Number(revenue) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed.');
      renderCalcResult(data);
    } catch (err) {
      const box = document.getElementById('calc-result');
      box.innerHTML = `<p class="state-msg">${err.message}</p>`;
      box.classList.add('show');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Calculate payout';
    }
  }

  async function init() {
    try {
      const [rosterData, catalogData, model] = await Promise.all([
        getJSON(`${API_BASE}/roster`),
        getJSON(`${API_BASE}/releases`),
        getJSON(`${API_BASE}/operating-model`),
      ]);
      renderRoster(rosterData);
      renderCatalog(catalogData);
      renderFlow(model);
      renderServices(model);
      populateArtistSelect(rosterData.roster);
    } catch (err) {
      ['roster-list', 'catalog-list'].forEach((id) => {
        document.getElementById(id).innerHTML = `<p class="state-msg">Couldn't reach the label's backend (${err.message}). This page needs to run on Vercel for the /api routes to respond.</p>`;
      });
    }

    const form = document.getElementById('calc-form');
    if (form) form.addEventListener('submit', handleCalcSubmit);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
