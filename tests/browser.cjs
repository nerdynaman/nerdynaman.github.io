const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  try {
    const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', request => errors.push(`${request.failure().errorText} ${request.url()}`));
    await fs.mkdir('artifacts', { recursive: true });
    const routes = ['/', '/post/', '/projects/', '/reading/', '/about/', '/experience/', '/post/kerberos-with-ftp/', '/post/create-firewall/'];
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(`http://localhost:1313${route}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator('h1').count(), 1, `${width}: ${route} heading`);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}: ${route} overflow`);
        assert(await page.evaluate(() => document.fonts.check('400 18px Lora') && document.fonts.check('400 14px Inter')), 'webfonts loaded');
        if ([1280, 390].includes(width) && ['/', '/post/kerberos-with-ftp/', '/reading/'].includes(route)) {
          const name = route === '/' ? 'home' : route.split('/').filter(Boolean).at(-1);
          await page.screenshot({ path: `artifacts/${name}-${width}.png`, fullPage: true });
        }
      }
    }
    await page.goto('http://localhost:1313/reading/');
    assert.equal(await page.locator('.reading-entry').count(), 1);
    assert.equal(await page.locator('.reading-filters').count(), 0);
    assert.equal(await page.locator('.reading-notes').count(), 0, 'empty notes stay hidden');
    assert.match(await page.locator('.reading-entry h2 a').getAttribute('href'), /^https:\/\/learning\.oreilly\.com/);
    assert(!(await page.locator('main').textContent()).includes('Redis Notes'));
    for (const route of ['/reading/ddia/', '/reading/ddia/chapter-9/', '/reading/ddia/chapter-10/', '/reading/ddia/chapter-11/', '/reading/redis/']) {
      assert.equal((await context.request.get(`http://localhost:1313${route}`)).status(), 404, `removed route ${route}`);
    }
    await page.goto('http://localhost:1313/post/kerberos-with-ftp/');
    assert.equal(await page.locator('.contents').count(), 1);
    await page.locator('.contents summary').click();
    assert(await page.locator('.contents').getAttribute('open') !== null);
    const firstCode = page.locator('.code-block pre code').first();
    await page.getByRole('button', { name: 'Copy code' }).first().click();
    await page.waitForFunction(() => document.querySelector('.code-copy').textContent === 'Copied');
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await firstCode.textContent());
    await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('denied')); });
    await page.getByRole('button', { name: 'Copy code' }).first().click();
    await page.waitForFunction(() => document.querySelector('.copy-status').textContent.includes('Could not copy'));
    const image = page.locator('.image-link').first();
    await image.click();
    assert(await page.locator('#image-viewer').isVisible());
    await page.keyboard.press('Escape');
    assert(!(await page.locator('#image-viewer').isVisible()));
    assert(await image.evaluate(element => element === document.activeElement), 'image focus restored');
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const plain = await noJS.newPage();
    await plain.goto('http://localhost:1313/reading/');
    assert.equal(await plain.locator('.reading-entry:visible').count(), 1);
    await plain.goto('http://localhost:1313/post/kerberos-with-ftp/');
    assert(await plain.locator('.prose').textContent());
    assert.equal(await plain.locator('.code-copy').count(), 0);
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log('PASS: 24 responsive page checks, fonts/assets, bookshelf and removed routes, copy success/failure, contents, image keyboard dismissal, and no-JS content.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
