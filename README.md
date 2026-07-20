# Diamitani Industries — diamitani.com

The corporate site of Diamitani Industries, Inc. (NY C-Corp, est. 2014) —
Patrick Diamitani's holding company, consulting firm, creative agency, and
development studio. One static deployment serving the main domain plus
division subdomains. Black + gold house style, shared `assets/theme.css`.

## Structure (v3 — July 2026)

| Path | What it is |
|------|------------|
| `/` (`index.html`) | Corporate home — hero, divisions, holdings, founder |
| `/portfolio` | The full portfolio SPA — 16 production systems (`data.js`), 40-skill library with detail pages (`#/s/slug`), 11 automation workflows (`#/w/slug`), consulting, holdings, research, about |
| `/industries` | Portfolio companies directory → industries.diamitani.com |
| `/art` | Art division → art.diamitani.com |
| `/music` | Music division → music.diamitani.com |
| `/anthropic` `/meta` `/xai` `/google` `/openai` | Company outreach pages — deliberately **not** in any nav; direct-share links only |

`portfolio.diamitani.com` 301-redirects to `diamitani.com/portfolio`
(the subdomain was retired in v3).

## Deploy (Vercel)

Static site — no build step. Import the repo, add domains
(`diamitani.com`, `www`, `industries.`, `art.`, `music.`, plus
`portfolio.` for the redirect), point DNS per Vercel's prompts.

> **If deployments stop after a repo rename** (e.g. `diamitani-industries`
> → `Diamitani-Industries`): Vercel's Git connection goes stale. Fix in
> Vercel → Project → Settings → Git → disconnect and reconnect the repo.

## Housekeeping

This repo is the website only. ROSTR platform code, Artispreneur, and
curriculum-os live in their own repositories — they were removed from
this repo in the v3 cleanup.
