/*
 * Shared front end for /music/artists/<slug>/ profile pages.
 * Reads the artist slug off <body data-artist-slug="..."> and renders the
 * whole page — hero copy, embeds, and the full discography — from the
 * Diamitani Music backend, so the artist directory and the label's own
 * Artists section never fall out of sync with this page.
 */
(function () {
  const API = '/api/diamitani-music/discography';

  async function getJSON(path) {
    const res = await fetch(path, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
    return res.json();
  }

  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function renderHero(artist) {
    const nameEl = document.getElementById('artist-name');
    const taglineEl = document.getElementById('artist-tagline');
    const trackCountEl = document.getElementById('artist-track-count');
    if (nameEl) nameEl.textContent = artist.displayName;
    if (taglineEl) taglineEl.textContent = artist.tagline;
    if (trackCountEl) trackCountEl.textContent = artist.tracks.length;

    document.title = `${artist.displayName} — Diamitani Music | Full Discography`;
  }

  function renderEmbeds(artist) {
    const wrap = document.getElementById('embed-grid');
    if (!wrap) return;
    wrap.innerHTML = '';

    const spotify = el('div', 'media-card', '');
    const spotifyFrame = el('div', 'media-frame');
    spotifyFrame.style.aspectRatio = '';
    spotifyFrame.style.height = '352px';
    const spotifyIframe = document.createElement('iframe');
    spotifyIframe.src = `https://open.spotify.com/embed/artist/${artist.spotifyArtistId}?utm_source=generator&theme=0`;
    spotifyIframe.loading = 'lazy';
    spotifyIframe.allow = 'encrypted-media';
    spotifyFrame.appendChild(spotifyIframe);
    spotify.appendChild(spotifyFrame);
    spotify.appendChild(el('div', 'media-meta', '<div class="ht">Spotify</div><h3>Top tracks &amp; previews</h3>'));
    wrap.appendChild(spotify);

    artist.tracks
      .filter((t) => t.youtubeVideoId)
      .forEach((t) => {
        const card = el('div', 'media-card', '');
        const frame = el('div', 'media-frame');
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${t.youtubeVideoId}`;
        iframe.title = `${t.title} — ${artist.displayName}`;
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        frame.appendChild(iframe);
        card.appendChild(frame);
        card.appendChild(el('div', 'media-meta', `<div class="ht">Original Track</div><h3>${t.title}</h3>`));
        wrap.appendChild(card);
      });
  }

  function renderLinks(artist) {
    const wrap = document.getElementById('links-grid');
    if (!wrap) return;
    wrap.innerHTML = '';

    const links = [{ label: 'Spotify', url: artist.spotifyUrl }];
    if (artist.youtube) {
      Object.values(artist.youtube).forEach((yt) => links.push({ label: yt.name, url: yt.url, note: yt.note }));
    }
    (artist.otherLinks || []).forEach((l) => links.push(l));

    links.forEach((l) => {
      const card = el(
        'a',
        'card',
        `<div class="ht">Platform</div><h3>${l.label}</h3>${l.note ? `<p>${l.note}</p>` : ''}<span class="hl">Open →</span>`
      );
      card.href = l.url;
      card.target = '_blank';
      card.rel = 'noopener';
      wrap.appendChild(card);
    });
  }

  function renderTracks(artist) {
    const wrap = document.getElementById('track-notes');
    if (!wrap) return;
    wrap.innerHTML = '';

    artist.tracks
      .slice()
      .sort((a, b) => a.order - b.order)
      .forEach((track) => {
        const card = el('div', 'card', '');
        const badge = `<span class="pill${track.confidence === 'listened' ? ' pill-on' : ''}" style="margin-bottom:10px">${track.confidence}</span>`;
        const tags = (track.tags || []).map((t) => `<span>${t}</span>`).join('');
        card.innerHTML = `
          ${badge}
          <div class="ht">Track ${track.order} · ${track.duration || '—'}</div>
          <h3>${track.title}</h3>
          <p>${track.description}</p>
          <div class="stack-strip">${tags}</div>
          ${track.youtubeVideoId ? `<span class="hl">Watch on YouTube ↑</span>` : '<span class="rv" style="font-family:var(--mono);font-size:11px;color:var(--dim)">No video ID on file yet</span>'}
        `;
        wrap.appendChild(card);
      });

    (artist.additionalKnownSingles || []).forEach((single) => {
      const card = el(
        'div',
        'card',
        `<span class="pill">${single.confidence}</span>
         <div class="ht">Additional Known Single · ${single.released || '—'}</div>
         <h3>${single.title}</h3>
         <p>${single.description}</p>`
      );
      wrap.appendChild(card);
    });
  }

  async function init() {
    const slug = document.body.dataset.artistSlug;
    if (!slug) return;

    try {
      const data = await getJSON(`${API}?artist=${encodeURIComponent(slug)}`);
      const artist = data.artists[0];
      renderHero(artist);
      renderEmbeds(artist);
      renderTracks(artist);
      renderLinks(artist);
    } catch (err) {
      const notes = document.getElementById('track-notes');
      if (notes) {
        notes.innerHTML = `<p class="state-msg">Couldn't reach the label's discography backend (${err.message}). This page needs to run on Vercel for the /api routes to respond.</p>`;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
