# Test Organization and Structure

This guide covers best practices for organizing and structuring end-to-end tests for the Desktop Ethereal application.

## Directory Structure

Organize tests in a logical, maintainable structure:

```
tests/e2e/
├── page-objects/           # Page object models
│   ├── EtherealApp.ts         # Main application page object
│   ├── SpriteComponent.ts  # Sprite component page object
│   └── ControlPanel.ts     # Control panel page object
├── fixtures/               # Test data and fixtures
│   ├── gpu-events.ts       # GPU event test data
│   ├── window-activities.ts # Window activity test data
│   └── test-images.ts      # Test sprite images
├── utils/                  # Utility functions and helpers
│   ├── assertions.ts       # Custom assertions
│   ├── locators.ts         # Custom locator functions
│   └── test-helpers.ts     # General test helpers
├── system/                 # System integration tests
│   ├── gpu-monitoring.spec.ts
│   ├── window-management.spec.ts
│   ├── activity-detection.spec.ts
│   ├── clipboard-monitoring.spec.ts
│   └── llm-integration.spec.ts
├── ui/                     # UI interaction tests
│   ├── sprite-animations.spec.ts
│   ├── control-buttons.spec.ts
│   ├── window-dragging.spec.ts
│   ├── status-display.spec.ts
│   └── keyboard-interactions.spec.ts
├── workflows/              # User workflow tests
│   ├── basic-usage.spec.ts
│   ├── coding-session.spec.ts
│   ├── gaming-session.spec.ts
│   └── system-monitoring.spec.ts
└── setup/                  # Test setup and configuration
    ├── test-setup.ts
    └── test-teardown.ts
```

## Page Object Model Implementation

### Main Application Page Object

```typescript
// tests/e2e/page-objects/EtherealApp.ts
import { Page, Locator } from '@playwright/test';
import { SpriteComponent } from './SpriteComponent';
import { ControlPanel } from './ControlPanel';

export class EtherealApp {
  private readonly window: Locator;
  private readonly statusDisplay: Locator;
  private readonly sprite: SpriteComponent;
  private readonly controlPanel: ControlPanel;

  constructor(private page: Page) {
    this.window = page.locator('[data-testid="ethereal-window"]');
    this.statusDisplay = page.locator('[data-testid="status-display"]');
    this.sprite = new SpriteComponent(page);
    this.controlPanel = new ControlPanel(page);
  }

  // Navigation
  async goto() {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.window.waitFor({ state: 'visible' });
    await this.sprite.waitForLoad();
  }

  // State Management
  async getStatus() {
    return await this.statusDisplay.textContent();
  }

  async isClickThroughEnabled() {
    return await this.controlPanel.isClickThroughEnabled();
  }

  // Interactions
  async toggleClickThrough() {
    await this.controlPanel.toggleClickThrough();
  }

  async dragWindow(offsetX: number, offsetY: number) {
    await this.window.dragTo(this.window, {
      targetPosition: { x: offsetX, y: offsetY }
    });
  }

  // System Events
  async simulateGpuEvent(temperature: number, utilization: number) {
    await this.page.evaluate(({ temp, util }) => {
      window.dispatchEvent(new CustomEvent('gpu-update', {
        detail: { temperature: temp, utilization: util }
      }));
    }, { temp: temperature, util: utilization });
  }

  async simulateWindowEvent(category: string, title: string) {
    await this.page.evaluate(({ cat, tit }) => {
      window.dispatchEvent(new CustomEvent('window-update', {
        detail: { category: cat, title: tit }
      }));
    }, { cat: category, tit: title });
  }

  async simulateClipboardEvent(content: string) {
    await this.page.evaluate((content) => {
      window.dispatchEvent(new CustomEvent('clipboard-changed', {
        detail: content
      }));
    }, content);
  }

  // Components
  getSprite() {
    return this.sprite;
  }

  getControlPanel() {
    return this.controlPanel;
  }
}
```

### Component Page Objects

