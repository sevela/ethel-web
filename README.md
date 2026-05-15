# ethel-web

Landing page projektu **Ethel** — AI asistentky pro **Helios Inuvio** ERP.

🌐 **Web:** [ethel.cz](https://ethel.cz/)

## Co tu je

- Statická landing page (`index.html`) — jeden HTML soubor s inline CSS
- `/docs/` — návody pro uživatele, IT administrátory a Helios partnery
- `/blog/` — release notes a roadmap
- Self-hostované Google Fonts (Sora, JetBrains Mono, Space Mono) v `fonts/`
- OG image generátor v `scripts/generate-og.js` (Puppeteer)

## Tech

| Co | Jak |
|---|---|
| Hosting | GitHub Pages s custom doménou `ethel.cz` (CNAME) |
| Build | Žádný — čisté HTML/CSS/JS |
| Fonts | Self-hostované woff2 (subset latin + latin-ext) |
| Analytics | Google Analytics 4 (`G-5YGP0D48W7`) |
| SEO | sitemap.xml, robots.txt, JSON-LD `SoftwareApplication` + `Article` |

## Vývoj

```bash
# Lokální preview (libovolný HTTP server)
npx serve .
# nebo
python -m http.server 8000
```

## Deploy

Commit + push na `main` → GitHub Pages automaticky publikuje. Bez build kroku.

## Související repos

| Repo | Popis |
|---|---|
| [ethel-app](https://github.com/sevela/ethel-app) | Cloud chat frontend (`app.ethel.cz`) |
| [ethel-proxy](https://github.com/sevela/ethel-proxy) | Backend proxy → Claude API |
| [ethel-agent](https://github.com/sevela/ethel-agent) | Lokální Tauri exe (Rust) — SQL agent v Heliosu |
