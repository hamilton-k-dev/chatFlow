import { chromium } from 'playwright-core';
import { execSync } from 'child_process';

const CHROMIUM = '/Users/hamilton/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'http://localhost:3001';

const res = execSync(
  `curl -s -c /tmp/c2.txt -X POST ${BASE}/api/auth/sign-in/email ` +
  `-H "Content-Type: application/json" -H "Origin: ${BASE}" ` +
  `-d '{"email":"sarah@example.com","password":"password123"}'`
).toString();
console.log('API response:', res.substring(0, 100));

const cookieFile = execSync('cat /tmp/c2.txt').toString();
const cookies = [];
for (const line of cookieFile.split('\n')) {
  if (line.startsWith('#') || !line.trim()) continue;
  const parts = line.split('\t');
  if (parts.length >= 7) {
    console.log('Cookie:', parts[5], '=', parts[6].substring(0, 30) + '...');
    cookies.push({ name: parts[5], value: parts[6], domain: 'localhost', path: '/' });
  }
}

const browser = await chromium.launch({ executablePath: CHROMIUM });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies(cookies);
const page = await ctx.newPage();
await page.goto(`${BASE}/chat`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
console.log('Final URL:', page.url());
const bodyText = await page.locator('body').innerText().catch(() => 'error');
console.log('Body (first 500):\n', bodyText.substring(0, 500));
const allButtons = await page.locator('button').allInnerTexts();
console.log('Buttons:', allButtons.slice(0, 20));
await page.screenshot({ path: '/tmp/debug-full.png', fullPage: false });
console.log('Screenshot: /tmp/debug-full.png');
await browser.close();
