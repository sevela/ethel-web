// Self-host Google Fonts: download latin + latin-ext woff2 files,
// rewrite paths to /fonts/, emit a self-contained CSS to scripts/_fonts.css.
//
// Run: node scripts/build-fonts.js

import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.join(ROOT, 'fonts');
const OUT_CSS = path.join(__dirname, '_fonts.css');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const QUERY = 'family=JetBrains+Mono:wght@400;500;700&family=Sora:wght@300;400;500;600;700;800&family=Space+Mono:wght@700&display=swap';

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': UA, ...headers } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(get(res.headers.location, headers));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

const css = (await get(`https://fonts.googleapis.com/css2?${QUERY}`)).toString('utf8');

await fs.mkdir(FONTS_DIR, { recursive: true });

// CSS is split into blocks separated by `/* subset */` comments.
const blocks = css.split(/\/\*\s*([a-z\-]+)\s*\*\/\s*/i).filter(Boolean);

const KEEP = new Set(['latin', 'latin-ext']);
const out = [];

for (let i = 0; i < blocks.length; i += 2) {
  const subset = blocks[i].trim();
  const block = blocks[i + 1] || '';
  if (!KEEP.has(subset)) continue;

  const fam = block.match(/font-family:\s*'([^']+)'/)?.[1];
  const w = block.match(/font-weight:\s*([0-9]+)/)?.[1];
  const url = block.match(/src:\s*url\((https:[^)]+)\)/)?.[1];
  if (!fam || !w || !url) continue;

  const slug = fam.toLowerCase().replace(/\s+/g, '-');
  const filename = `${slug}-${w}-${subset}.woff2`;
  const dest = path.join(FONTS_DIR, filename);

  const buf = await get(url);
  await fs.writeFile(dest, buf);
  console.log('downloaded', filename, '(' + (buf.length / 1024).toFixed(1) + ' KB)');

  // rewrite block: replace remote url with local /fonts/ path
  const rewritten = block.replace(/src:\s*url\([^)]+\)/, `src: url('/fonts/${filename}')`);
  out.push(`/* ${fam} ${w} ${subset} */\n${rewritten.trim()}`);
}

const finalCss = out.join('\n\n') + '\n';
await fs.writeFile(OUT_CSS, finalCss);
console.log('wrote', OUT_CSS, '(' + finalCss.length, 'bytes)');
console.log('total fonts:', out.length);
