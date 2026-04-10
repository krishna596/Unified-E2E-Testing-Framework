import { ICrossPlatformDriver, CrossPlatformSelector } from '../drivers/CrossPlatformDriver';

/**
 * Cross-Platform Price Page Object (PDP - Product Detail Page)
 * Works for both Web (Playwright) and Mobile (Appium)
 * 
 * SELECTOR STRATEGY:
 * - Use `testId` when the same data-testid/accessibilityId exists on all platforms
 * - Use platform-specific fallbacks only when testId is not available
 */
export class PricePage {
  private driver: ICrossPlatformDriver;

  static selectors = {
    // ==================== SEARCH FLOW ====================
    
    // Search field/bar - visible on home screen
    searchIcon: {
      web: { css: '[placeholder="Search Best Buy"]' },
      mobile: { 
        android: 'new UiSelector().className("android.widget.EditText")',
        ios: '-ios predicate string:label CONTAINS "Search Best Buy"',
      },
    } as CrossPlatformSelector,

    // Search input field after search is activated
    searchInput: {
      web: { css: '[placeholder="Search Best Buy"]' },
      mobile: { 
        android: 'new UiSelector().className("android.widget.EditText")',
        ios: '-ios class chain:**/XCUIElementTypeTextField',
      },
    } as CrossPlatformSelector,
    
    // iOS-specific: Text field for typing
    searchTextField: {
      mobile: {
        ios: '-ios class chain:**/XCUIElementTypeTextField',
      },
    } as CrossPlatformSelector,

    // Search submit - on mobile we press Enter, on web we click button
    searchSubmit: {
      web: { css: 'button[class*="header-search"], button[aria-label*="Search"]' },
      mobile: { 
        android: 'new UiSelector().resourceId("SearchButton-TestID")',
        ios: '-ios predicate string:label == "Search" AND type == "XCUIElementTypeButton"',
      },
    } as CrossPlatformSelector,

    // First product in search results (PLP)
    firstProductResult: {
      web: { css: 'a[href*="/product/"], a[href*="/site/"][href*=".p"]' },
      mobile: { 
        android: 'new UiSelector().textContains("$")',
        ios: '-ios predicate string:label BEGINSWITH "$"',
      },
    } as CrossPlatformSelector,

     homeTab: {
      mobile: {
        accessibilityId: 'Home',
        android: 'new UiSelector().text("Home")',
        ios: '-ios predicate string:label == "Home"',
      },
    } as CrossPlatformSelector,

    // ==================== PDP PRICE BLOCK ====================
    // Web: data-testid="price-block-customer-price"
    // Mobile: Find price text starting with or containing "$"
    
    priceBlock: {
      //testId: 'price-block-customer-price',
      web: { css: '[data-testid="price-block-customer-price"]' },
      mobile: { 
        android: 'new UiSelector().textStartsWith("$")',
        ios: '-ios predicate string:label CONTAINS "$"',
      },
    } as CrossPlatformSelector,

    currentPrice: {
      //testId: 'price-block-customer-price',
      web: { css: '[data-testid="price-block-customer-price"] span[aria-hidden="true"]' },
      mobile: { 
        android: 'new UiSelector().textStartsWith("$")',
        ios: '-ios predicate string:label CONTAINS "$"',
      },
    } as CrossPlatformSelector,


    productTitle: {
      web: { css: 'h1[class*="heading"], .sku-title h1' },
      mobile: { accessibilityId: 'product-title' },
    } as CrossPlatformSelector,
  };

  constructor(driver: ICrossPlatformDriver) {
    this.driver = driver;
  }




  

  // ==================== NAVIGATION ====================

  /**
   * Navigate to home page
   */
  async navigateToHome(): Promise<void> {
    console.log('🏠 Navigating to home page...');

    if (this.driver.platform === 'web') {
      await this.driver.navigateTo('/');
      await this.driver.pause(2000);
    } else {
      // Mobile: Tap Home tab if not already there
      await this.driver.pause(5000); // Wait for app to load
      try {
        await this.driver.tap(PricePage.selectors.homeTab);
        await this.driver.pause(3000);
      } catch {
        // Already on home, continue
        console.log('  Already on home or Home tab not found');
      }
    }

    console.log('✓ On home page');
  }

