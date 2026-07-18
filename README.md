# Diamitani Industries, Inc. — diamitani.com

Corporate holding site for Diamitani Industries, Inc. (NY C-Corp, est. 2014) —
one static site serving the main domain plus four division subdomains from a
single deployment.

## Structure

| Path | Domain | Division |
|------|--------|----------|
| `/` | diamitani.com | Corporate holding home |
| `/portfolio/` | portfolio.diamitani.com | Enterprise AI production — Skill & Product Library |
| `/industries/` | industries.diamitani.com | Portfolio companies directory |
| `/art/` | art.diamitani.com | Visual albums, comedy, photography |
| `/music/` | music.diamitani.com | Original music — Pat Dia |

All pages share one design system: `assets/theme.css` (Playfair Display +
Inter + JetBrains Mono, dark corporate theme, per-division accent colors —
cyan / violet / gold / rose).

Every division is also reachable path-style (e.g. `diamitani.com/portfolio/`),
so the site works fully on any Vercel preview URL before DNS is configured.

## Deploy (Vercel)

1. Import this repo into Vercel as a new project (no build step — static).
2. In **Project → Settings → Domains**, add all five domains:
   `diamitani.com`, `portfolio.diamitani.com`, `industries.diamitani.com`,
   `art.diamitani.com`, `music.diamitani.com`.
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
