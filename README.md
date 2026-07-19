# Diamitani Industries — diamitani.com

One Vercel static deploy. Five hosts. Host-based rewrites in `vercel.json`.

| Host | Content |
|------|---------|
| `diamitani.com` | Corporate hub — overview cards into each division (`/home/`) |
| `portfolio.diamitani.com` | Claude **artifact** SPA — Skill & Product Library (`#library`, `#/p/:slug`) |
| `industries.diamitani.com` | Holding company / venture studio (build · partner · invest) |
| `art.diamitani.com` | Visual album, comedy, photography |
| `music.diamitani.com` | Pat Dia catalog |

## Portfolio

`portfolio/index.html` is the self-contained artifact from
`diamitani/patrick-diamitani-portfolio` (`artifact.html`) — same library UX as
https://diamitani.github.io/patrick-diamitani-portfolio/#library with
cross-links into the Diamitani Industries family.

## Deploy

```bash
vercel deploy --prod --scope artispreneur
```

Domains attach to project `diamitani-industries`. DNS (Route53):
- apex `A` → `76.76.21.21`
- `www` + subdomains → `CNAME cname.vercel-dns.com`
