import type { Page } from '@playwright/test';
import { getCurrentPlatform, isMobile } from '../shared/drivers/CrossPlatformDriver';
import { WebDriver } from '../shared/drivers/WebDriver';
import mockedProductJson from '../Mocked/mockedProductDetails.json';

const PLATFORM = getCurrentPlatform();
const IS_MOBILE = isMobile();

// ============================================================================
// FRAMEWORK-SPECIFIC WRAPPERS (minimal duplication)
// ============================================================================
if (!IS_MOBILE) {
  // WEB: Playwright
  const { test, expect } = require('@playwright/test');

  test.describe(`UI Validation - ${PLATFORM.toUpperCase()}`, () => {
    let pageRef: Page;

    test.beforeEach(async ({ page }: { page: Page }) => {
      pageRef = page;
      const driver = new WebDriver(page);

    // Mock the product page with local HTML response
    await page.route('**/query**', async (route: any) => {
      await route.fulfill({  mockedProductJson   // add the json you want to return here});
    });

      // go to url 
      await driver.navigateTo('');
      await driver.pause(5000);
    });
  });

});
} 