```typescript
// tests/e2e/page-objects/SpriteComponent.ts
import { Page, Locator } from '@playwright/test';

export class SpriteComponent {
  private readonly sprite: Locator;
  private readonly container: Locator;

  constructor(private page: Page) {
    this.container = page.locator('[data-testid="sprite-container"]');
    this.sprite = page.locator('[data-testid="ethereal-sprite"]');
  }

  async waitForLoad() {
    await this.sprite.waitFor({ state: 'visible' });
  }

  async isVisible() {
    return await this.sprite.isVisible();
  }

  async getCurrentFrame() {
    return await this.sprite.getAttribute('src');
  }

  async waitForFrameChange() {
    const initialFrame = await this.getCurrentFrame();
    await this.page.waitForFunction((initial) => {
      const current = document.querySelector('[data-testid="ethereal-sprite"]')?.getAttribute('src');
      return current !== initial;
    }, initialFrame);

    return await this.getCurrentFrame();
  }

  async getAnimationState() {
    const src = await this.getCurrentFrame();
    if (src?.includes('idle')) return 'IDLE';
    if (src?.includes('typing')) return 'CODING';
    if (src?.includes('gaming')) return 'GAMING';
    if (src?.includes('overheat')) return 'OVERHEATING';
    return 'UNKNOWN';
  }
}

// tests/e2e/page-objects/ControlPanel.ts
import { Page, Locator } from '@playwright/test';

export class ControlPanel {
  private readonly enableButton: Locator;
  private readonly disableButton: Locator;
  private readonly countButton: Locator;

  constructor(private page: Page) {
    this.enableButton = page.locator('[data-testid="enable-click-through"]');
    this.disableButton = page.locator('[data-testid="disable-click-through"]');
    this.countButton = page.locator('[data-testid="count-button"]');
  }

  async isClickThroughEnabled() {
    return await this.disableButton.isVisible();
  }

  async toggleClickThrough() {
    if (await this.isClickThroughEnabled()) {
      await this.disableButton.click();
    } else {
      await this.enableButton.click();
    }
  }

  async clickCountButton() {
    await this.countButton.click();
  }

  async getCount() {
    const text = await this.countButton.textContent();
    const match = text?.match(/Count: (\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
```

## Test Data Fixtures

### System Event Fixtures

```typescript
// tests/e2e/fixtures/gpu-events.ts
export interface GpuEvent {
  temperature: number;
  utilization: number;
}

export const gpuEvents = {
  normal: { temperature: 65, utilization: 30 } as GpuEvent,
  warm: { temperature: 75, utilization: 50 } as GpuEvent,
  hot: { temperature: 85, utilization: 75 } as GpuEvent,
  critical: { temperature: 95, utilization: 90 } as GpuEvent,
  cooling: { temperature: 70, utilization: 25 } as GpuEvent
};

export const gpuEventScenarios = {
  gradualHeatUp: [
    gpuEvents.normal,
    gpuEvents.warm,
    gpuEvents.hot,
    gpuEvents.critical
  ],
  coolDown: [
    gpuEvents.critical,
    gpuEvents.hot,
    gpuEvents.warm,
    gpuEvents.normal
  ],
  fluctuating: [
    gpuEvents.normal,
    gpuEvents.hot,
    gpuEvents.normal,
    gpuEvents.warm,
    gpuEvents.hot,
    gpuEvents.cooling
  ]
};

// tests/e2e/fixtures/window-activities.ts
export interface WindowActivity {
  category: string;
  title: string;
}

export const windowActivities = {
  coding: { category: 'CODING', title: 'VS Code - main.ts' } as WindowActivity,
  gaming: { category: 'GAMING', title: 'Steam - Cyberpunk 2077' } as WindowActivity,
  browsing: { category: 'BROWSING', title: 'Chrome - Google Search' } as WindowActivity,
  other: { category: 'OTHER', title: 'Desktop' } as WindowActivity
};

export const activitySequences = {
  codingSession: [
    windowActivities.other,
    windowActivities.coding,
    windowActivities.coding,
    windowActivities.other
  ],
  gamingSession: [
    windowActivities.other,
    windowActivities.gaming,
    windowActivities.gaming,
    windowActivities.other
  ]
};

// tests/e2e/fixtures/clipboard-content.ts
export const clipboardContents = {
  short: 'Hi',
  moderate: 'This is a moderate length clipboard content for testing.',
  long: 'A'.repeat(1500),
  codeSnippet: 'fn main() { println!("Hello, world!"); }',
  url: 'https://github.com/example/project',
  articleTitle: 'Understanding Rust Ownership and Borrowing'
};

export const clipboardScenarios = {
  validContent: [
    clipboardContents.moderate,
    clipboardContents.codeSnippet,
    clipboardContents.url
  ],
  invalidContent: [
    clipboardContents.short,
    clipboardContents.long
  ]
};
```

