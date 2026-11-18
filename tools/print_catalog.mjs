// Save catalog/print-{en,fr}.html as PDFs in assets/.
// Needs Playwright:  npm i playwright   then   node tools/print_catalog.mjs   (with a local server on :8123 serving the repo root)
import { chromium } from 'playwright';
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const base = process.env.BASE || 'http://localhost:8123';
for (const lang of ['en', 'fr']) {
  const page = await browser.newPage();
  await page.goto(`${base}/catalog/print-${lang}.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: `assets/les-delices-nadia-catalog-${lang}.pdf`, format: 'Letter', printBackground: true });
  if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/catalog-${lang}.png`, fullPage: true });
  console.log('saved', lang);
}
await browser.close();
