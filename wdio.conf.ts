import type { Options } from '@wdio/types';
import path from 'path';

const platform = process.env.TEST_PLATFORM || 'android';

// App paths
const androidApp = path.join(__dirname, 'e2e/builds/android.apk');
const iosApp = path.join(__dirname, 'e2e/builds/Ios.app');

// Android capabilities
const androidCapabilities: WebdriverIO.Capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Pixel_6',  // Your emulator name
  'appium:app': androidApp,
  'appium:appPackage': '',
  'appium:appActivity': '',
  'appium:autoGrantPermissions': true,
  'appium:newCommandTimeout': 240,
  'appium:noReset': true,  // Keep app installed, faster startup
  'appium:appWaitForLaunch': true,
  'appium:appWaitDuration': 60000,  // Wait up to 60s for app to launch
};

// iOS capabilities
const iosCapabilities: WebdriverIO.Capabilities = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': 'iPhone 16 Plus',
  'appium:platformVersion': '18.6',
  'appium:app': iosApp,
  'appium:bundleId': '',
  'appium:autoAcceptAlerts': true,
  'appium:newCommandTimeout': 240,
  'appium:noReset': true,
  // Use prebuilt WDA - critical for Xcode 16+ compatibility
  'appium:usePrebuiltWDA': true,
  'appium:useNewWDA': false,
  'appium:wdaLaunchTimeout': 240000,
  'appium:wdaStartupRetries': 4,
  'appium:wdaLocalPort': 8100,
  // Disable code signing for simulator
  'appium:updatedWDABundleId': '',
  // Build settings to disable warnings-as-errors
  'appium:xcodeOrgId': '',
  'appium:xcodeSigningId': '',
};

export const config: Options.Testrunner = {
  //
  // ====================
  // Runner Configuration
  // ====================
  runner: 'local',
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: './tsconfig.json',
      transpileOnly: true,
    },
  },

  //
  // ==================
  // Specify Test Files
  // ==================
  specs: [
    './e2e/specs/**/*.spec.ts',   // Same spec file for all platforms!
  ],
  exclude: [],

  //
  // ============
  // Capabilities
  // ============
  maxInstances: 1,
  capabilities: [platform === 'ios' ? iosCapabilities : androidCapabilities],

  //
  // ===================
  // Test Configurations
  // ===================
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 30000,
  connectionRetryTimeout: 300000,  // 5 minutes for iOS simulator boot
  connectionRetryCount: 3,

  //
  // ===================
  // Appium Service
  // ===================
  services: [
    ['appium', {
      args: {
        allowInsecure: ['chromedriver_autodownload'],
      },
      command: 'appium',
    }],
  ],
  port: 4723,

  //
  // ====================
  // Framework & Reporter
  // ====================
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 300000, // 5 minutes for iOS
  },

  //
  // =====
  // Hooks
  // =====
  beforeSession: function (config, capabilities, specs) {
    console.log(`\n🚀 Starting ${platform.toUpperCase()} test session...`);
  },

  afterSession: function (config, capabilities, specs) {
    console.log(`\n✅ ${platform.toUpperCase()} test session completed.`);
  },

  onComplete: function (exitCode, config, capabilities, results) {
    console.log('\n📊 All tests completed!');
  },
};
