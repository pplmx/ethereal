# Playwright Testing Patterns and Best Practices

This guide covers Playwright-specific patterns and best practices for testing the Desktop Ethereal application.

## Core Playwright Concepts

### Page Objects

Use the Page Object Model (POM) to create maintainable tests:

```typescript
// tests/e2e/page-objects/EtherealApp.ts
import { Page, Locator } from '@playwright/test';

export class EtherealApp {
  private readonly window: Locator;
  private readonly statusDisplay: Locator;
  private readonly enableButton: Locator;
  private readonly disableButton: Locator;

  constructor(private page: Page) {
    this.window = page.locator('[data-testid="ethereal-window"]');
    this.statusDisplay = page.locator('[data-testid="status-display"]');
    this.enableButton = page.locator('[data-testid="enable-click-through"]');
    this.disableButton = page.locator('[data-testid="disable-click-through"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.window.waitFor({ state: 'visible' });
  }

  async toggleClickThrough() {
    if (await this.enableButton.isVisible()) {
      await this.enableButton.click();
    } else {
      await this.disableButton.click();
    }
  }

  async isClickThroughEnabled() {
    return await this.disableButton.isVisible();
  }

  async getStatus() {
    return await this.statusDisplay.textContent();
  }

  async dragWindow(offsetX: number, offsetY: number) {
    await this.window.dragTo(this.window, {
      targetPosition: { x: offsetX, y: offsetY }
    });
  }

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
}

// In test file
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../page-objects/EtherealApp';

test('should toggle click-through mode', async ({ page }) => {
  const app = new EtherealApp(page);
  await app.goto();

  // Verify initial state
  expect(await app.isClickThroughEnabled()).toBeFalsy();

  // Toggle click-through
  await app.toggleClickThrough();

  // Verify state changed
  expect(await app.isClickThroughEnabled()).toBeTruthy();

  // Toggle back
  await app.toggleClickThrough();

  // Verify state restored
  expect(await app.isClickThroughEnabled()).toBeFalsy();
});
```

### Custom Locators

Create custom locators for complex UI elements:

```typescript
// tests/e2e/utils/locators.ts
import { Page, Locator } from '@playwright/test';

export class CustomLocators {
  static etherealSprite(page: Page): Locator {
    return page.locator('[data-testid="ethereal-sprite"]');
  }

  static statusIndicator(page: Page, state: string): Locator {
    return page.locator(`[data-testid="status-indicator"][data-state="${state}"]`);
  }

  static animationFrame(page: Page, frameIndex: number): Locator {
    return page.locator(`[data-testid="sprite-frame-${frameIndex}"]`);
  }

  static hotkeyButton(page: Page, key: string): Locator {
    return page.locator(`[data-testid="hotkey-${key}"]`);
  }
}

// In test file
import { CustomLocators } from '../utils/locators';

test('should display correct sprite for each state', async ({ page }) => {
  const sprite = CustomLocators.etherealSprite(page);

  // Test IDLE state sprite
  await expect(sprite).toHaveAttribute('src', /idle/);

  // Simulate CODING state
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('window-update', {
      detail: { category: 'CODING' }
    }));
  });

  // Test CODING state sprite
  await expect(sprite).toHaveAttribute('src', /typing/);
});
```

## Advanced Playwright Techniques

### Waiting Strategies

Use appropriate waiting strategies for reliable tests:

```typescript
test('should respond to system events with proper timing', async ({ page }) => {
  // Wait for initial load
  await page.waitForSelector('[data-testid="ethereal-window"]');

  // Wait for specific state
  await page.waitForFunction(() => {
    const status = document.querySelector('[data-testid="status-display"]');
    return status?.textContent?.includes('IDLE') ?? false;
  });

  // Wait for animation to complete
  await page.waitForTimeout(1000); // Wait for animation

  // Wait for network requests (if applicable)
  await page.waitForLoadState('networkidle');

  // Wait for custom condition
  await page.waitForFunction(() => {
    const sprite = document.querySelector('[data-testid="ethereal-sprite"]');
    return sprite !== null && sprite.getAttribute('src') !== '';
  });
});
```

### Mocking and Stubbing

Mock external dependencies and browser APIs:

```typescript
test('should handle clipboard monitoring', async ({ page }) => {
  // Mock clipboard API
  await page.addInitScript(() => {
    (navigator as any).clipboard = {
      readText: async () => 'Mock clipboard content',
      writeText: async (text: string) => {
        console.log('Clipboard write:', text);
      }
    };
  });

  // Test clipboard functionality
  await page.evaluate(() => {
    navigator.clipboard.writeText('Test content');
  });

  // Verify clipboard event was processed
  await page.waitForSelector('[data-testid="clipboard-processed"]');
});

test('should handle network failures gracefully', async ({ page }) => {
  // Mock network failure
  await page.route('**/api/**', route => {
    route.abort('failed');
  });

  // Test LLM chat functionality
  const chatInput = page.locator('[data-testid="chat-input"]');
  const chatButton = page.locator('[data-testid="chat-send"]');

  await chatInput.fill('Hello Ethereal');
  await chatButton.click();

  // Verify error handling
  await expect(page.locator('[data-testid="chat-error"]')).toBeVisible();
});
```

### Parallel Testing

