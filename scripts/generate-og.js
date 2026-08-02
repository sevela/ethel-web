// Vygeneruje og-image.png (1200×630) ze scripts/og-image.html.
//
// Šablona tahá /brand/fonts.css a /brand/tokens.css absolutními cestami, takže
// se nedá otevřít přes file://. Skript proto na chvíli zvedne statický server
// nad rootem repa a načte stránku přes http://127.0.0.1.
//
// Chrome se hledá v CHROME_PATH, jinak se zkusí obvyklá místa.
//
// Spuštění:
//   npm install
//   node scripts/generate-og.js
//
// Výstup: og-image.png v rootu repa.

import puppeteer from 'puppeteer-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'og-image.png');

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

const chrome = CANDIDATES.find((p) => fs.existsSync(p));
if (!chrome) {
  console.error('Chrome nenalezen. Nastav CHROME_PATH na spustitelný soubor prohlížeče.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(ROOT, rel);
  // ven z repa se nechodí
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await puppeteer.launch({
  executablePath: chrome,
  args: ['--no-sandbox'],
  defaultViewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
});

try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/scripts/og-image.html`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await page.screenshot({ path: OUT, type: 'png' });
  console.log('zapsáno', path.relative(ROOT, OUT));
} finally {
  await browser.close();
  server.close();
}
