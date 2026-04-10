import { Page } from '@playwright/test';
import { 
  ICrossPlatformDriver, 
  ICrossPlatformElement, 
  CrossPlatformSelector 
} from './CrossPlatformDriver';
import { Platform } from '../interfaces/IElement';

/**
 * Web Driver Implementation using Playwright Page
 */
export class WebDriver implements ICrossPlatformDriver {
  platform: Platform = 'web';
  private page: Page;
  private baseUrl: string;

  constructor(page: Page, baseUrl: string = 'https://www.bestbuy.com') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  async navigateTo(destination: string): Promise<void> {
    const url = destination.startsWith('http') ? destination : `${this.baseUrl}${destination}`;
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Convert CrossPlatformSelector to Playwright selector
   * Priority: web.css > testId > web.xpath
   * (CSS is more specific on web, testId is fallback)
   */
  private getSelector(selector: CrossPlatformSelector): string {
    // 1. Web-specific CSS (most specific)
    if (selector.web?.css) {
      return selector.web.css;
    }
    // 2. Universal testId (data-testid attribute)
    if (selector.testId) {
      return `[data-testid="${selector.testId}"]`;
    }
    // 3. Web-specific XPath
    if (selector.web?.xpath) {
      return `xpath=${selector.web.xpath}`;
    }
    throw new Error('No web selector provided');
  }

  async findElement(selector: CrossPlatformSelector): Promise<ICrossPlatformElement> {
    const locator = this.page.locator(this.getSelector(selector)).first();
    return new WebElement(locator);
  }

  async findElements(selector: CrossPlatformSelector): Promise<ICrossPlatformElement[]> {
    const locators = await this.page.locator(this.getSelector(selector)).all();
    return locators.map(l => new WebElement(l));
  }

  async waitForElement(selector: CrossPlatformSelector, timeout: number = 10000): Promise<ICrossPlatformElement> {
    const locator = this.page.locator(this.getSelector(selector)).first();
    await locator.waitFor({ state: 'visible', timeout });
    return new WebElement(locator);
  }

  async isElementVisible(selector: CrossPlatformSelector): Promise<boolean> {
    try {
      const locator = this.page.locator(this.getSelector(selector)).first();
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  async tap(selector: CrossPlatformSelector): Promise<void> {
    await this.page.locator(this.getSelector(selector)).first().click();
  }

  async type(selector: CrossPlatformSelector, text: string): Promise<void> {
    await this.page.locator(this.getSelector(selector)).first().fill(text);
  }

  async getText(selector: CrossPlatformSelector): Promise<string> {
    return await this.page.locator(this.getSelector(selector)).first().textContent() || '';
  }

  async clear(selector: CrossPlatformSelector): Promise<void> {
    await this.page.locator(this.getSelector(selector)).first().clear();
  }

  async pressEnter(): Promise<void> {
    await this.page.keyboard.press('Enter');
  }

  async pause(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  async takeScreenshot(name: string): Promise<string> {
    const path = `./test-results/screenshots/${name}-web.png`;
    await this.page.screenshot({ path, fullPage: false });
    return path;
  }

  /**
   * Scroll down the page
   */
  async scrollDown(pixels: number = 500): Promise<void> {
    await this.page.evaluate((scrollAmount) => {
      window.scrollBy(0, scrollAmount);
    }, pixels);
  }

  // Get native Playwright page for advanced operations
  getPage(): Page {
    return this.page;
  }
}

/**
 * Web Element wrapper
 */
class WebElement implements ICrossPlatformElement {
  private locator: ReturnType<Page['locator']>;

  constructor(locator: ReturnType<Page['locator']>) {
    this.locator = locator;
  }

  async tap(): Promise<void> {
    await this.locator.click();
  }

  async type(text: string): Promise<void> {
    await this.locator.fill(text);
  }

  async getText(): Promise<string> {
    return await this.locator.textContent() || '';
  }

  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  async waitForVisible(timeout: number = 10000): Promise<void> {
    await this.locator.waitFor({ state: 'visible', timeout });
  }

  async getAttribute(attr: string): Promise<string | null> {
    return await this.locator.getAttribute(attr);
  }
}
