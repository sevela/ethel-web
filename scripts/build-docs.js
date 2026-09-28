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
    description: 'Jak Ethel spustit, na co se ptát a co s odpovědí dělat.',
    activeKey: 'PRVNI_KROKY',
  },
  {
    slug: 'pro-spravce',
    src: 'pro-spravce.md',
    title: 'Pro správce',
    description: 'Instalace, účty a práva k databázi Heliosu.',
    activeKey: 'PRO_SPRAVCE',
  },
];

// Mapa pro prepis cross-linku mezi navody (relativni .md -> clean URL)
const LINK_MAP = Object.fromEntries(PAGES.map((p) => [p.src, `/docs/${p.slug}/`]));

/**
 * Uvodni `# Nadpis` z Markdownu jde do H1 v page-hero, ne do .prose —
 * stranka by jinak mela dva H1 (hero + text).
 */
function splitHeading(md) {
  const match = md.match(/^# (.+)\r?\n/);
  if (!match) return { heading: '', body: md };
  return { heading: match[1].trim(), body: md.slice(match[0].length) };
}

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
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        return `<h${depth} id="${slug}">${text}</h${depth}>\n`;
      },
    },
  });
  return marked.parse(processed);
}

function fillTemplate(opts) {
  const { title, heading, description, slug, html, activeKey } = opts;
  const activeMarkers = {
    PRVNI_KROKY: '',
    PRO_SPRAVCE: '',
  };
  activeMarkers[activeKey] = ' aria-current="page"';
  return TEMPLATE.replaceAll('{{TITLE}}', title)
    .replaceAll('{{HEADING}}', heading || title)
    .replaceAll('{{DESCRIPTION}}', description.replace(/"/g, '&quot;'))
    .replaceAll('{{CANONICAL}}', `${SITE}/docs/${slug}/`)
    .replaceAll('{{ACTIVE_PRVNI_KROKY}}', activeMarkers.PRVNI_KROKY)
    .replaceAll('{{ACTIVE_PRO_SPRAVCE}}', activeMarkers.PRO_SPRAVCE)
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
    const { heading, body } = splitHeading(md);
    const rawHtml = renderMarkdown(body);
    const filled = fillTemplate({
      title: page.title,
      heading,
      description: page.description,
      slug: page.slug,
      html: rawHtml,
      activeKey: page.activeKey,
    });
    writePage(page.slug, filled);
    console.log(`✓ docs/${page.slug}/index.html`);
  }
}

main();