Configure parallel test execution:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Run tests in parallel
  workers: process.env.CI ? 1 : undefined,

  // Retry failed tests
  retries: process.env.CI ? 2 : 0,

  // Use multiple projects for different configurations
  projects: [
    {
      name: 'chromium',
      use: {
        channel: 'chrome',
        viewport: { width: 300, height: 300 } // Match Ethereal window size
      },
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        viewport: { width: 300, height: 300 }
      },
    },
  ],

  // Configure test timeouts
  timeout: 30000,
  expect: {
    timeout: 5000
  },
});
```

## Desktop Application Specific Patterns

### Window Management Testing

Test desktop-specific window behaviors:

```typescript
test('should maintain always-on-top behavior', async ({ page, context }) => {
  // Create a second window to test z-order
  const secondPage = await context.newPage();
  await secondPage.goto('about:blank');

  // Bring second window to front
  await secondPage.bringToFront();

  // Verify Ethereal window is still visible (always-on-top)
  await expect(page.locator('[data-testid="ethereal-window"]')).toBeVisible();

  await secondPage.close();
});

test('should handle window focus events', async ({ page }) => {
  // Test that window responds to focus/blur events
  await page.evaluate(() => {
    window.dispatchEvent(new Event('blur'));
  });

  // Verify behavior on blur
  await expect(page.locator('[data-testid="window-blurred"]')).toBeVisible();

  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'));
  });

  // Verify behavior on focus
  await expect(page.locator('[data-testid="window-focused"]')).toBeVisible();
});
```

### Transparency and Overlay Testing

Test transparent window properties:

```typescript
test('should render with proper transparency', async ({ page }) => {
  // This is a simplified example - actual transparency testing
  // would require more complex setup

  const window = page.locator('[data-testid="ethereal-window"]');

  // Verify window has transparent background
  const backgroundColor = await window.evaluate(el => {
    return window.getComputedStyle(el).backgroundColor;
  });

  // Check for rgba with alpha < 1 (transparent)
  expect(backgroundColor).toMatch(/rgba\(.*,\s*[\d.]+\)\/);
  expect(backgroundColor).not.toContain('rgb(0, 0, 0)'); // Not opaque black
});
```

### System Event Simulation

Simulate system-level events:

```typescript
test('should respond to system DPI changes', async ({ page }) {
  // Simulate DPI change
  await page.addInitScript(() => {
    Object.defineProperty(window, 'devicePixelRatio', {
      value: 2,
      writable: true
    });
  });

  // Trigger resize event to simulate DPI change
  await page.setViewportSize({ width: 600, height: 600 });

  // Verify application adapts to new DPI
  const window = page.locator('[data-testid="ethereal-window"]');
  const size = await window.boundingBox();
  expect(size?.width).toBe(300); // Should maintain logical size
});

test('should handle system color scheme changes', async ({ page }) => {
  // Test dark mode
  await page.emulateMedia({ colorScheme: 'dark' });

  // Verify UI adapts to dark mode
  const window = page.locator('[data-testid="ethereal-window"]');
  const backgroundColor = await window.evaluate(el => {
    return window.getComputedStyle(el).backgroundColor;
  });

  // Check for dark mode colors
  expect(backgroundColor).toContain('rgb(0, 0, 0)'); // Dark background

  // Test light mode
  await page.emulateMedia({ colorScheme: 'light' });

  // Verify UI adapts to light mode
  const lightBackgroundColor = await window.evaluate(el => {
    return window.getComputedStyle(el).backgroundColor;
  });

  // Check for light mode colors
  expect(lightBackgroundColor).toContain('rgb(255, 255, 255)'); // Light background
});
```

## Performance Testing Patterns

### Measuring Render Performance

Measure UI performance:

```typescript
test('should render animations smoothly', async ({ page }) => {
  // Measure animation performance
  const metrics = await page.evaluate(() => {
    const start = performance.now();

    // Trigger animation
    document.dispatchEvent(new CustomEvent('window-update', {
      detail: { category: 'CODING' }
    }));

    // Wait for animation to complete
    return new Promise(resolve => {
      setTimeout(() => {
        const end = performance.now();
        resolve({ duration: end - start });
      }, 1000); // Animation duration
    });
  });

  // Verify performance meets requirements
  expect((metrics as any).duration).toBeLessThan(100); // Less than 100ms
});

test('should maintain responsive UI during system monitoring', async ({ page }) => {
  // Simulate continuous system monitoring
  const startTime = Date.now();

  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('gpu-update', {
        detail: { temperature: 75, utilization: 50 }
      }));
    });

    // Verify UI remains responsive
    await expect(page.locator('[data-testid="status-display"]')).toBeVisible();

    // Small delay between events
    await page.waitForTimeout(100);
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // Verify total time is reasonable
  expect(totalTime).toBeLessThan(2000); // Less than 2 seconds
});
```

## Best Practices for Playwright Testing

1. **Use data-testid attributes** for reliable element selection
2. **Avoid CSS selectors** that are likely to change
3. **Use proper waits** instead of hardcoded timeouts
4. **Create reusable page objects** for common UI elements
5. **Test user workflows** rather than individual components
6. **Use fixtures** for consistent test data
7. **Take advantage of Playwright's tracing** for debugging
8. **Run tests in headless mode** for CI environments
9. **Use parallel execution** to speed up test runs
10. **Test on multiple browsers** if cross-browser support is needed
11. **Mock external dependencies** to ensure consistent tests
12. **Verify both success and error conditions**

## Common Patterns for Desktop Applications

1. **Window lifecycle testing** (open, close, minimize, restore)
2. **System integration testing** (responding to system events)
3. **Input method testing** (keyboard, mouse, touch, hotkeys)
4. **Performance testing** (resource usage, responsiveness)
5. **Accessibility testing** (screen readers, keyboard navigation)
6. **Multi-monitor testing** (window positioning, display scaling)
7. **Security testing** (permissions, data protection)
8. **Localization testing** (different languages, regional settings)
