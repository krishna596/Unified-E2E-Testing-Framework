/**
 * Shared module exports
 * Import everything from this file for convenience
 */

// Drivers
export { 
  ICrossPlatformDriver, 
  ICrossPlatformElement,
  CrossPlatformSelector,
  getCurrentPlatform,
  isMobile,
  isWeb
} from './drivers/CrossPlatformDriver';
export { WebDriver } from './drivers/WebDriver';
export { MobileDriver } from './drivers/MobileDriver';

// Pages
export { productPage } from './pages/productPage';


// Types
export { Platform } from './interfaces/IElement';
