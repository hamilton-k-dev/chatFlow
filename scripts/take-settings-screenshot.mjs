import { chromium } from 'playwright-core';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../public/screenshots');
const BASE = 'http://localhost:3001';
const CHROMIUM = '/Users/hamilton/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

function getSessionCookies() {
  const res = execSync(
    `curl -s -c /tmp/chat-session.txt -X POST ${BASE}/api/auth/sign-in/email ` +
    `-H "Content-Type: application/json" -H "Origin: ${BASE}" ` +
    `-d '{"email":"sarah@example.com","password":"password123"}'`
  ).toString();
  const data = JSON.parse(res);
  if (!data.token) throw new Error('Login failed: ' + res);
  const cookieFile = execSync('cat /tmp/chat-session.txt').toString();
  const cookies = [];
  for (const line of cookieFile.split('\n')) {
    if (line.startsWith('#') || !line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length < 7) continue;
    cookies.push({ name: parts[5], value: parts[6], domain: 'localhost', path: '/' });
  }
  return cookies;
}

async function run() {
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  const cookies = getSessionCookies();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  await page.goto(`${BASE}/chat`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click avatar in bottom-left to open profile dropdown
  const avatarBtn = page.locator('button').filter({ has: page.locator('img[alt="me"], div') }).last();
  // Try clicking the user avatar button (last button in the sidebar header area)
  // The avatar button is at the bottom of the sidebar
  await page.screenshot({ path: `${OUT}/debug-pre-settings.png` });
  console.log('✓ debug-pre-settings.png');

  // Find the avatar/profile button - it's a button with the user's initials or avatar image
  // It's in the ConversationsList bottom bar area
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons total`);

  // Look for a button that contains img[alt="me"] or has initials
  try {
    // Click the avatar button to open profile menu
    await page.locator('button').filter({ has: page.locator('img[alt="me"]') }).click({ timeout: 3000 });
  } catch {
    // Fallback: click by position - the avatar is typically in top-left or bottom-left
    console.log('img[alt="me"] not found, trying last button in sidebar...');
    // Try clicking near the avatar area
    await page.locator('button').nth(-1).click({ timeout: 3000 });
  }

  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/debug-dropdown.png` });
  console.log('✓ debug-dropdown.png');

  // Click Settings in the dropdown
  try {
    await page.locator('button, div[role="button"]').filter({ hasText: 'Settings' }).click({ timeout: 3000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/settings.png` });
    console.log('✓ settings.png');

    // Enable dark mode — click "Appearance" tab then "Dark" button
    await page.locator('button').filter({ hasText: 'Appearance' }).click({ timeout: 3000 });
    await page.waitForTimeout(400);
    await page.locator('button').filter({ hasText: 'Dark' }).click({ timeout: 3000 });
    await page.waitForTimeout(600);

    // Back arrow to close settings
    await page.locator('button i.ri-arrow-left-line').first().click({ timeout: 3000 });
    await page.waitForTimeout(600);
  } catch (e) {
    console.warn('Settings step failed:', e.message);
  }

  // Click a conversation for dark mode chat screenshot
  try {
    await page.locator('[class*="cursor-pointer"]').first().click({ timeout: 3000 });
    await page.waitForTimeout(1000);
  } catch {}
  await page.screenshot({ path: `${OUT}/chat-dark.png` });
  console.log('✓ chat-dark.png');

  await browser.close();
}

run().catch(err => { console.error(err); process.exit(1); });
