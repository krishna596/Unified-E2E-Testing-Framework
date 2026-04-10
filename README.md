# Hybrid E2E Testing Framework

A unified cross-platform testing framework that runs the **same test** on **Web**, **Android**, and **iOS**.

---

## Quick Start

```bash
# Run on Web (Playwright)
npm run test:web

# Run on Android (Appium) - start emulator first
npm run test:android

# Run on iOS (Appium) - start simulator first
npm run test:ios

# Run on all platforms
npm run test:all
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    SINGLE SPEC FILE                                  │
│                    price.spec.ts                                     │
│          (Same tests for Web, Android, iOS)                          │
└──────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    DRIVER FACTORY                                    │
│     Detects TEST_PLATFORM env var → Creates appropriate driver       │
└──────────────────────────────────────────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │  WebDriver  │     │MobileDriver │     │MobileDriver │
    │ (Playwright)│     │  (Android)  │     │   (iOS)     │
    └─────────────┘     └─────────────┘     └─────────────┘
           │                   │                   │
           ▼                   ▼                   ▼
    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │   Browser   │     │  Emulator   │     │  Simulator  │
    └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Project Structure

```
playWright/
├── e2e/
│   ├── specs/                        # Test specifications
│   │   └── price.spec.ts             # ★ UNIFIED SPEC - runs on all platforms
│   │
│   ├── shared/                       # Cross-platform code
│   │   ├── drivers/
│   │   │   ├── CrossPlatformDriver.ts   # Interface & platform detection
│   │   │   ├── WebDriver.ts             # Playwright implementation
│   │   │   └── MobileDriver.ts          # Appium implementation
│   │   ├── pages/
│   │   │   └── PricePage.ts             # Cross-platform page object
│   │   └── DriverFactory.ts             # Creates driver based on platform
│   │
│   └── builds/                       # Mobile app binaries
│       ├── app-consumer-debug.apk    # Android APK
│       └── Bestbuy-mApp.app/         # iOS Simulator app
│
├── package.json                      # Dependencies & scripts
├── playwright.config.ts              # Web test config
├── wdio.conf.ts                      # Mobile test config
└── tsconfig.json                     # TypeScript config
```

---

## How It Works

### Platform Detection

The framework uses `TEST_PLATFORM` environment variable:

| Command | TEST_PLATFORM | Driver Used | Navigation |
|---------|---------------|-------------|------------|
| `npm run test:web` | web | WebDriver (Playwright) | Direct URL |
| `npm run test:android` | android | MobileDriver (Appium) | Search → Tap |
| `npm run test:ios` | ios | MobileDriver (Appium) | Search → Tap |

### Navigation Flow

**Web Flow:**
```
1. Navigate directly to product URL
2. Wait for page load
3. Validate price block
```

**Mobile Flow:**
```
1. Launch app
2. Tap search icon
3. Enter search term
4. Tap first product result
5. Wait for PDP load
6. Validate price block
```

---

## Writing Tests

### Single Spec File Pattern

```typescript
// e2e/specs/price.spec.ts

import { getCurrentPlatform, isMobile } from '../shared/drivers/CrossPlatformDriver';

const PLATFORM = getCurrentPlatform();
const IS_MOBILE = isMobile();

// Web tests (Playwright)
if (!IS_MOBILE) {
  const { test, expect } = require('@playwright/test');
  const { WebDriver } = require('../shared/drivers/WebDriver');
  
  test.describe(`Price Test - ${PLATFORM}`, () => {
    test('price should be visible', async ({ page }) => {
      const driver = new WebDriver(page);
      // Navigate to product via URL
      await driver.navigateTo('/product/12345');
      // Validate price...
    });
  });
}

// Mobile tests (Appium)
if (IS_MOBILE) {
  const { MobileDriver } = require('../shared/drivers/MobileDriver');
  
  describe(`Price Test - ${PLATFORM}`, () => {
    it('price should be visible', async () => {
      const driver = new MobileDriver();
      // Search and tap product
      // Validate price...
    });
  });
}
```

### Cross-Platform Selectors

```typescript
const priceSelector: CrossPlatformSelector = {
  web: { 
    css: '[data-testid="price"]' 
  },
  mobile: { 
    accessibilityId: 'price',
    android: 'new UiSelector().resourceId("price")',
    ios: '-ios class chain:**/XCUIElementTypeStaticText[`name == "price"`]'
  }
};
```

---

## Key Files

### DriverFactory (`e2e/shared/DriverFactory.ts`)

Creates the appropriate driver based on platform:

```typescript
import { DriverFactory, navigateToPDP } from './shared/DriverFactory';

