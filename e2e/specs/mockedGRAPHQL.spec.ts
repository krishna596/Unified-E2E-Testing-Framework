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
    await page.route('**/graphql', async (route) => {
        const request = route.request();
        const postData = request.postDataJSON();
      
        if (postData.operationName === '' && postData.variables.requestId === '') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: mockedProductJson // add the json data you want to return here
            })
          });
        } else {
          await route.continue(); // Let other requests pass through
        }
      });
      

      // go to url 
      await driver.navigateTo('');
      await driver.pause(5000);
    });

    
  });

} 