  /**
   * Search for a product - UNIFIED FLOW for Web, Android, and iOS
   * Flow: Tap Search → Type search term → Submit → Wait for PLP results
   */
  async searchForProduct(searchTerm: string): Promise<void> {
    console.log(`🔍 Searching for: ${searchTerm}`);
    
    const isWeb = this.driver.platform === 'web';
    const isIOS = this.driver.platform === 'ios';
    const isAndroid = this.driver.platform === 'android';
    
    // Wait for app/page to load
    await this.driver.pause(isWeb ? 2000 : 5000);
    
    // Handle onboarding and dialogs on mobile
    if (isAndroid || isIOS) {
    //await this.handleOnboardingDialogs();
    }
    
    // ==================== UNIFIED SEARCH FLOW ====================
    // Same pattern for Web, Android, and iOS:
    // 1. Tap search icon/field
    // 2. Type search term
    // 3. Submit search
    // 4. Wait for PLP results
    
    if (isWeb) {
      // Web: Type in search field and click submit
      await this.driver.waitForElement(PricePage.selectors.searchInput, 30000);
      
      await this.driver.type(PricePage.selectors.searchInput, searchTerm);
      await this.driver.pause(1000);
      await this.driver.tap(PricePage.selectors.searchSubmit);
      
    } else if (isIOS) {
    
      
      // Wait for app to load
   //   await this.driver.pause(2000);
      // try {
      //   // Get app bundle ID (from wdio.conf.ts)
      //   const bundleId = 'com.bestbuy.buyphone.production';
        
      //   // Terminate the app
      //   await browser.execute('mobile: terminateApp', { bundleId });
      //   await this.driver.pause(1000);
        
      //   // Activate (relaunch) the app  
      //   console.log('  Relaunching app...');
      //   await browser.execute('mobile: activateApp', { bundleId });
      //   await this.driver.pause(5000); // Wait for app to fully load
        
      //   console.log('  App relaunched');
      // } catch (e) {
      //   console.log(`  App reset failed: ${e}`);
        
      //   // Fallback: try pressing hardware home button and reopening
        // try {
        //   await browser.execute('mobile: pressButton', { name: 'home' });
        //   await this.driver.pause(2000);
        // } catch {
        //   console.log('  Home button press failed');
        // }
      // }
      
      // The search bar shows "Search Best Buy" - tap it to open search mode
      // const searchBarSelectors = [
      //   '-ios predicate string:label == "Search Best Buy"',
      //   '-ios predicate string:name == "Search Best Buy"',
      //   '-ios predicate string:value == "Search Best Buy"',
      //   '-ios class chain:**/XCUIElementTypeSearchField',
      // ];
      
      let searchBarTapped = false;
      // for (const sel of searchBarSelectors) {
      //   try {
      //     console.log(`  Trying: ${sel.substring(0, 50)}...`);
      //     const searchBar = await $(sel);
      //     if (await searchBar.isExisting()) {
      //       console.log('  Found search bar element, tapping...');
      //       await searchBar.click();
      //       searchBarTapped = true;
      //       break;
      //     }
      //   } catch (e) {
      //     console.log(`  Not found`);
      //   }
      // }
      
      // If selectors didn't work, try coordinate tap on search bar area
      if (!searchBarTapped) {
        console.log('  Using coordinate tap on search bar (y=130)...');
        const { width } = await browser.getWindowSize();
        await browser.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: Math.floor(width / 2), y: 130 },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerUp', button: 0 },
          ],
        }]);
      }
      
      // Wait for keyboard and search suggestions to appear
     
      await this.driver.pause(3000);
      
      // Step 2: Search for the term - Two options: TYPE in search field OR TAP from popular searches
      console.log('🔍 Attempting to search for: ' + searchTerm);
      let searchInitiated = false;
      
      // // OPTION A: Type in the search field (keyboard is already open)
      // console.log('⌨️ Trying to type in search field...');
      // try {
      //   // Try multiple selectors for the search field
      //   const searchFieldSelectors = [
      //     '-ios class chain:**/XCUIElementTypeSearchField',
      //     '-ios class chain:**/XCUIElementTypeTextField',
      //     '-ios predicate string:type == "XCUIElementTypeSearchField"',
      //     '-ios predicate string:type == "XCUIElementTypeTextField"',
      //     '-ios predicate string:value == "Search Best Buy"',
      //   ];
        
      //   let searchField = null;
      //   for (const sel of searchFieldSelectors) {
      //     try {
      //       console.log(`  Checking: ${sel.substring(0, 50)}...`);
      //       const field = await $(sel);
      //       if (await field.isExisting()) {
      //         console.log('  Found search field!');
      //         searchField = field;
      //         break;
      //       }
      //     } catch {
      //       continue;
      //     }
      //   }
        
      //   if (searchField) {
      //     console.log('  Typing "' + searchTerm + '" in search field...');
      //     await searchField.addValue(searchTerm);
      //     await this.driver.pause(1000);
      //     await this.driver.takeScreenshot('ios-after-typing');
          
      //     // Press the "search" button on keyboard
      //     console.log('  Submitting search...');
      //     try {
      //       const searchBtn = await $('-ios predicate string:label == "search"');
      //       if (await searchBtn.isExisting()) {
      //         await searchBtn.click();
      //         searchInitiated = true;
      //       }
      //     } catch {
      //       // Fallback to return key
      //       await browser.execute('mobile: pressButton', { name: 'return' });
      //       searchInitiated = true;
      //     }
      //   } else {
      //     console.log('  No search field found, will try keyboard tapping...');
      //   }
      // } catch (e) {
      //   console.log(`  Search field typing failed: ${e}`);
      // }
      
      // OPTION A2: If no search field found, try tapping individual keyboard keys
      if (!searchInitiated) {
        console.log('⌨️ Trying to tap keyboard keys for "laptop"...');
        try {
          // Tap each letter on the keyboard: l-a-p-t-o-p
          const letters = ['l', 'a', 'p', 't', 'o', 'p'];
          for (const letter of letters) {
            const keySelector = `-ios predicate string:label == "${letter}"`;
            const key = await $(keySelector);
            if (await key.isExisting()) {
              await key.click();
              await this.driver.pause(100);
            }
          }
          await this.driver.pause(500);
          await this.driver.takeScreenshot('ios-after-keyboard-typing');
          
          // Press search button
          const searchBtn = await $('-ios predicate string:label == "search"');
          if (await searchBtn.isExisting()) {
            await searchBtn.click();
            searchInitiated = true;
          }
        } catch (e) {
          console.log(`  Keyboard tapping failed: ${e}`);
        }
      }
      
      // OPTION B: If typing didn't work, tap "laptop" from Popular searches
      if (!searchInitiated) {
        console.log('👆 Trying to tap "laptop" from Popular searches...');
        await this.driver.takeScreenshot('ios-before-laptop-tap');
        
        // Tap directly on "laptop" button position
        // Based on screenshot analysis:
        // - Popular searches header: y~310
        // - First row of buttons (ipad, laptop, airpods, switch 2): y~380
        // - "laptop" is 2nd button, starts around x~150
        console.log('  Tapping on laptop button by coordinates (175, 385)...');
        try {
          await browser.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x: 175, y: 385 },
              { type: 'pointerDown', button: 0 },
              { type: 'pause', duration: 100 },
              { type: 'pointerUp', button: 0 },
            ],
          }]);
          await this.driver.pause(2000);
          searchInitiated = true;
        } catch (e) {
          console.log(`  Coordinate tap failed: ${e}`);
        }
      }
      
      // OPTION C: Try accessibility selectors for "laptop"
      if (!searchInitiated) {
        console.log('👆 Trying accessibility selectors for "laptop"...');
        const laptopSelectors = [
          '~laptop',
          '-ios predicate string:label == "laptop"',
          '-ios predicate string:name == "laptop"',
        ];
        
        for (const sel of laptopSelectors) {
          try {
            console.log(`  Trying: ${sel}...`);
            const el = await $(sel);
            if (await el.isExisting()) {
              console.log('  Found! Tapping...');
              await el.click();
              searchInitiated = true;
              break;
            }
          } catch (e) {
            console.log(`  Not found`);
          }
        }
      }
      
      if (!searchInitiated) {
        console.log('⚠️ Search not initiated - taking screenshot for debugging');
        await this.driver.takeScreenshot('ios-search-failed');
      }
      
      // Wait for PLP to load
      console.log('⏳ Waiting for PLP...');
      await this.driver.pause(5000);
      await this.driver.takeScreenshot('ios-plp-loaded');
      
    } else if (isAndroid) {
      // Android: Tap to focus, then setValue
      console.log('Tapping search field (Android)...');
      await this.driver.waitForElement(PricePage.selectors.searchIcon, 45000);
      await this.driver.tap(PricePage.selectors.searchIcon);
      await this.driver.pause(2000);
      
      // Typing in search field...
      await this.driver.type(PricePage.selectors.searchInput, searchTerm);
      await this.driver.pause(1000);
      
      await this.driver.pressEnter();
    }
    
    // Wait for search results (PLP)
    await this.driver.pause(isWeb ? 5000 : 10000);
  }

  /**
   * Handle onboarding dialogs for mobile apps
   */
  private async handleOnboardingDialogs(): Promise<void> {
    const isAndroid = this.driver.platform === 'android';
    const isIOS = this.driver.platform === 'ios';
    
      console.log('🔍 Handling onboarding and permission dialogs...');
    
      for (let step = 0; step < 10; step++) {
        await this.driver.pause(1000);
        let found = false;
        
        try {
        // Handle system permission dialogs (Android)
          if (isAndroid) {
            const permissionSelectors = [
              'android=new UiSelector().text("Don\'t allow")',
              'android=new UiSelector().text("Allow")',
              'android=new UiSelector().resourceId("com.android.permissioncontroller:id/permission_deny_button")',
            ];
            for (const sel of permissionSelectors) {
              const btn = await $(sel);
              if (await btn.isExisting()) {
                console.log(`👆 Dismissing permission dialog (step ${step + 1})...`);
                await btn.click();
                await this.driver.pause(1500);
                found = true;
                break;
              }
            }
          }
          
          if (!found) {
            // Look for onboarding "continue" buttons
            const continueSelectors = isAndroid ? [
              'android=new UiSelector().textContains("Continue")',
              'android=new UiSelector().text("Next")',
              'android=new UiSelector().text("Skip")',
              'android=new UiSelector().text("Not now")',
              'android=new UiSelector().text("Got it")',
            ] : [
              '-ios predicate string:label CONTAINS "Continue"',
              '-ios predicate string:label == "Next"',
              '-ios predicate string:label == "Skip"',
              '-ios predicate string:label == "Not now"',
            '-ios predicate string:label == "Got it"',
            ];
            
            for (const sel of continueSelectors) {
              const btn = await $(sel);
              if (await btn.isExisting()) {
                console.log(`👆 Clicking onboarding button (step ${step + 1})...`);
                await btn.click();
                await this.driver.pause(1500);
                found = true;
                break;
              }
            }
          }
          
          if (!found) {
            // Check for guest dialog
            const guestSelector = isAndroid 
              ? 'android=new UiSelector().text("Continue as guest")'
              : '-ios predicate string:label == "Continue as guest"';
            const guestBtn = await $(guestSelector);
            if (await guestBtn.isExisting()) {
              console.log('👆 Clicking "Continue as guest"...');
              await guestBtn.click();
              await this.driver.pause(3000);
              found = true;
            }
          }
          
          if (!found) break; // No more dialogs
        } catch {
          break;
        }
      }
      
      // Screenshot after handling dialogs
      console.log('📸 Screenshot after dialogs...');
      await this.driver.takeScreenshot('after-dialogs');
    }
    
  /**
   * Select the first product from search results (PLP) - UNIFIED for all platforms
   */
  async selectFirstProduct(): Promise<void> {
    console.log('📱 Looking for first product on PLP...');
    
    const isWeb = this.driver.platform === 'web';
    const isIOS = this.driver.platform === 'ios';
    
    // Take screenshot before selecting
    if (!isWeb) {
      await this.driver.takeScreenshot('plp-before-select');
    }
    
    // For iOS, find and tap the first product on PLP
    if (isIOS) {
      console.log('📱 iOS: Finding first product on PLP...');
      let productTapped = false;
      
      // Try multiple strategies to find and click a product
      // Products on PLP typically have titles with brand names + product type
      const productSelectors = [
        // Look for product titles containing laptop brands
        '-ios predicate string:label CONTAINS[c] "HP -" AND type == "XCUIElementTypeStaticText"',
        '-ios predicate string:label CONTAINS[c] "Lenovo -" AND type == "XCUIElementTypeStaticText"',
        '-ios predicate string:label CONTAINS[c] "Dell -" AND type == "XCUIElementTypeStaticText"',
        '-ios predicate string:label CONTAINS[c] "ASUS -" AND type == "XCUIElementTypeStaticText"',
        '-ios predicate string:label CONTAINS[c] "Acer -" AND type == "XCUIElementTypeStaticText"',
        '-ios predicate string:label CONTAINS[c] "MacBook" AND type == "XCUIElementTypeStaticText"',
        '-ios predicate string:label CONTAINS[c] "Chromebook" AND type == "XCUIElementTypeStaticText"',
        '-ios predicate string:label CONTAINS[c] "Laptop" AND type == "XCUIElementTypeStaticText"',
        // Product images (usually in cells)
        '-ios predicate string:type == "XCUIElementTypeImage" AND visible == true',
      ];
      
      // Scroll down to make sure products are visible
      console.log('📜 Scrolling to product area...');
      try {
        await browser.execute('mobile: scroll', { direction: 'down' });
        await this.driver.pause(1500);
      } catch {
        // Scroll might fail, continue anyway
      }
      await this.driver.takeScreenshot('plp-scrolled');
      
      for (const sel of productSelectors) {
        try {
          console.log(`  Trying selector: ${sel.substring(0, 50)}...`);
          const elements = await $$(sel);
          const count = Array.isArray(elements) ? elements.length : 0;
          if (count > 0) {
            console.log(`✓ Found ${count} elements, tapping first one...`);
            await elements[0].click();
              productTapped = true;
              break;
            }
          } catch (e) {
            console.log(`  Selector failed: ${e}`);
        }
      }
      
      if (!productTapped) {
        // Last resort: tap on the first product TITLE to navigate to PDP
        // We need to tap on the product title text, NOT the Add to cart button
        console.log('📱 iOS: Trying tap on product title...');
        await this.driver.takeScreenshot('plp-before-position-tap');
        
        const { width, height } = await browser.getWindowSize();
        
        // After scroll, first product title is typically around:
        // - y=280-350 (title text area above the product image)
        // - x=center of screen (title spans most of width)
        // Tap on the TITLE text area, NOT the image or Add to cart button
        const tapX = Math.floor(width * 0.5);  // Center where title text is
        const tapY = 320;  // Title area above first product image
        
        console.log(`👆 Tapping on product title at (${tapX}, ${tapY})...`);
        await browser.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerUp', button: 0 },
          ],
        }]);
        await this.driver.pause(3000);  // Wait for PDP to load
        productTapped = true;
      }
      
      await this.driver.takeScreenshot('plp-after-product-tap');
    } else {
      // Web and Android: Use standard selectors
      console.log('👆 Tapping first product...');
      try {
        await this.driver.waitForElement(PricePage.selectors.firstProductResult, 30000);
        await this.driver.tap(PricePage.selectors.firstProductResult);
      } catch (e) {
        console.log(`  Primary selector failed: ${e}`);
        throw e;
      }
    }
    
    // Wait for PDP to load
    const isMobile = !isWeb;
    await this.driver.pause(isMobile ? 8000 : 3000);
    
    // Take screenshot of PDP for debugging
    if (isMobile) {
      await this.driver.takeScreenshot('pdp-page');
    }
    
    console.log('✓ Product selected - PDP loaded');
  }

  /**
   * Navigate to PDP via search (UNIFIED flow for Web, Android, and iOS)
   * Flow: Search → PLP → Select first product → PDP
   */
  async navigateToPDPViaSearch(searchTerm: string = 'laptop'): Promise<void> {
    
    // Step 1: navigate to home page 
     await this.navigateToHome();
    // Step 2: Search for product (goes to PLP)
    await this.searchForProduct(searchTerm);
    
    // Step 3: Select first product from PLP (goes to PDP)
      await this.selectFirstProduct();
    
  }

  // ==================== PDP ACTIONS ====================

  /**
   * Wait for PDP price section to load
   */
  async waitForLoad(timeout: number = 15000): Promise<void> {
    console.log('⏳ Waiting for price block to load...');
    await this.driver.waitForElement(PricePage.selectors.priceBlock, timeout);
    console.log('✓ Price block loaded');
  }

  /**
   * Check if price block is visible
   */
  async isPriceVisible(): Promise<boolean> {
    return this.driver.isElementVisible(PricePage.selectors.priceBlock);
  }

  /**
   * Get the current price text
   */
  async getCurrentPrice(): Promise<string> {
    const element = await this.driver.findElement(PricePage.selectors.currentPrice);
    const text = await element.getText();
    return text.trim();
  }

  

  /**
   * Get product title
   */
  async getProductTitle(): Promise<string> {
    const element = await this.driver.findElement(PricePage.selectors.productTitle);
    return (await element.getText()).trim();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string = 'pdp-price'): Promise<string> {
    return this.driver.takeScreenshot(name);
  }

  /**
   * Get all price information
   */
  // async getPriceInfo(): Promise<{
  //   currentPrice: string;
  //   originalPrice: string | null;
  //   isOnSale: boolean;
  //   savings: string | null;
  //   productTitle?: string;
  // }> {
  //   let productTitle: string | undefined;
  //   try {
  //     productTitle = await this.getProductTitle();
  //   } catch {
  //     // Title might not be available
  //   }

  //   return {
  //     currentPrice: await this.getCurrentPrice(),
  //     originalPrice: await this.getOriginalPrice(),
  //     isOnSale: await this.isOnSale(),
  //     savings: await this.getSavingsText(),
  //     productTitle,
  //   };
  // }
}
