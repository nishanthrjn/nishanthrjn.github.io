const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const url = process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:8767';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    let calls = [], mode = 'success', release;
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-09-10T06:00:00Z'));
    await page.route('https://**/*', route => route.abort());
    await page.route('https://formspree.io/f/**', async route => {
      calls.push(route.request().postData());
      if (mode === 'hold') await new Promise(resolve => { release = resolve; });
      if (mode === 'network') return route.abort('failed');
      if (mode === 'timeout') { await new Promise(resolve => setTimeout(resolve, 1800)); return route.abort().catch(() => {}); }
      return route.fulfill({ status: mode === 'error' ? 422 : 200, contentType: 'application/json', body: JSON.stringify(mode === 'error' ? { errors: [{ message: 'Test rejection' }] } : { ok: true }) });
    });
    const fixtureConfig = fs.readFileSync(path.join(root, 'static/js/data/booking.js'), 'utf8');
    await page.route('**/static/js/data/booking.js*', route => route.fulfill({
      contentType: 'application/javascript', body: fixtureConfig.replace(/formspreeEndpoint: '[^']*'/, "formspreeEndpoint: 'https://formspree.io/f/YOUR_FORM_ID'"),
    }));
    await page.goto(url, { waitUntil: 'networkidle' });
    const submit = () => page.locator('#contactForm button[type="submit"]').click();
    const status = () => page.locator('#contactFormStatus').textContent();
    const choose = async (date = '2026-09-11') => {
      await page.locator(`[data-date="${date}"].avail`).click();
      await page.locator('#bookingTime').selectOption('14:00');
      await page.locator('#bookingDuration').selectOption('30');
    };
    const fill = async () => {
      await page.locator('#contactName').fill('Alice Visitor');
      await page.locator('#contactEmail').fill('alice@example.com');
    };
    assert.equal(await page.locator('#bookingControls').count(), 0);
    assert.equal(await page.locator('#contactInfoList .cdetail').count(), 2);
    assert(!/Hannover|Blue Card/.test(await page.locator('#contactInfoList').textContent()));
    assert.match(await page.locator('#localRow').textContent(), /Hannover/);
    assert.equal(await page.locator('[data-date="2026-09-09"]').getAttribute('type'), null);
    assert.equal(await page.locator('[data-date="2026-09-12"]').getAttribute('type'), null);
    await submit(); assert.match(await status(), /enter your name/);
    await page.locator('#contactName').fill('Alice Visitor');
    await page.locator('#contactEmail').fill('invalid');
    await submit(); assert.match(await status(), /valid email/);
    await page.locator('#contactEmail').fill('alice@example.com');
    await submit(); assert.match(await status(), /highlighted booking date/);
    await page.locator('[data-date="2026-09-11"]').press('Enter');
    assert.equal(await page.locator('#bookingTime').evaluate(e => document.activeElement === e), true);
    assert.equal(await page.locator('#bookingControls').evaluate(e => e.previousElementSibling.dataset.date), '2026-09-12');
    await submit(); assert.match(await status(), /available time/);
    await page.locator('#bookingTime').selectOption('14:00');
    await submit(); assert.match(await status(), /select a duration/);
    await page.locator('#bookingDuration').selectOption('30');
    assert.equal(await page.locator('#bookingTime').getAttribute('size'), '4');
    assert(await page.locator('#bookingTime').evaluate(e => e.scrollHeight > e.clientHeight));
    await page.locator('#bookingTime').selectOption('14:30');
    assert.match(await page.locator('#contactMessage').inputValue(), /at 14:30/);
    await page.locator('#bookingTime').selectOption('14:00');
    const generated = await page.locator('#contactMessage').inputValue();
    assert.match(generated, /Friday, 11 September 2026 at 14:00 \(Europe\/Berlin\) for 30 minutes/);
    await page.locator('#contactMessage').fill(generated + '\n\nAgenda: discuss CAD workflows.');
    await page.locator('#bookingDuration').selectOption('45');
    await page.locator('#contactName').fill('Bob Visitor');
    assert.match(await page.locator('#contactMessage').inputValue(), /45 minutes/);
    assert.match(await page.locator('#contactMessage').inputValue(), /Best regards,\nBob Visitor/);
    assert.match(await page.locator('#contactMessage').inputValue(), /Agenda: discuss CAD workflows/);
    await page.locator('[data-date="2026-09-22"]').click();
    assert.equal(await page.locator('#bookingControls').count(), 1);
    assert.equal(await page.locator('#bookingControls').evaluate(e => e.previousElementSibling.dataset.date), '2026-09-26');
    assert.equal(await page.locator('#bookingTime').inputValue(), '');
    assert.equal(await page.locator('#bookingDuration').inputValue(), '');
    assert.equal(await page.locator('.cal-day.selected').count(), 1);
    assert(!/14:00|45 minutes/.test(await page.locator('#contactMessage').inputValue()));
    await choose('2026-09-30');
    assert.equal(await page.locator('#bookingControls').evaluate(e => e.previousElementSibling.dataset.date), '2026-09-30');
    await page.locator('#contactMessage').fill('   ');
    await submit(); assert.match(await status(), /enter a message/);
    await page.locator('#contactMessage').fill('A custom editable call request.');
    await submit(); assert.match(await status(), /not configured/); assert.equal(calls.length, 0);
    console.log('PASS: required fields, keyboard calendar, movable controls, last row, drafts and missing endpoint');

    // Public endpoint injected only into the test response, never the repository.
    await page.route('**/static/js/data/booking.js*', route => route.fulfill({
      contentType: 'application/javascript', body: fixtureConfig.replace(/formspreeEndpoint: '[^']*'/, "formspreeEndpoint: 'https://formspree.io/f/testfixture'").replace('20000', '1500'),
    }));
    await page.reload({ waitUntil: 'networkidle' });
    await fill(); await choose();
    const expectedMessage = await page.locator('#contactMessage').inputValue();
    mode = 'hold';
    await submit();
    await page.waitForFunction(() => document.querySelector('#contactForm').getAttribute('aria-busy') === 'true');
    assert.equal(await page.locator('#contactForm button[type="submit"]').isDisabled(), true);
    assert.equal(await page.locator('#bookingTime').isDisabled(), true);
    assert.match(await status(), /Sending/);
    await page.evaluate(() => document.getElementById('contactForm').requestSubmit());
    assert.equal(calls.length, 1);
    release();
    await page.waitForFunction(() => document.querySelector('#contactFormStatus').dataset.state === 'success');
    assert.equal(await page.locator('#contactForm button[type="submit"]').isDisabled(), false);
    assert.equal(await page.locator('#contactForm button[type="submit"]').textContent(), 'Send message');
    assert.equal(await page.locator('#contactMessage').inputValue(), '');
    assert.match(await status(), /Message sent successfully/);
    assert(await page.locator('#contactForm button[type="submit"]').evaluate(e => e.classList.contains('is-sent')));
    assert(await page.locator('#contactFormStatus').evaluate(e => e.getBoundingClientRect().top >= document.querySelector('#contactForm button[type="submit"]').getBoundingClientRect().bottom));
    await page.waitForFunction(() => !document.querySelector('#contactForm button[type="submit"]').classList.contains('is-sent'));

    for (const [key, value] of Object.entries({ name: 'Alice Visitor', email: 'alice@example.com', requestedDate: '2026-09-11', requestedTime: '14:00', duration: '30', timezone: 'Europe/Berlin' })) {
      assert(calls[0].includes(`name="${key}"\r\n\r\n${value}\r\n`), key);
    }
    assert(calls[0].includes('name="message"'));
    assert(calls[0].includes('name="_gotcha"'));
    await page.locator('#contactMessage').fill(expectedMessage);
    await submit(); assert.equal(calls.length, 1); assert.match(await status(), /already sent/);
    console.log('PASS: separate payload fields, loading lock, success and duplicate protection');
    for (const failure of ['error', 'network', 'timeout']) {
      mode = failure;
      await page.locator('#contactMessage').fill(expectedMessage + `\nTest ${failure}`);
      await submit();
      await page.waitForFunction(() => document.querySelector('#contactFormStatus').dataset.state === 'error');
      assert.match(await status(), /Submission failed/);
      assert.equal(await page.locator('#contactForm button[type="submit"]').evaluate(e => e.classList.contains('is-sent')), false);
      assert.match(await page.locator('#contactMessage').inputValue(), new RegExp(`Test ${failure}`));
      assert.equal(await page.locator('#contactForm button[type="submit"]').isDisabled(), false);
    }
    mode = 'success'; await submit();
    await page.waitForFunction(() => document.querySelector('#contactFormStatus').dataset.state === 'success');
    assert.equal(await page.locator('.contact-honeypot').isVisible(), false);
    console.log('PASS: HTTP failure, network failure, timeout, preserved input, retry and hidden honeypot');
    for (const width of [1920, 1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 950 });
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const bounds = await page.locator('#bookingControls').boundingBox();
      assert(bounds.width > 0 && bounds.x >= 0 && bounds.x + bounds.width <= width);
    }
    for (const [width, height] of [[1440, 900], [1366, 768], [768, 1024], [390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.locator('[data-date="2026-09-15"]').click();
      await page.waitForTimeout(300);
      const layout = await page.evaluate(() => {
        const top = document.querySelector('nav').getBoundingClientRect().bottom;
        const selectors = ['.contact-booking .cal-widget', '#contactMessage', '#contactForm button[type="submit"]'];
        return selectors.map(selector => {
          const rect = document.querySelector(selector).getBoundingClientRect();
          return { selector, visible: rect.top >= top && rect.bottom <= innerHeight };
        });
      });
      assert(layout.every(item => item.visible), `${width}x${height}: ${JSON.stringify(layout)}`);
      const before = await page.evaluate(() => scrollY);
      await page.locator('[data-date="2026-09-22"]').click();
      assert(Math.abs(await page.evaluate(() => scrollY) - before) <= 1, 'Visible booking controls should not scroll the page');
    }
    console.log('PASS: calendar, message and send button visible together; visible date changes do not scroll');
    await page.locator('#bookingTime').evaluate(e => {
      e.add(new Option('Invalid time', '25:99')); e.value = '25:99'; e.dispatchEvent(new Event('change'));
    });
    await submit(); assert.match(await status(), /available time/);
    assert.equal(errors.length, 0);
    console.log('PASS: desktop/mobile geometry, invalid time rejection and no JavaScript console exceptions');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
