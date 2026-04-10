import { Platform } from '../interfaces/IElement';

/**
 * Cross-Platform Driver Interface
 * Unified interface for both Web (Playwright) and Mobile (Appium)
 */
export interface ICrossPlatformDriver {
  platform: Platform;
  
  // Navigation
  navigateTo(destination: string): Promise<void>;
  
  // Element interactions
  findElement(selector: CrossPlatformSelector): Promise<ICrossPlatformElement>;
  findElements(selector: CrossPlatformSelector): Promise<ICrossPlatformElement[]>;
  waitForElement(selector: CrossPlatformSelector, timeout?: number): Promise<ICrossPlatformElement>;
  isElementVisible(selector: CrossPlatformSelector): Promise<boolean>;
  
  // Actions
  tap(selector: CrossPlatformSelector): Promise<void>;
  type(selector: CrossPlatformSelector, text: string): Promise<void>;
  getText(selector: CrossPlatformSelector): Promise<string>;
  clear(selector: CrossPlatformSelector): Promise<void>;
  pressEnter(): Promise<void>;
  
  // Utilities
  pause(ms: number): Promise<void>;
  takeScreenshot(name: string): Promise<string>;
  scrollDown?(pixels?: number): Promise<void>;
}

/**
 * Cross-Platform Element Interface
 */
export interface ICrossPlatformElement {
  tap(): Promise<void>;
  type(text: string): Promise<void>;
  getText(): Promise<string>;
  isVisible(): Promise<boolean>;
  waitForVisible(timeout?: number): Promise<void>;
  getAttribute(attr: string): Promise<string | null>;
}

/**
 * Cross-Platform Selector
 * 
 * BEST PRACTICE: Use `testId` when possible - it works on ALL platforms!
 * - Web: data-testid="search-input"
 * - iOS: accessibilityIdentifier = "search-input" 
 * - Android: content-desc = "search-input"
 * 
 * Priority order:
 * 1. testId (universal - works on web, iOS, Android)
 * 2. Platform-specific selectors (fallback when testId not available)
 */
export interface CrossPlatformSelector {
  // UNIVERSAL: Same testId works on all platforms (recommended!)
  testId?: string;
  
  // WEB-ONLY: Fallback when testId not available
  web?: {
    css?: string;
    xpath?: string;
  };
  
  // MOBILE-ONLY: Fallback when testId not available
  mobile?: {
    accessibilityId?: string;  // Works on both iOS & Android
    android?: string;          // Android UiSelector (last resort)
    ios?: string;              // iOS class chain (last resort)
  };
}

/**
 * Get the current platform from environment
 */
export function getCurrentPlatform(): Platform {
  const platform = process.env.TEST_PLATFORM?.toLowerCase();
  if (platform === 'ios' || platform === 'android') {
    return platform;
  }
  return 'web';
}

/**
 * Check if running on mobile
 */
export function isMobile(): boolean {
  const platform = getCurrentPlatform();
  return platform === 'ios' || platform === 'android';
}

/**
 * Check if running on web
 */
export function isWeb(): boolean {
  return getCurrentPlatform() === 'web';
}
