# Diamitani Industries, Inc. — diamitani.com

Corporate holding site for Diamitani Industries, Inc. (NY C-Corp, est. 2014) —
one deployment serving the main domain, five division/company subdomains, and
a small serverless API that backs the Diamitani Music portfolio company.

## Structure

| Path | Domain | Division |
|------|--------|----------|
| `/` | diamitani.com | Corporate holding home |
| `/portfolio/` | portfolio.diamitani.com | Enterprise AI production — Skill & Product Library |
| `/industries/` | industries.diamitani.com | Portfolio companies directory |
| `/art/` | art.diamitani.com | Visual albums, comedy, photography |
| `/music/` | music.diamitani.com | Original music — Pat Dia (the artist) |
| `/diamitani-music/` | label.diamitani.com | **Diamitani Music** — the label/publishing/artist-services portfolio company |

All pages share one design system: `assets/theme.css` (Playfair Display +
Inter + JetBrains Mono, dark corporate theme, per-division accent colors —
cyan / violet / gold / rose / emerald).

### Diamitani Music — portfolio company

`/diamitani-music/` is a portfolio company under Industries, distinct from the
personal artist page at `/music/`. It's a small web app, not just a marketing
page: the roster, catalog, and operating-model sections render from a live
fetch to the API below, and includes an interactive royalty/recoupment
calculator.

**Backend (Vercel serverless functions, zero-config, no external DB/secrets):**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/diamitani-music/roster` | Signed/scouted artists, split profiles, advance balances |
| `GET` | `/api/diamitani-music/releases` | Release catalog, joined to artist name |
| `GET` | `/api/diamitani-music/operating-model` | Sign → release → collect → split → reinvest flow + services |
| `POST` | `/api/diamitani-music/royalties` | `{ artistId, revenue }` → full split + recoupment breakdown |

Source data lives in `data/diamitani-music/*.json` — edit those files (roster,
releases, operating model) to change what the app and API serve; no code
changes needed for day-to-day roster/catalog updates.

Every division is also reachable path-style (e.g. `diamitani.com/portfolio/`),
so the site works fully on any Vercel preview URL before DNS is configured.

## Deploy (Vercel)

1. Import this repo into Vercel as a new project (static site + `/api`
   serverless functions — Vercel auto-detects the `api/` directory, no build
   step or framework config required).
2. In **Project → Settings → Domains**, add all six domains:
   `diamitani.com`, `portfolio.diamitani.com`, `industries.diamitani.com`,
   `art.diamitani.com`, `music.diamitani.com`, `label.diamitani.com`.
3. In your DNS provider:
   - `diamitani.com` → A record `76.76.21.21` (or follow Vercel's prompt)
   - each subdomain → CNAME `cname.vercel-dns.com`
4. `vercel.json` host-based rewrites map each subdomain to its directory
   (shared `/assets/*` is excluded from rewriting so the theme loads on
   every host).

## Notes

- Cross-division nav links use absolute production URLs
  (`https://music.diamitani.com` etc.), so they resolve correctly once DNS
  is live. The root page uses path links so it works on previews too.
- The Portfolio division currently links out to the deployed portfolio apps
  (`diamitani.me`) for the full case-study library — swap those URLs if the
  library moves under `portfolio.diamitani.com`.
