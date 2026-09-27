# ethel-web

Landing page projektu **Ethel** – AI asistentky pro **Helios Inuvio** ERP.

🌐 **Web:** [ethel.cz](https://ethel.cz/)

## Co tu je

- Veřejné stránky: `index.html` (úvod s formulářem), `funkce/`, `akce/`, `bezpecnost/`, `faq/`
- `/docs/` – nápověda: rozcestník, `prvni-kroky/` a `pro-spravce/` (generované z `docs/*.md`),
  `changelog/` (ručně psaný)
- `/download/` – stažení Ethel.exe, verze se načítá z proxy (`assets/download.js`)
- `assets/` – celý vzhled webu: `tokens.css` (proměnné), `ethel.css` (komponenty), `forms.css`
  (jen stránky s formulářem), `web.js`, `forms.js`, loga v `assets/logos/`, písmo v `assets/fonts/`
- `/brand/` – živý grafický manuál webu (v2.0), načítá stejné soubory jako web; `noindex`
- OG image generátor v `scripts/generate-og.js` (Puppeteer)

## Tech

| Co | Jak |
|---|---|
| Hosting | GitHub Pages s custom doménou `ethel.cz` (CNAME) |
| Build | Jen `npm run build:docs` (Markdown → HTML), jinak čisté HTML/CSS/JS |
| Fonts | Systémové Segoe UI; jediné stažené písmo je Caveat (woff2 v `assets/fonts/`) pro ručně psané poznámky |
| Styl | Tři CSS soubory v `assets/`, manuál na `/brand/`; žádné inline styly ani `<style>` ve stránkách |
| Analytics | Google Analytics 4 (`G-5YGP0D48W7`), až po souhlasu v cookie liště |
| SEO | sitemap.xml, robots.txt, JSON-LD `SoftwareApplication` na úvodu |

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
| [ethel-agent](https://github.com/sevela/ethel-agent) | Lokální Tauri exe (Rust) – SQL agent v Heliosu |
