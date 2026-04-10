import { getCurrentPlatform, isMobile } from '../shared/drivers/CrossPlatformDriver';
import { WebDriver } from '../shared/drivers/WebDriver';
import { PricePage } from '../shared/pages/PricePage';
import { MobileDriver } from '../shared/drivers/MobileDriver';

const PLATFORM = getCurrentPlatform();
const IS_MOBILE = isMobile();
const SEARCH_TERM = 'laptop';

// ============================================================================
// SHARED TEST LOGIC - Written once, used by both frameworks
// ============================================================================
const priceTests = {
  async verifyPriceBlockVisible(pricePage: PricePage): Promise<boolean> {
    const isPriceVisible = await pricePage.isPriceVisible();
    console.log(isPriceVisible ? ' Price block is visible' : ' Price block NOT visible');
    return isPriceVisible;
  },

  async verifyPriceFormat(pricePage: PricePage): Promise<{ price: string; isValid: boolean }> {
    const currentPrice = await pricePage.getCurrentPrice();
    console.log(` Current Price: ${currentPrice}`);
    
    // Price should contain numbers
    const isValid = /\$?[\d,]+\.?\d*/.test(currentPrice);
    
    console.log(isValid ? ' Price format is valid' : ' Price format invalid');
    return { price: currentPrice, isValid };
  }
};

// ============================================================================
// FRAMEWORK-SPECIFIC WRAPPERS (minimal duplication)
// ============================================================================
if (!IS_MOBILE) {
  // WEB: Playwright
  const { test, expect } = require('@playwright/test');

  test.describe(`Price Validation - ${PLATFORM.toUpperCase()}`, () => {
    let pricePage: PricePage;

    test.beforeEach(async ({ page }: { page: any }) => {
      const driver = new WebDriver(page);
      pricePage = new PricePage(driver);
      // Same flow as mobile: Search → Select first product
      await pricePage.navigateToPDPViaSearch(SEARCH_TERM);
    });

    test('Price block visible', async () => {
      expect(await priceTests.verifyPriceBlockVisible(pricePage)).toBe(true);
    });

    test('Price format valid', async () => {
      const result = await priceTests.verifyPriceFormat(pricePage);
      expect(result.price).toBeTruthy();
      expect(result.isValid).toBe(true);
    });
  });

} if (IS_MOBILE) {
  // MOBILE: WebdriverIO/Mocha
  describe(`Price Validation - ${PLATFORM.toUpperCase()}`, () => {
    let pricePage: PricePage;

    before(async function() {
      const driver = new MobileDriver();
      pricePage = new PricePage(driver);
  
      // Navigate to PDP via search - same flow as web for consistency
      await pricePage.navigateToPDPViaSearch(SEARCH_TERM);
    });

    after(async function() {
      console.log(`\n ${PLATFORM.toUpperCase()} test session completed.`);
    });

    it('Price block visible', async function() {
      expect(await priceTests.verifyPriceBlockVisible(pricePage)).toBe(true);
    });

    it('Price format valid', async function() {
      const result = await priceTests.verifyPriceFormat(pricePage);
      expect(result.price).toBeTruthy();
      expect(result.isValid).toBe(true);
    });
  });
}



