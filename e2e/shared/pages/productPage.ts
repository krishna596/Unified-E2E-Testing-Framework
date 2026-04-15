import { ICrossPlatformDriver, CrossPlatformSelector } from '../drivers/CrossPlatformDriver';

/**
 * Cross-Platform product Page Object (Product Detail Page)
 * Works for both Web (Playwright) and Mobile (Appium)
 * 
 * SELECTOR STRATEGY:
 * - Use `testId` when the same data-testid/accessibilityId exists on all platforms
 * - Use platform-specific fallbacks only when testId is not available
 */
export class productPage {
  private driver: ICrossPlatformDriver;

  static selectors = {
   
     homeTab: {
      mobile: {
        accessibilityId: 'Home',
        android: 'new UiSelector().text("Home")',
        ios: '-ios predicate string:label == "Home"',
      },
    } as CrossPlatformSelector,

    // ====================  product Name ====================
    // Web: data-testid="product-Name"
    // Mobile: Find product text starting with or containing "product-Name" 
    
    product: {
      //testId: 'product-Name',
      web: { css: '[data-testid="product-Name"]' },
      mobile: { 
        android: 'new UiSelector().textStartsWith("product-Name")',
        ios: '-ios predicate string:label CONTAINS "product-Name"',
      },
    } as CrossPlatformSelector,
  };

  constructor(driver: ICrossPlatformDriver) {
    this.driver = driver;
  }
  

  // ==================== NAVIGATION ====================

  /**
   * Navigate to home page
   */
  async navigateToProduct(): Promise<void> {
    console.log('🏠 Navigating to product page...');

    if (this.driver.platform === 'web') {
      await this.driver.navigateTo('/');
      await this.driver.pause(2000);
    } else {
      // Mobile: Tap Home tab if not already there
      await this.driver.pause(5000); // Wait for app to load
      try {
        await this.driver.tap(productPage.selectors.homeTab);
        await this.driver.pause(3000);
      } catch {
        // Already on home, continue
        console.log('  Already on home or Home tab not found');
      }
    }

    console.log('✓ On home page');
  }

  

  // ==================== product page ACTIONS ====================

  /**
   * Wait for product page section to load
   */
  async waitForLoad(timeout: number = 15000): Promise<void> {
    console.log('⏳ Waiting for product block to load...');
    await this.driver.waitForElement(productPage.selectors.product, timeout);
    console.log('✓ Product block loaded');
  }

  /**
   * Check if product page section is visible
   */
  async isProductVisible(): Promise<boolean> {
    return this.driver.isElementVisible(productPage.selectors.product);
  }

  

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string = 'product-page'): Promise<string> {
    return this.driver.takeScreenshot(name);
  }

  
}
