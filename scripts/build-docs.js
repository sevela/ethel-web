#!/usr/bin/env node
/**
 * Build skript pro docs/*.md -> docs/<slug>/index.html
 * Renderuje vybrane MD soubory pomoci marked, wrapuje do _docs-template.html
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

const PAGES = [
  {
    slug: 'prvni-kroky',
    src: 'prvni-kroky.md',
    title: 'První kroky',
    breadcrumb: 'první kroky',
    description: 'Jak začít s Ethel v Helios Inuvio: spuštění, příklady dotazů, tipy a klávesové zkratky.',
    activeKey: 'PRVNI_KROKY',
  },
];

// Mapa pro prepis cross-linku mezi navody (relativni .md -> clean URL)
const LINK_MAP = Object.fromEntries(
  PAGES.map((p) => [p.src, `/docs/${p.slug}/`])
);

function renderMarkdown(md) {
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
    INSTALACE: '',
    PRVNI_KROKY: '',
  };
  activeMarkers[activeKey] = 'class="active"';
  return TEMPLATE
    .replaceAll('{{TITLE}}', title)
    .replaceAll('{{DESCRIPTION}}', description.replace(/"/g, '&quot;'))
    .replaceAll('{{CANONICAL}}', `${SITE}/docs/${slug}/`)
    .replaceAll('{{BREADCRUMB_LEAF}}', breadcrumb)
    .replaceAll('{{ACTIVE_INSTALACE}}', activeMarkers.INSTALACE)
    .replaceAll('{{ACTIVE_PRVNI_KROKY}}', activeMarkers.PRVNI_KROKY)
    .replaceAll('{{CONTENT}}', html);
}

function writePage(slug, contents) {
  const outDir = resolve(DOCS, slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), contents, 'utf8');
}

function main() {
  for (const page of PAGES) {
    const md = readFileSync(resolve(DOCS, page.src), 'utf8');
    const rawHtml = renderMarkdown(md);
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
}

main();
