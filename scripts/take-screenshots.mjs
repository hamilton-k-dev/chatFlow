import { chromium } from 'playwright-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../public/screenshots');
const BASE = 'http://localhost:3001';
const CHROMIUM = '/Users/hamilton/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

async function shot(page, name, fullPage = false) {
  await page.screenshot({ path: `${OUT}/${name}`, fullPage });
  console.log(`✓ ${name}`);
}

async function run() {
  const browser = await chromium.launch({ executablePath: CHROMIUM });

  // — Unauthenticated pages —
  const anonCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const anonPage = await anonCtx.newPage();
  await anonPage.goto(BASE, { waitUntil: 'networkidle' });
  await shot(anonPage, 'landing.png', true);
  await anonPage.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await shot(anonPage, 'login.png');
  await anonCtx.close();

  // — Authenticated pages —
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Log in via form
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'sarah@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(u => !u.toString().includes('/login'), { timeout: 15000 });
  await page.waitForTimeout(4000); // let socket fully init and load users

  // 3 — chat home
  await shot(page, 'chat-home.png');

  // 4 — start a new chat to get a chat window
  try {
    await page.locator('button').filter({ hasText: 'New Chat' }).first().click({ timeout: 5000 });
    await page.waitForTimeout(1500); // wait for users to render inside modal
    // User items inside the modal have an ri-add-line icon
    await page.locator('div[class*="cursor-pointer"]').filter({ has: page.locator('i.ri-add-line') }).first().click({ timeout: 8000 });
    await page.waitForTimeout(2000);
  } catch (e) {
    console.warn('New chat flow:', e.message);
    // Dismiss modal if still open
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  await shot(page, 'chat-window.png');

  // 5 — settings: click avatar button (rounded-full) then Settings
  try {
    // Ensure no modal is open first
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.locator('button.rounded-full').first().click({ timeout: 5000 });
    await page.waitForTimeout(400);
    await page.locator('button').filter({ hasText: 'Settings' }).click({ timeout: 3000 });
    await page.waitForTimeout(800);
    await shot(page, 'settings.png');

    // Appearance tab → Dark mode
    await page.locator('button').filter({ hasText: 'Appearance' }).first().click({ timeout: 3000 });
    await page.waitForTimeout(300);
    await page.locator('button').filter({ hasText: 'Dark' }).first().click({ timeout: 3000 });
    await page.waitForTimeout(700);

    // Back arrow
    await page.locator('button i.ri-arrow-left-line').first().click({ timeout: 3000 });
    await page.waitForTimeout(700);
  } catch (e) {
    console.warn('Settings flow:', e.message);
    await shot(page, 'settings.png');
  }

  // 6 — dark mode chat
  try {
    await page.locator('div.cursor-pointer').first().click({ timeout: 3000 });
    await page.waitForTimeout(1000);
  } catch {}
  await shot(page, 'chat-dark.png');

  await browser.close();
  console.log('\nDone — screenshots in public/screenshots/');
}

run().catch(err => { console.error(err); process.exit(1); });
