
      const { chromium } = require('playwright');
      const axe = require('@axe-core/playwright');

      async function runAxeTest() {
        console.log('Launching browser...');
        const browser = await chromium.launch();
        const page = await browser.newPage();
        
        console.log('Navigating to application...');
        await page.goto('http://localhost:4173');
        
        console.log('Waiting for application to load...');
        await page.waitForSelector('h1');
        
        console.log('Running accessibility audit...');
        const results = await axe.run(page, {
          rules: {
            // WCAG 2.2 specific rules
            'color-contrast': { enabled: true },
            'color-contrast-enhanced': { enabled: false }, // Only test minimum for now
            'focus-order-semantics': { enabled: true },
            'keyboard-navigation': { enabled: true },
            'aria-labels': { enabled: true },
            'semantic-markup': { enabled: true },
            'target-size': { enabled: true },
            'focus-visible': { enabled: true }
          }
        });
        
        console.log('Audit completed, closing browser...');
        console.log(JSON.stringify(results, null, 2));
        
        await browser.close();
      }

      runAxeTest().catch(console.error);
    