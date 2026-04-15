import { getCurrentPlatform, isMobile } from '../shared/drivers/CrossPlatformDriver';
import { WebDriver } from '../shared/drivers/WebDriver';
import { productPage as ProductPage } from '../shared/pages/productPage';
import { MobileDriver } from '../shared/drivers/MobileDriver';

const PLATFORM = getCurrentPlatform();
const IS_MOBILE = isMobile();

// ============================================================================
// SHARED TEST LOGIC - Written once, used by both frameworks
// ============================================================================
const productTests = {
  async verifyProductVisible(productPage: ProductPage): Promise<boolean> {
    const isProductVisible = await productPage.isProductVisible();
    console.log(isProductVisible ? ' Product is visible' : ' Product NOT visible');
    return isProductVisible;
  },
};

// ============================================================================
// FRAMEWORK-SPECIFIC WRAPPERS (minimal duplication)
// ============================================================================
if (!IS_MOBILE) {
  // WEB: Playwright
  const { test, expect } = require('@playwright/test');

  test.describe(`UI Validation - ${PLATFORM.toUpperCase()}`, () => {
    let productPage: ProductPage;

    test.beforeEach(async ({ page }: { page: any }) => {
      const driver = new WebDriver(page);
      productPage = new ProductPage(driver);
      // Same flow as mobile: Search → Select first product
      await productPage.navigateToProduct();
    });

    test('component visible', async () => {
      expect(await productTests.verifyProductVisible(productPage)).toBe(true);
    });

  });

} if (IS_MOBILE) {
  // MOBILE: WebdriverIO/Mocha
  describe(`UI Validation - ${PLATFORM.toUpperCase()}`, () => {
    let productPage: ProductPage;

    before(async function() {
      const driver = new MobileDriver();
      productPage = new ProductPage(driver);
  
      // Navigate to PDP via search - same flow as web for consistency
      await productPage.navigateToProduct();
    });

    after(async function() {
      console.log(`\n ${PLATFORM.toUpperCase()} test session completed.`);
    });

    it('Product visible', async function() {
      expect(await productTests.verifyProductVisible(productPage)).toBe(true);
    });
  });
}