## Utility Functions

### Custom Assertions

```typescript
// tests/e2e/utils/assertions.ts
import { expect, Page } from '@playwright/test';

export async function expectEtherealState(page: Page, expectedState: string) {
  const statusDisplay = page.locator('[data-testid="status-display"]');
  await expect(statusDisplay).toContainText(expectedState);
}

export async function expectAnimationState(page: Page, expectedState: string) {
  const sprite = page.locator('[data-testid="ethereal-sprite"]');
  const src = await sprite.getAttribute('src');

  switch (expectedState) {
    case 'IDLE':
      expect(src).toMatch(/idle/);
      break;
    case 'CODING':
      expect(src).toMatch(/typing/);
      break;
    case 'GAMING':
      expect(src).toMatch(/gaming/);
      break;
    case 'OVERHEATING':
      expect(src).toMatch(/overheat/);
      break;
    default:
      throw new Error(`Unknown animation state: ${expectedState}`);
  }
}

export async function expectWindowState(page: Page, expectedState: 'normal' | 'click-through') {
  const enableButton = page.locator('[data-testid="enable-click-through"]');
  const disableButton = page.locator('[data-testid="disable-click-through"]');

  if (expectedState === 'click-through') {
    await expect(disableButton).toBeVisible();
    await expect(enableButton).not.toBeVisible();
  } else {
    await expect(enableButton).toBeVisible();
    await expect(disableButton).not.toBeVisible();
  }
}

export async function expectWindowPositionChanged(
  page: Page,
  initialX: number,
  initialY: number,
  tolerance: number = 5
) {
  const windowElement = page.locator('[data-testid="ethereal-window"]');
  const box = await windowElement.boundingBox();

  expect(box?.x).not.toBeCloseTo(initialX, -Math.log10(tolerance));
  expect(box?.y).not.toBeCloseTo(initialY, -Math.log10(tolerance));
}
```

### Locator Helpers

```typescript
// tests/e2e/utils/locators.ts
import { Page, Locator } from '@playwright/test';

export class CustomLocators {
  static etherealWindow(page: Page): Locator {
    return page.locator('[data-testid="ethereal-window"]');
  }

  static statusDisplay(page: Page): Locator {
    return page.locator('[data-testid="status-display"]');
  }

  static etherealSprite(page: Page): Locator {
    return page.locator('[data-testid="ethereal-sprite"]');
  }

  static enableClickThroughButton(page: Page): Locator {
    return page.locator('[data-testid="enable-click-through"]');
  }

  static disableClickThroughButton(page: Page): Locator {
    return page.locator('[data-testid="disable-click-through"]');
  }

  static countButton(page: Page): Locator {
    return page.locator('[data-testid="count-button"]');
  }

  static hotkeyButton(page: Page, key: string): Locator {
    return page.locator(`[data-testid="hotkey-${key}"]`);
  }

  static statusIndicator(page: Page, state: string): Locator {
    return page.locator(`[data-testid="status-indicator"][data-state="${state}"]`);
  }

  static spriteFrame(page: Page, frameIndex: number): Locator {
    return page.locator(`[data-testid="sprite-frame-${frameIndex}"]`);
  }
}
```

## Test Configuration

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',

  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },

  // Retry settings
  retries: process.env.CI ? 2 : 0,

  // Parallelization
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }]
  ],

  // Use projects for different configurations
  projects: [
    {
      name: 'chromium',
      use: {
        channel: 'chrome',
        viewport: { width: 1920, height: 1080 }
      },
    },
  ],

  // Web server configuration for Tauri dev server
  webServer: {
    command: 'pnpm tauri dev',
    url: 'http://localhost:1420',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global setup and teardown
  globalSetup: require.resolve('./tests/e2e/setup/global-setup'),
  globalTeardown: require.resolve('./tests/e2e/setup/global-teardown'),
});
```

## Test Setup and Teardown

### Global Setup

```typescript
// tests/e2e/setup/global-setup.ts
import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Global setup logic
  console.log('Setting up test environment...');

  // Could include:
  // - Starting mock services
  // - Setting up test databases
  // - Configuring environment variables
  // - Preparing test data

  // For Desktop Ethereal, this might include:
  // - Ensuring Ollama is running (for LLM tests)
  // - Setting up test sprite images
  // - Configuring system monitoring mocks
}