// Create driver (auto-detects platform)
const driver = DriverFactory.createDriver('web', page);

// Navigate to PDP (handles platform-specific flow)
await navigateToPDP(driver, {
  productUrl: '/product/12345',  // Web: direct URL
  searchTerm: 'laptop'           // Mobile: search term
});
```

### PricePage (`e2e/shared/pages/PricePage.ts`)

Cross-platform page object with:
- Search functionality
- Price validation methods
- Same methods work on web and mobile

**Methods:**
| Method | Description |
|--------|-------------|
| `searchForProduct(term)` | Search for a product |
| `selectFirstProduct()` | Tap first search result |
| `navigateToPDPViaSearch(term)` | Full search → PDP flow |
| `waitForLoad()` | Wait for price block |
| `isPriceVisible()` | Check price visibility |
| `getCurrentPrice()` | Get price text |
| `isAddToCartVisible()` | Check Add to Cart button |
| `getPriceInfo()` | Get all price data |

---

## Configuration

### Mobile Config (`wdio.conf.ts`)

All mobile test configuration is in `wdio.conf.ts`:
- Android/iOS capabilities
- App paths
- Device names
- Timeouts

### Web Config (`playwright.config.ts`)

Web test configuration is in `playwright.config.ts`:
- Browser settings
- Base URL
- Timeouts

---

## NPM Scripts

```bash
# ═══════════════════════════════════════════════════
# RUN TESTS
# ═══════════════════════════════════════════════════
npm run test:web           # Web (Playwright)
npm run test:android       # Android (Appium)
npm run test:ios           # iOS (Appium)
npm run test:all           # All platforms

# ═══════════════════════════════════════════════════
# WEB OPTIONS
# ═══════════════════════════════════════════════════
npm run test:web:headed    # With visible browser
npm run test:web:debug     # Debug mode
npm run test:web:ui        # Playwright UI

# ═══════════════════════════════════════════════════
# UTILITIES
# ═══════════════════════════════════════════════════
npm run test:report        # View HTML report
npm run clean              # Clean test results
npm run appium:start       # Start Appium server
```

---

## Setup

### Prerequisites

- Node.js 18+
- Android SDK (for Android tests)
- Xcode (for iOS tests, macOS only)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Mobile Setup

**Android:**
```bash
# Start emulator
emulator -avd Pixel_3a &

# Verify device
adb devices
```

**iOS:**
```bash
# Boot simulator
xcrun simctl boot "iPhone 16e"
open -a Simulator
```

---

## Test Results

| Platform | Config | Test Runner |
|----------|--------|-------------|
| Web | `playwright.config.ts` | Playwright |
| Android | `wdio.conf.ts` | WebdriverIO |
| iOS | `wdio.conf.ts` | WebdriverIO |

**Output locations:**
- Screenshots: `./test-results/screenshots/`
- Web reports: `./playwright-report/`

---

## Troubleshooting

### "No emulator found"
```bash
emulator -avd Pixel_3a &
adb wait-for-device
```

### "iOS app needs update"
The app was built for an older iOS version. Get a simulator build from your team.

### "Element not found"
1. Check selector in `PricePage.ts`
2. Use `await driver.pause(2000)` to debug
3. Check platform-specific selector exists

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONE SPEC FILE                                │
│                    ↓                                            │
│    TEST_PLATFORM=web      → Playwright (URL navigation)        │
│    TEST_PLATFORM=android  → Appium (search + tap)              │
│    TEST_PLATFORM=ios      → Appium (search + tap)              │
│                    ↓                                            │
│              SAME VALIDATIONS                                   │
│    - Price block visible                                        │
│    - Price format correct                                       │
│    - Add to Cart visible                                        │
└─────────────────────────────────────────────────────────────────┘
```
