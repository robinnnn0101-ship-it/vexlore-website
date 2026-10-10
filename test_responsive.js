import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VIEWPORTS = [
  { name: 'Mobile Mini (320px)', width: 320, height: 600 },
  { name: 'Mobile Standard (360px)', width: 360, height: 740 },
  { name: 'iPhone SE/8 (375px)', width: 375, height: 667 },
  { name: 'iPhone 13/14 (390px)', width: 390, height: 844 },
  { name: 'Large Mobile (414px)', width: 414, height: 896 },
  { name: 'Small Tablet (640px)', width: 640, height: 900 },
  { name: 'iPad Portrait (768px)', width: 768, height: 1024 },
  { name: 'iPad Landscape (1024px)', width: 1024, height: 768 },
  { name: 'Laptop (1280px)', width: 1280, height: 800 },
  { name: 'Desktop (1440px)', width: 1440, height: 900 },
  { name: 'Full HD (1920px)', width: 1920, height: 1080 },
];

async function runAudit() {
  console.log('--- STARTING RESPONSIVE AUDIT ---');

  if (!fs.existsSync('test_screenshots')) {
    fs.mkdirSync('test_screenshots');
  }

  // Start Vite Preview server
  const preview = spawn('npx.cmd', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    cwd: process.cwd(),
    shell: true,
  });

  // Wait 2 seconds for server to start
  await new Promise((r) => setTimeout(r, 2500));

  let browser;
  const results = [];

  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage();

    for (const vp of VIEWPORTS) {
      console.log(`\nAuditing: ${vp.name} [${vp.width}x${vp.height}]...`);
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:4173', { waitUntil: 'networkidle0', timeout: 15000 });

      // Check horizontal overflow
      const overflowInfo = await page.evaluate(() => {
        const docW = window.innerWidth;
        const scrollW = document.documentElement.scrollWidth;
        const bodyScrollW = document.body.scrollWidth;

        const overflowingElements = [];
        document.querySelectorAll('*').forEach((el) => {
          // Ignore SVG defs or fixed full-screen backdrops
          if (['svg', 'defs', 'filter', 'linearGradient', 'path'].includes(el.tagName.toLowerCase())) return;
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.right > docW + 1.5) {
            overflowingElements.push({
              tag: el.tagName,
              id: el.id,
              className: String(el.className || '').slice(0, 50),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              excess: Math.round(rect.right - docW),
            });
          }
        });

        return {
          windowWidth: docW,
          scrollWidth: scrollW,
          bodyScrollWidth: bodyScrollW,
          hasOverflow: scrollW > docW + 1 || bodyScrollW > docW + 1,
          overflowingElements: overflowingElements.slice(0, 5),
        };
      });

      // Test mobile burger menu if on mobile
      let menuTest = 'N/A';
      if (vp.width <= 700) {
        try {
          const burger = await page.$('#burger');
          if (burger) {
            await burger.click();
            await new Promise((r) => setTimeout(r, 300));
            const menuOpenInfo = await page.evaluate(() => {
              const menu = document.querySelector('#menu');
              const docW = window.innerWidth;
              const menuRect = menu ? menu.getBoundingClientRect() : null;
              return {
                isOpen: menu ? menu.classList.contains('open') : false,
                menuWidth: menuRect ? Math.round(menuRect.width) : 0,
                menuRight: menuRect ? Math.round(menuRect.right) : 0,
                overflows: menuRect ? menuRect.right > docW + 1 : false,
              };
            });

            // Close menu
            await burger.click();
            await new Promise((r) => setTimeout(r, 200));

            menuTest = menuOpenInfo.overflows
              ? `FAILED (menuRight ${menuOpenInfo.menuRight} > ${vp.width})`
              : 'PASSED (Clean Drawer, Zero Overflow)';
          }
        } catch (err) {
          menuTest = `ERROR: ${err.message}`;
        }
      }

      // Check sticky header
      await page.evaluate(() => window.scrollTo(0, 500));
      await new Promise((r) => setTimeout(r, 200));
      const stickyInfo = await page.evaluate(() => {
        const nav = document.querySelector('header.nav');
        const rect = nav ? nav.getBoundingClientRect() : null;
        return {
          exists: !!nav,
          top: rect ? Math.round(rect.top) : -999,
          isPinned: rect ? Math.abs(rect.top) <= 2 : false,
        };
      });

      // Reset scroll
      await page.evaluate(() => window.scrollTo(0, 0));

      const isPass = !overflowInfo.hasOverflow && (menuTest === 'N/A' || menuTest.includes('PASSED')) && stickyInfo.isPinned;

      results.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        hasOverflow: overflowInfo.hasOverflow,
        scrollWidth: overflowInfo.scrollWidth,
        stickyHeader: stickyInfo.isPinned ? 'STUCK TO TOP' : `UNPINNED (top: ${stickyInfo.top})`,
        mobileMenu: menuTest,
        overflowingElements: overflowInfo.overflowingElements,
        status: isPass ? 'PASS' : 'FAIL',
      });

      console.log(`  -> Status: ${isPass ? 'PASS' : 'FAIL'} | ScrollWidth: ${overflowInfo.scrollWidth}/${vp.width} | Sticky: ${stickyInfo.isPinned ? 'OK' : 'FAIL'} | Menu: ${menuTest}`);
      if (overflowInfo.overflowingElements.length > 0) {
        console.log('  -> Overflowing elements:', overflowInfo.overflowingElements);
      }
    }

    // Now test Scanner interaction on mobile (375px)
    console.log('\n--- Testing Live Scanner on Mobile (375px) ---');
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

    // Click quick pill for SOL
    const pill = await page.$('.quick-pills button');
    if (pill) {
      await pill.click();
      console.log('  -> Clicked Quick Pill (Dw8i...pump)');
      // Wait for scan to complete or error to show
      await new Promise((r) => setTimeout(r, 4000));

      const sheetOverflow = await page.evaluate(() => {
        const docW = window.innerWidth;
        const scrollW = document.documentElement.scrollWidth;
        const sheet = document.querySelector('#scanSheet');
        const sheetRect = sheet ? sheet.getBoundingClientRect() : null;

        const overElements = [];
        if (sheet) {
          sheet.querySelectorAll('*').forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > docW + 1) {
              overElements.push({
                tag: el.tagName,
                className: el.className,
                right: rect.right,
                docW,
              });
            }
          });
        }

        return {
          scrollWidth: scrollW,
          docW,
          hasOverflow: scrollW > docW + 1,
          sheetRendered: !!sheet,
          sheetWidth: sheetRect ? sheetRect.width : 0,
          overElements: overElements.slice(0, 3),
        };
      });

      console.log(`  -> Scanner Result on 375px: ${sheetOverflow.hasOverflow ? 'OVERFLOW DETECTED' : 'CLEAN (Zero Overflow)'}`);
      if (sheetOverflow.hasOverflow) {
        console.log('  -> Over elements:', sheetOverflow.overElements);
      }
    }

    fs.writeFileSync('test_results.json', JSON.stringify(results, null, 2));
    console.log('\nAudit complete. Results saved to test_results.json');
  } catch (err) {
    console.error('Audit failed with error:', err);
  } finally {
    if (browser) await browser.close();
    preview.kill();
  }
}

runAudit();
