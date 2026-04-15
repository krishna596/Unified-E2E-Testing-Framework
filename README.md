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
│                    product.spec.ts                                     │
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
│   │   └── *.spec.ts                 # ★ UNIFIED SPEC - runs on all platforms
│   │
│   ├── shared/                       # Cross-platform code
│   │   ├── drivers/
│   │   │   ├── CrossPlatformDriver.ts   # Interface & platform detection
│   │   │   ├── WebDriver.ts             # Playwright implementation
│   │   │   └── MobileDriver.ts          # Appium implementation
│   │   ├── pages/
│   │   │   └── page.ts                  # Cross-platform page object
│   │
│   │
│   └── builds/                       # Mobile app binaries
│       ├── android.apk               # Android APK
│       └── IOS.app/                  # iOS Simulator app
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

| Command                | TEST_PLATFORM | Driver Used            | Navigation   |
| ---------------------- | ------------- | ---------------------- | ------------ |
| `npm run test:web`     | web           | WebDriver (Playwright) | Direct URL   |
| `npm run test:android` | android       | MobileDriver (Appium)  | Search → Tap |
| `npm run test:ios`     | ios           | MobileDriver (Appium)  | Search → Tap |

### Navigation Flow

**Web Flow:**

```
1. Navigate directly to product URL
2. Wait for page load
3. Validate component
```

**Mobile Flow:**

```
1. Launch app
2. Wait for page load
3. go to the page you have your component
4. Validate the component
```

---

## Writing Tests

### Single Spec File Pattern

```typescript
// e2e/specs/product.spec.ts

import {
  getCurrentPlatform,
  isMobile,
} from "../shared/drivers/CrossPlatformDriver";

const PLATFORM = getCurrentPlatform();
const IS_MOBILE = isMobile();

// Web tests (Playwright)
if (!IS_MOBILE) {
  const { test, expect } = require("@playwright/test");
  const { WebDriver } = require("../shared/drivers/WebDriver");

  test.describe(`component Test - ${PLATFORM}`, () => {
    test("product should be visible", async ({ page }) => {
      const driver = new WebDriver(page);
      // Navigate to product via URL
      await driver.navigateTo("/product/12345");
      // Validate component...
    });
  });
}

// Mobile tests (Appium)
if (IS_MOBILE) {
  const { MobileDriver } = require("../shared/drivers/MobileDriver");

  describe(`product Test - ${PLATFORM}`, () => {
    it("product should be visible", async () => {
      const driver = new MobileDriver();
      // Search and tap product
      // Validate component...
    });
  });
}
```

### Cross-Platform Selectors

```typescript
const productSelector: CrossPlatformSelector = {
  web: {
    css: '[data-testid="productName"]',
  },
  mobile: {
    accessibilityId: "productName",
    android: 'new UiSelector().resourceId("productName")',
    ios: '-ios class chain:**/XCUIElementTypeStaticText[`name == "productName"`]',
  },
};
```

---

## Key Files

### productPage (`e2e/shared/pages/Page.ts`)

Cross-platform page object with:

- Navigation functionality
- component validation methods
- Same methods work on web and mobile

**Methods:**
| Method | Description |
|--------|-------------|
|
| `navigateTocomponent()` | Full search → PDP flow |
| `waitForLoad()` | Wait for product block |
| `isComponentVisible()` | Check product visibility |

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

| Platform | Config                 | Test Runner |
| -------- | ---------------------- | ----------- |
| Web      | `playwright.config.ts` | Playwright  |
| Android  | `wdio.conf.ts`         | WebdriverIO |
| iOS      | `wdio.conf.ts`         | WebdriverIO |

**Output locations:**

- Screenshots: `./test-results/screenshots/`
- Web reports: `./playwright-report/`

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONE SPEC FILE                                │
│                    ↓                                            │
│    TEST_PLATFORM=web      → Playwright (URL navigation)         │
│    TEST_PLATFORM=android  → Appium (search + tap)               │
│    TEST_PLATFORM=ios      → Appium (search + tap)               │
│                    ↓                                            │
│              SAME VALIDATIONS                                   │
│    - component visible                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
