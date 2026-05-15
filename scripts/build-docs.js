#!/usr/bin/env node
/**
 * Build skript pro docs/*.md -> docs/<slug>/index.html
 * Renderuje vybrane MD soubory pomoci marked, wrapuje do _docs-template.html
 * a vytvari rozcestnik docs/index.html.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DOCS = resolve(ROOT, 'docs');
const TEMPLATE = readFileSync(resolve(__dirname, '_docs-template.html'), 'utf8');

const SITE = 'https://ethel.cz';

// Co buildujeme. Emaily a VOP nechavame mimo (interni).
const PAGES = [
  {
    slug: 'quickstart',
    src: 'quickstart.md',
    title: 'Rychlý start',
    breadcrumb: 'rychlý start',
    description: 'Rychlý start s ET/HEL: jak spustit, na co se ptát a co AI asistentka pro Helios Inuvio (ne)umí.',
    activeKey: 'QUICKSTART',
  },
  {
    slug: 'guide-it',
    src: 'guide-it.md',
    title: 'Návod pro IT administrátory',
    breadcrumb: 'pro IT',
    description: 'Technický průvodce nasazením ET/HEL: instalace, síťové požadavky, bezpečnost, logování, troubleshooting.',
    activeKey: 'GUIDE_IT',
  },
  {
    slug: 'guide-partner',
    src: 'guide-partner.md',
    title: 'Návod pro Helios partnery',
    breadcrumb: 'pro partnery',
    description: 'Jak nabídnout ET/HEL klientům: argumenty, demo scénáře, ceník, partnerský program.',
    activeKey: 'GUIDE_PARTNER',
  },
];

// Mapa pro prepis cross-linku mezi navody (relativni .md -> clean URL)
const LINK_MAP = Object.fromEntries(
  PAGES.map((p) => [p.src, `/docs/${p.slug}/`])
);

function renderMarkdown(md) {
  // Prepis cross-linku ([text](guide-it.md) -> /docs/guide-it/)
  // Zachovava pripadne #section fragmenty
  let processed = md;
  for (const [file, url] of Object.entries(LINK_MAP)) {
    const re = new RegExp(`\\]\\(${file.replace('.', '\\.')}(#[^)]*)?\\)`, 'g');
    processed = processed.replace(re, (_, hash) => `](${url}${hash || ''})`);
  }
  // Heading IDs pro #fragmenty
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const slug = text
          .toLowerCase()
          .normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        return `<h${depth} id="${slug}">${text}</h${depth}>\n`;
      },
    },
  });
  return marked.parse(processed);
}

function fillTemplate(opts) {
  const { title, description, slug, breadcrumb, html, activeKey } = opts;
  const activeMarkers = {
    QUICKSTART: '',
    GUIDE_IT: '',
    GUIDE_PARTNER: '',
  };
  activeMarkers[activeKey] = 'class="active"';
  return TEMPLATE
    .replaceAll('{{TITLE}}', title)
    .replaceAll('{{DESCRIPTION}}', description.replace(/"/g, '&quot;'))
    .replaceAll('{{CANONICAL}}', `${SITE}/docs/${slug}/`)
    .replaceAll('{{BREADCRUMB_LEAF}}', breadcrumb)
    .replaceAll('{{ACTIVE_QUICKSTART}}', activeMarkers.QUICKSTART)
    .replaceAll('{{ACTIVE_GUIDE_IT}}', activeMarkers.GUIDE_IT)
    .replaceAll('{{ACTIVE_GUIDE_PARTNER}}', activeMarkers.GUIDE_PARTNER)
    .replaceAll('{{CONTENT}}', html);
}

function writePage(slug, contents) {
  const outDir = resolve(DOCS, slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), contents, 'utf8');
}

function buildIndex() {
  const indexCards = PAGES.map((p) => `
      <a class="docs-card" href="/docs/${p.slug}/">
        <div class="card-tag">${p.breadcrumb}</div>
        <h2>${p.title}</h2>
        <p>${p.description}</p>
        <div class="card-cta">Otevřít →</div>
      </a>`).join('\n');

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Návody – ET/HEL</title>
<meta name="description" content="Návody pro uživatele, IT administrátory a Helios partnery. Vše, co potřebujete k nasazení a používání ET/HEL.">
<meta name="robots" content="index, follow">
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="canonical" href="${SITE}/docs/">
<meta property="og:title" content="Návody – ET/HEL">
<meta property="og:description" content="Návody pro uživatele, IT administrátory a Helios partnery.">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/docs/">
<meta property="og:locale" content="cs_CZ">
<meta property="og:site_name" content="Ethel">
<meta property="og:image" content="${SITE}/og-image.png">
<link rel="preload" href="/fonts/sora-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/sora-700-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/docs/_assets/docs.css">
</head>
<body>

<header>
<nav id="nav">
  <a href="/" class="nav-logo"><span class="et">ET</span><span class="sep">/</span><span class="hel">HEL</span></a>
  <div class="nav-links">
    <a href="/#features">Co umí</a>
    <a href="/#audience">Pro koho</a>
    <a href="/#pricing">Cena</a>
    <a href="/docs/" class="nav-docs active">Návody</a>
    <a href="/#contact" class="nav-cta">Kontakt</a>
  </div>
</nav>
</header>

<main>
  <section class="docs-index-hero">
    <h1>Návody k <span style="color: var(--accent);">ET/HEL</span></h1>
    <p>Vše, co potřebujete pro nasazení i&nbsp;každodenní práci s&nbsp;AI asistentkou pro&nbsp;Helios&nbsp;Inuvio.</p>
  </section>
  <section class="docs-index-grid">
${indexCards}
  </section>
</main>

<footer>
  <div class="footer-left">
    &copy; 2026 Ethel &middot; Embedded Thinking for Helios
    <br>Mgr. Jakub Ševela &middot; IČ: 75185628 &middot; <a href="mailto:info@ethel.cz">info@ethel.cz</a>
    <br><span style="font-size: 0.72rem;">Ethel není produktem společnosti Asseco Solutions. Helios a Helios Inuvio jsou registrované ochranné známky.</span>
  </div>
  <div class="footer-right">v1.0 &middot; brno, cz</div>
</footer>

<script>
var nav = document.getElementById('nav');
window.addEventListener('scroll', function() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});
</script>

</body>
</html>
`;
  writeFileSync(resolve(DOCS, 'index.html'), html, 'utf8');
}

function main() {
  for (const page of PAGES) {
    const md = readFileSync(resolve(DOCS, page.src), 'utf8');
    const rawHtml = renderMarkdown(md);
    // Marked vypise H1 z prvniho radku MD; chceme ho jako h1 nahore, NE v sidebaru.
    const filled = fillTemplate({
      title: page.title,
      description: page.description,
      slug: page.slug,
      breadcrumb: page.breadcrumb,
      html: rawHtml,
      activeKey: page.activeKey,
    });
    writePage(page.slug, filled);
    console.log(`✓ docs/${page.slug}/index.html`);
  }
  buildIndex();
  console.log(`✓ docs/index.html`);
}

main();
