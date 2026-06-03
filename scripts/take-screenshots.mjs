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
  await page.fill('input[type="email"]', 'alex@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(u => !u.toString().includes('/login'), { timeout: 15000 });
  await page.waitForTimeout(4000); // let socket fully init and load conversations

  // 3 — chat home (no conversation selected)
  await shot(page, 'chat-home.png');

  // 4 — open a DM conversation (Emma Wilson)
  try {
    await page.locator('button').filter({ hasText: /^All$/ }).first().click({ timeout: 3000 });
    await page.waitForTimeout(500);
    await page.locator('div[class*="cursor-pointer"]').filter({ hasText: 'Emma Wilson' }).first().click({ timeout: 5000 });
    await page.waitForTimeout(2000);
  } catch (e) {
    console.warn('DM open flow:', e.message);
  }
  await shot(page, 'chat-window.png');

  // 5 — group chat (Product Team)
  try {
    await page.locator('button').filter({ hasText: /^Groups$/ }).first().click({ timeout: 3000 });
    await page.waitForTimeout(500);
    await page.locator('div[class*="cursor-pointer"]').filter({ hasText: 'Product Team' }).first().click({ timeout: 5000 });
    await page.waitForTimeout(2000);
  } catch (e) {
    console.warn('Group open flow:', e.message);
  }
  await shot(page, 'group-chat.png');

  // 6 — settings panel
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.locator('button.rounded-full').first().click({ timeout: 5000 });
    await page.waitForTimeout(400);
    await page.locator('button').filter({ hasText: 'Settings' }).click({ timeout: 3000 });
    await page.waitForTimeout(800);
    await shot(page, 'settings.png');
  } catch (e) {
    console.warn('Settings flow:', e.message);
    await shot(page, 'settings.png');
  }

  // 7 — dark mode: enable from settings appearance tab
  try {
    await page.locator('button').filter({ hasText: 'Appearance' }).first().click({ timeout: 3000 });
    await page.waitForTimeout(300);
    await page.locator('button').filter({ hasText: 'Dark' }).first().click({ timeout: 3000 });
    await page.waitForTimeout(500);
    // Back to chat
    await page.locator('button i.ri-arrow-left-line').first().click({ timeout: 3000 });
    await page.waitForTimeout(500);
    // Re-open DM
    await page.locator('button').filter({ hasText: /^All$/ }).first().click({ timeout: 3000 });
    await page.waitForTimeout(300);
    await page.locator('div[class*="cursor-pointer"]').filter({ hasText: 'Noah Davis' }).first().click({ timeout: 5000 });
    await page.waitForTimeout(1500);
  } catch (e) {
    console.warn('Dark mode flow:', e.message);
  }
  await shot(page, 'chat-dark.png');

  // 8 — mobile view (390px)
  await ctx.close();
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await mobilePage.fill('input[type="email"]', 'sofia@example.com');
  await mobilePage.fill('input[type="password"]', 'password123');
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForURL(u => !u.toString().includes('/login'), { timeout: 15000 });
  await mobilePage.waitForTimeout(3500);
  try {
    await mobilePage.locator('div[class*="cursor-pointer"]').filter({ hasText: /Emma|Alex|Liam/ }).first().click({ timeout: 5000 });
    await mobilePage.waitForTimeout(1500);
  } catch {}
  await shot(mobilePage, 'mobile.png');
  await mobileCtx.close();

  await browser.close();
  console.log('\nDone — screenshots in public/screenshots/');
}

run().catch(err => { console.error(err); process.exit(1); });