export default globalSetup;
```

### Test File Setup

```typescript
// tests/e2e/setup/test-setup.ts
import { test as base } from '@playwright/test';
import { EtherealApp } from '../page-objects/EtherealApp';

// Extend base test with our fixtures
export const test = base.extend<{
  etherealApp: EtherealApp;
}>({
  etherealApp: async ({ page }, use) => {
    const app = new EtherealApp(page);
    await app.goto();
    await use(app);
  },
});

export { expect } from '@playwright/test';
```

## Test File Organization

### System Integration Tests

```typescript
// tests/e2e/system/gpu-monitoring.spec.ts
import { test, expect } from '../setup/test-setup';
import { gpuEvents } from '../fixtures/gpu-events';
import { expectEtherealState, expectAnimationState } from '../utils/assertions';

test.describe('GPU Monitoring Integration', () => {
  test('should transition to overheating state when temperature exceeds threshold', async ({ etherealApp }) => {
    // Arrange
    await expectEtherealState(etherealApp.page, 'IDLE');

    // Act
    await etherealApp.simulateGpuEvent(gpuEvents.hot.temperature, gpuEvents.hot.utilization);

    // Assert
    await expectEtherealState(etherealApp.page, 'OVERHEATING');
    await expectAnimationState(etherealApp.page, 'OVERHEATING');
  });

  test('should return to normal state when GPU cools down', async ({ etherealApp }) => {
    // Arrange
    await etherealApp.simulateGpuEvent(gpuEvents.hot.temperature, gpuEvents.hot.utilization);
    await expectEtherealState(etherealApp.page, 'OVERHEATING');

    // Act
    await etherealApp.simulateGpuEvent(gpuEvents.cooling.temperature, gpuEvents.cooling.utilization);

    // Assert
    await expectEtherealState(etherealApp.page, 'IDLE');
    await expectAnimationState(etherealApp.page, 'IDLE');
  });
});
```

### UI Interaction Tests

```typescript
// tests/e2e/ui/control-buttons.spec.ts
import { test, expect } from '../setup/test-setup';
import { expectWindowState } from '../utils/assertions';

test.describe('Control Button Interaction', () => {
  test('should toggle click-through mode via UI buttons', async ({ etherealApp }) => {
    // Arrange
    await expectWindowState(etherealApp.page, 'normal');

    // Act & Assert - Enable click-through
    await etherealApp.toggleClickThrough();
    await expectWindowState(etherealApp.page, 'click-through');

    // Act & Assert - Disable click-through
    await etherealApp.toggleClickThrough();
    await expectWindowState(etherealApp.page, 'normal');
  });

  test('should update count when count button is clicked', async ({ etherealApp }) => {
    // Arrange
    const initialCount = await etherealApp.getControlPanel().getCount();

    // Act
    await etherealApp.getControlPanel().clickCountButton();

    // Assert
    const newCount = await etherealApp.getControlPanel().getCount();
    expect(newCount).toBe(initialCount + 1);
  });
});
```

## Best Practices for Test Organization

1. **Use descriptive file and test names** that clearly indicate what is being tested
2. **Group related tests** in describe blocks with meaningful names
3. **Keep test files focused** on specific areas of functionality
4. **Use page objects** to encapsulate UI interaction logic
5. **Centralize test data** in fixture files
6. **Create reusable utilities** for common testing patterns
7. **Maintain consistent directory structure** across the test suite
8. **Use setup files** to configure test environments consistently
9. **Separate concerns** - system tests, UI tests, and workflow tests in different directories
10. **Document complex test logic** with comments explaining why certain approaches are used
11. **Use type safety** with TypeScript interfaces for test data
12. **Keep tests independent** - each test should be able to run in isolation
13. **Use meaningful test data names** that describe the scenario being tested
14. **Organize tests by complexity** - simple tests first, complex scenarios later
15. **Include negative test cases** to verify error handling
