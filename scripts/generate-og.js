// Generate og-image.png from og-image.html
// Uses puppeteer-core + system Chrome (no bundled chromium download).
//
// Run: node scripts/generate-og.js
//
// Output: ethel-web/og-image.png  (1200x630, PNG)

import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, 'og-image.html');
const outPath = resolve(__dirname, '..', 'og-image.png');

const CHROME = process.env.CHROME_PATH
  || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  defaultViewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
});

try {
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await page.screenshot({ path: outPath, type: 'png', omitBackground: false });
  console.log('wrote', outPath);
} finally {
  await browser.close();
}
