import { chromium, devices } from 'playwright';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:8000';
const out = '/opt/cursor/artifacts/screenshots';

const shots = [
  { name: 'command-center-desktop', url: `${base}/`, viewport: { width: 1440, height: 900 } },
  { name: 'command-center-mobile', url: `${base}/`, ...devices['iPhone 14 Pro Max'] },
  { name: 'command-center-connections', url: `${base}/#connections`, viewport: { width: 1440, height: 1200 } },
  { name: 'command-center-feed', url: `${base}/#feed`, viewport: { width: 1440, height: 1200 } },
];

const browser = await chromium.launch();
for (const shot of shots) {
  const context = await browser.newContext({
    viewport: shot.viewport,
    userAgent: shot.userAgent,
    deviceScaleFactor: shot.deviceScaleFactor,
    isMobile: shot.isMobile,
    hasTouch: shot.hasTouch,
  });
  const page = await context.newPage();
  await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/${shot.name}.png`, fullPage: true });
  await context.close();
  console.log('wrote', shot.name);
}
await browser.close();
