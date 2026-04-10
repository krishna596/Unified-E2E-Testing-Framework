import { 
  ICrossPlatformDriver, 
  ICrossPlatformElement, 
  CrossPlatformSelector,
  getCurrentPlatform
} from './CrossPlatformDriver';
import { Platform } from '../interfaces/IElement';

/**
 * Mobile Driver Implementation using WebdriverIO/Appium
 */
export class MobileDriver implements ICrossPlatformDriver {
  platform: Platform;

  constructor() {
    this.platform = getCurrentPlatform() as 'ios' | 'android';
  }

  async navigateTo(destination: string): Promise<void> {
    // For mobile apps, navigation is done through the app UI
    console.log(`Mobile: Navigating to ${destination}`);
    await browser.pause(2000);
  }

  /**
   * Convert CrossPlatformSelector to Appium selector
   * Priority: testId > accessibilityId > platform-specific
   */
  private getSelector(selector: CrossPlatformSelector): string {
    const isAndroid = this.platform === 'android';
    
    // 1. Universal testId (accessibility ID on mobile)
    if (selector.testId) {
      return `~${selector.testId}`;
    }
    // 2. Mobile accessibilityId (works on both iOS & Android)
    if (selector.mobile?.accessibilityId) {
      return `~${selector.mobile.accessibilityId}`;
    }
    // 3. Platform-specific (last resort)
    if (isAndroid && selector.mobile?.android) {
      return `android=${selector.mobile.android}`;
    }
    if (!isAndroid && selector.mobile?.ios) {
      return selector.mobile.ios;
    }
    throw new Error(`No mobile selector provided for ${this.platform}`);
  }

  async findElement(selector: CrossPlatformSelector): Promise<ICrossPlatformElement> {
    const element = await $(this.getSelector(selector));
    return new MobileElement(element as any);
  }

  async findElements(selector: CrossPlatformSelector): Promise<ICrossPlatformElement[]> {
    const elements = await $$(this.getSelector(selector));
    return elements.map(el => new MobileElement(el as any));
  }

  async waitForElement(selector: CrossPlatformSelector, timeout: number = 10000): Promise<ICrossPlatformElement> {
    const selectorStr = this.getSelector(selector);
    console.log(`Waiting for element: ${selectorStr}`);
    const element = await $(selectorStr);
    await element.waitForExist({ timeout });
    console.log(`Element found: ${selectorStr}`);
    return new MobileElement(element as any);
  }

  async isElementVisible(selector: CrossPlatformSelector): Promise<boolean> {
    try {
      const element = await $(this.getSelector(selector));
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async tap(selector: CrossPlatformSelector): Promise<void> {
    const element = await $(this.getSelector(selector));
    await element.click();
  }

  async type(selector: CrossPlatformSelector, text: string): Promise<void> {
    const element = await $(this.getSelector(selector));
    await element.setValue(text);
  }

  async getText(selector: CrossPlatformSelector): Promise<string> {
    const element = await $(this.getSelector(selector));
    // On mobile, price might be in content-desc/label attribute
    const text = await element.getText();
    if (text) return text;
    // Fallback to accessibility attributes
    const contentDesc = await element.getAttribute('content-desc');
    if (contentDesc) return contentDesc;
    const label = await element.getAttribute('label');
    return label || '';
  }

  async clear(selector: CrossPlatformSelector): Promise<void> {
    const element = await $(this.getSelector(selector));
    await element.clearValue();
  }

  async pressEnter(): Promise<void> {
    if (this.platform === 'android') {
      await browser.pressKeyCode(66); // KEYCODE_ENTER
    } else {
      // iOS: Try multiple methods to submit
      try {
        // Method 1: Send newline character (works for most text fields)
        await browser.execute('mobile: keys', { keys: ['\n'] });
      } catch {
        try {
          // Method 2: Try tapping Search button on keyboard
          const searchBtn = await $('-ios predicate string:label == "Search" AND type == "XCUIElementTypeButton"');
          if (await searchBtn.isExisting()) {
            await searchBtn.click();
          }
        } catch {
          // Method 3: Hide keyboard (might trigger submit)
          await browser.execute('mobile: hideKeyboard');
        }
      }
    }
  }

  async pause(ms: number): Promise<void> {
    await browser.pause(ms);
  }

  async takeScreenshot(name: string): Promise<string> {
    const fs = await import('fs');
    const dir = './test-results/screenshots';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const path = `${dir}/${name}-${this.platform}.png`;
    await browser.saveScreenshot(path);
    console.log(`Screenshot saved: ${path}`);
    return path;
  }

  // Mobile-specific methods
  async scrollDown(): Promise<void> {
    const { width, height } = await browser.getWindowSize();
    if (this.platform === 'android') {
      await browser.execute('mobile: scrollGesture', {
        left: Math.floor(width * 0.5),
        top: Math.floor(height * 0.5),
        width: Math.floor(width * 0.8),
        height: Math.floor(height * 0.5),
        direction: 'down',
        percent: 0.75,
      });
    } else {
      await browser.execute('mobile: scroll', { direction: 'down' });
    }
  }
}

/**
 * Mobile Element wrapper
 */
class MobileElement implements ICrossPlatformElement {
  private element: WebdriverIO.Element;

  constructor(element: WebdriverIO.Element) {
    this.element = element;
  }

  async tap(): Promise<void> {
    await this.element.click();
  }

  async type(text: string): Promise<void> {
    await this.element.setValue(text);
  }

  async getText(): Promise<string> {
    const text = await this.element.getText();
    if (text) return text;
    // Fallback to accessibility attributes
    const contentDesc = await this.element.getAttribute('content-desc');
    if (contentDesc) return contentDesc;
    const label = await this.element.getAttribute('label');
    return label || '';
  }

  async isVisible(): Promise<boolean> {
    return await this.element.isDisplayed();
  }

  async waitForVisible(timeout: number = 10000): Promise<void> {
    await this.element.waitForDisplayed({ timeout });
  }

  async getAttribute(attr: string): Promise<string | null> {
    return await this.element.getAttribute(attr);
  }
}
