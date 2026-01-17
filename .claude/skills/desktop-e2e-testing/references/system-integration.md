# System Integration Testing Guide

This guide covers system integration testing patterns for the Desktop Ethereal application, focusing on testing interactions between the application and system-level components.

## Understanding System Integration in Desktop Ethereal

Desktop Ethereal integrates with several system components:

- **GPU Monitoring**: NVIDIA NVML for temperature and utilization
- **Window Management**: Windows API for click-through and positioning
- **Active Window Detection**: System APIs for monitoring user activity
- **Clipboard Monitoring**: System clipboard for contextual awareness
- **LLM Integration**: Local Ollama service for AI responses
- **Global Hotkeys**: System-wide keyboard shortcuts

## Testing GPU Monitoring Integration

### Simulating GPU Events

Test the application's response to GPU monitoring events:

```typescript
// tests/e2e/system/gpu-monitoring.spec.ts
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../../page-objects/EtherealApp';

test.describe('GPU Monitoring Integration', () => {
  let app: EtherealApp;

  test.beforeEach(async ({ page }) => {
    app = new EtherealApp(page);
    await app.goto();
  });

  test('should display normal state when GPU temperature is normal', async ({ page }) => {
    // Arrange
    await expect(app.getStatus()).toContain('IDLE');

    // Act
    await app.simulateGpuEvent(65, 30); // Normal temperature

    // Assert
    await expect(app.getStatus()).toContain('IDLE');
    // Verify normal animation is playing
    await expect(page.locator('[data-testid="ethereal-sprite"]')).toHaveAttribute('src', /idle/);
  });

  test('should enter overheating state when GPU temperature exceeds threshold', async ({ page }) => {
    // Arrange
    await expect(app.getStatus()).toContain('IDLE');

    // Act
    await app.simulateGpuEvent(85, 75); // Hot temperature

    // Assert
    await expect(app.getStatus()).toContain('OVERHEATING');
    await expect(app.getStatus()).toContain('85°C');
    // Verify overheating animation is playing
    await expect(page.locator('[data-testid="ethereal-sprite"]')).toHaveAttribute('src', /overheat/);
  });

  test('should return to normal state when GPU cools down', async ({ page }) => {
    // Arrange
    await app.simulateGpuEvent(85, 75); // Hot temperature
    await expect(app.getStatus()).toContain('OVERHEATING');

    // Act
    await app.simulateGpuEvent(70, 30); // Cool temperature

    // Assert
    await expect(app.getStatus()).toContain('IDLE');
    await expect(app.getStatus()).toContain('70°C');
    // Verify normal animation is playing
    await expect(page.locator('[data-testid="ethereal-sprite"]')).toHaveAttribute('src', /idle/);
  });

  test('should handle rapid temperature fluctuations', async ({ page }) => {
    // Arrange
    const statusDisplay = page.locator('[data-testid="status-display"]');

    // Act & Assert - Rapid fluctuations
    await app.simulateGpuEvent(65, 20);
    await expect(statusDisplay).toContainText('IDLE');

    await app.simulateGpuEvent(85, 75);
    await expect(statusDisplay).toContainText('OVERHEATING');

    await app.simulateGpuEvent(60, 15);
    await expect(statusDisplay).toContainText('IDLE');

    await app.simulateGpuEvent(90, 85);
    await expect(statusDisplay).toContainText('OVERHEATING');
  });
});
```

## Testing Window Management Integration

### Click-Through Functionality

Test window management features:

```typescript
// tests/e2e/system/window-management.spec.ts
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../../page-objects/EtherealApp';

test.describe('Window Management Integration', () => {
  let app: EtherealApp;

  test.beforeEach(async ({ page }) => {
    app = new EtherealApp(page);
    await app.goto();
  });

  test('should toggle click-through mode via UI buttons', async ({ page }) => {
    // Arrange
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    // Act - Enable click-through
    await app.toggleClickThrough();

    // Assert
    await expect(app.isClickThroughEnabled()).toBeTruthy();

    // Act - Disable click-through
    await app.toggleClickThrough();

    // Assert
    await expect(app.isClickThroughEnabled()).toBeFalsy();
  });

  test('should toggle click-through mode via global hotkey', async ({ page }) => {
    // Arrange
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    // Act - Press global hotkey (Ctrl+Shift+D)
    await page.keyboard.press('Control+Shift+D');

    // Small delay for hotkey processing
    await page.waitForTimeout(100);

    // Assert
    await expect(app.isClickThroughEnabled()).toBeTruthy();

    // Act - Press hotkey again
    await page.keyboard.press('Control+Shift+D');

    // Assert
    await expect(app.isClickThroughEnabled()).toBeFalsy();
  });

  test('should allow window dragging when not in click-through mode', async ({ page }) => {
    // Arrange
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    // Get initial position
    const windowElement = page.locator('[data-testid="ethereal-window"]');
    const initialBox = await windowElement.boundingBox();

    // Act
    await app.dragWindow(50, 50);

    // Assert - Verify window moved
    const newBox = await windowElement.boundingBox();
    expect(newBox?.x).toBeGreaterThan(initialBox?.x || 0);
    expect(newBox?.y).toBeGreaterThan(initialBox?.y || 0);
  });

  test('should prevent window dragging when in click-through mode', async ({ page }) => {
    // Arrange
    await app.toggleClickThrough();
    await expect(app.isClickThroughEnabled()).toBeTruthy();

    // Get initial position
    const windowElement = page.locator('[data-testid="ethereal-window"]');
    const initialBox = await windowElement.boundingBox();

    // Act
    await app.dragWindow(50, 50);

    // Assert - Verify window did not move
    const newBox = await windowElement.boundingBox();
    expect(newBox?.x).toBeCloseTo(initialBox?.x || 0, 0);
    expect(newBox?.y).toBeCloseTo(initialBox?.y || 0, 0);
  });
});
```

## Testing Active Window Detection Integration

### Activity-Based State Changes

Test application response to system activity:

```typescript
// tests/e2e/system/activity-detection.spec.ts
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../../page-objects/EtherealApp';

test.describe('Activity Detection Integration', () => {
  let app: EtherealApp;

  test.beforeEach(async ({ page }) => {
    app = new EtherealApp(page);
    await app.goto();
  });

  test('should enter coding state when coding applications are active', async ({ page }) => {
    // Arrange
    await expect(app.getStatus()).toContain('IDLE');

    // Act
    await app.simulateWindowEvent('CODING', 'VS Code - main.ts');

    // Assert
    await expect(app.getStatus()).toContain('CODING');
    // Verify coding animation is playing
    await expect(page.locator('[data-testid="ethereal-sprite"]')).toHaveAttribute('src', /typing/);
  });

  test('should enter gaming state when games are active', async ({ page }) => {
    // Arrange
    await expect(app.getStatus()).toContain('IDLE');

    // Act
    await app.simulateWindowEvent('GAMING', 'Steam - Cyberpunk 2077');

    // Assert
    await expect(app.getStatus()).toContain('GAMING');
    // Verify gaming animation is playing
    await expect(page.locator('[data-testid="ethereal-sprite"]')).toHaveAttribute('src', /gaming/);
  });

  test('should enter browsing state when browsers are active', async ({ page }) => {
    // Arrange
    await expect(app.getStatus()).toContain('IDLE');

    // Act
    await app.simulateWindowEvent('BROWSING', 'Chrome - Google Search');

    // Assert
    await expect(app.getStatus()).toContain('BROWSING');
  });

  test('should return to idle state when activity stops', async ({ page }) => {
    // Arrange
    await app.simulateWindowEvent('CODING', 'VS Code - main.ts');
    await expect(app.getStatus()).toContain('CODING');

    // Act
    await app.simulateWindowEvent('OTHER', 'Desktop');

    // Assert
    await expect(app.getStatus()).toContain('IDLE');
    // Verify idle animation is playing
    await expect(page.locator('[data-testid="ethereal-sprite"]')).toHaveAttribute('src', /idle/);
  });

  test('should prioritize overheating state over activity states', async ({ page }) => {
    // Arrange
    await app.simulateWindowEvent('GAMING', 'Steam - Game.exe');
    await expect(app.getStatus()).toContain('GAMING');

    // Act - GPU overheats while gaming
    await app.simulateGpuEvent(85, 90);

    // Assert - Overheating should take priority
    await expect(app.getStatus()).toContain('OVERHEATING');
    // Verify overheating animation overrides gaming animation
    await expect(page.locator('[data-testid="ethereal-sprite"]')).toHaveAttribute('src', /overheat/);

    // Act - GPU cools down
    await app.simulateGpuEvent(70, 30);

    // Assert - Should return to gaming state
    await expect(app.getStatus()).toContain('GAMING');
    await expect(page.locator('[data-testid="ethereal-sprite"]')).toHaveAttribute('src', /gaming/);
  });
});
```

## Testing Clipboard Monitoring Integration

### Contextual Awareness

Test clipboard-based interactions:

```typescript
// tests/e2e/system/clipboard-monitoring.spec.ts
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../../page-objects/EtherealApp';

test.describe('Clipboard Monitoring Integration', () => {
  let app: EtherealApp;

  test.beforeEach(async ({ page }) => {
    app = new EtherealApp(page);
    await app.goto();
  });

  test('should ignore very short clipboard content', async ({ page }) => {
    // Arrange
    const shortContent = 'Hi';

    // Act
    await page.evaluate((content) => {
      window.dispatchEvent(new CustomEvent('clipboard-changed', {
        detail: content
      }));
    }, shortContent);

    // Assert - Should not change state for short content
    await expect(app.getStatus()).toContain('IDLE');
  });

  test('should ignore very long clipboard content', async ({ page }) => {
    // Arrange
    const longContent = 'A'.repeat(1500); // 1500 characters

    // Act
    await page.evaluate((content) => {
      window.dispatchEvent(new CustomEvent('clipboard-changed', {
        detail: content
      }));
    }, longContent);

    // Assert - Should not change state for long content
    await expect(app.getStatus()).toContain('IDLE');
  });

  test('should process moderate clipboard content', async ({ page }) => {
    // Arrange
    const moderateContent = 'This is a moderate length clipboard content that should be processed.';

    // Act
    await page.evaluate((content) => {
      window.dispatchEvent(new CustomEvent('clipboard-changed', {
        detail: content
      }));
    }, moderateContent);

    // Assert - Application should acknowledge clipboard content
    // (Implementation dependent - might show notification or change state)
    // This is a placeholder assertion
    await expect(page.locator('[data-testid="ethereal-window"]')).toBeVisible();
  });

  test('should handle rapid clipboard changes', async ({ page }) => {
    // Arrange
    const contents = [
      'First clipboard content',
      'Second clipboard content',
      'Third clipboard content'
    ];

    // Act & Assert - Rapid changes
    for (const content of contents) {
      await page.evaluate((text) => {
        window.dispatchEvent(new CustomEvent('clipboard-changed', {
          detail: text
        }));
      }, content);

      // Small delay between changes
      await page.waitForTimeout(50);

      // Verify application remains stable
      await expect(page.locator('[data-testid="ethereal-window"]')).toBeVisible();
    }
  });
});
```

## Testing LLM Integration

### AI Response Handling

Test integration with local LLM service:

```typescript
// tests/e2e/system/llm-integration.spec.ts
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../../page-objects/EtherealApp';

test.describe('LLM Integration', () => {
  let app: EtherealApp;

  test.beforeEach(async ({ page }) => {
    app = new EtherealApp(page);
    await app.goto();
  });

  test('should handle successful LLM response', async ({ page }) => {
    // Arrange
    const chatInput = page.locator('[data-testid="chat-input"]');
    const chatButton = page.locator('[data-testid="chat-send"]');
    const chatResponse = page.locator('[data-testid="chat-response"]');

    // Mock successful LLM response
    await page.route('**/api/generate', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: 'This is a mock response from the ethereal!'
        })
      });
    });

    // Act
    await chatInput.fill('Hello ethereal!');
    await chatButton.click();

    // Assert
    await expect(chatResponse).toBeVisible();
    await expect(chatResponse).toContainText('mock response from the ethereal');
  });

  test('should handle LLM service unavailable', async ({ page }) => {
    // Arrange
    const chatInput = page.locator('[data-testid="chat-input"]');
    const chatButton = page.locator('[data-testid="chat-send"]');
    const chatError = page.locator('[data-testid="chat-error"]');

    // Mock service unavailable
    await page.route('**/api/generate', route => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Service unavailable'
        })
      });
    });

    // Act
    await chatInput.fill('Hello ethereal!');
    await chatButton.click();

    // Assert
    await expect(chatError).toBeVisible();
    await expect(chatError).toContainText('Service unavailable');
  });

  test('should handle LLM timeout', async ({ page }) => {
    // Arrange
    const chatInput = page.locator('[data-testid="chat-input"]');
    const chatButton = page.locator('[data-testid="chat-send"]');
    const chatError = page.locator('[data-testid="chat-error"]');

    // Mock timeout
    await page.route('**/api/generate', async route => {
      // Simulate timeout by not responding
      await page.waitForTimeout(6000); // Longer than default timeout
    });

    // Act
    await chatInput.fill('Hello ethereal!');
    await chatButton.click();

    // Assert
    await expect(chatError).toBeVisible();
    await expect(chatError).toContainText('timeout');
  });

  test('should handle empty LLM response', async ({ page }) => {
    // Arrange
    const chatInput = page.locator('[data-testid="chat-input"]');
    const chatButton = page.locator('[data-testid="chat-send"]');
    const chatResponse = page.locator('[data-testid="chat-response"]');

    // Mock empty response
    await page.route('**/api/generate', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: ''
        })
      });
    });

    // Act
    await chatInput.fill('Hello ethereal!');
    await chatButton.click();

    // Assert
    await expect(chatResponse).toBeVisible();
    // Should handle empty response gracefully
    await expect(chatResponse).toContainText(''); // Empty response
  });
});
```

## Cross-System Integration Testing

### Complex Scenarios

Test complex interactions between multiple system components:

```typescript
// tests/e2e/system/complex-scenarios.spec.ts
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../../page-objects/EtherealApp';

test.describe('Complex System Integration Scenarios', () => {
  let app: EtherealApp;

  test.beforeEach(async ({ page }) => {
    app = new EtherealApp(page);
    await app.goto();
  });

  test('should handle coding session with GPU monitoring', async ({ page }) => {
    // Scenario: User codes while GPU heats up

    // Act - User starts coding
    await app.simulateWindowEvent('CODING', 'VS Code - main.rs');
    await expect(app.getStatus()).toContain('CODING');

    // Act - GPU temperature rises during coding
    await app.simulateGpuEvent(85, 75);
    await expect(app.getStatus()).toContain('OVERHEATING');

    // Act - User stops coding, GPU cools down
    await app.simulateWindowEvent('OTHER', 'Desktop');
    await app.simulateGpuEvent(70, 30);
    await expect(app.getStatus()).toContain('IDLE');
  });

  test('should handle gaming session with performance monitoring', async ({ page }) => {
    // Scenario: User plays game with high GPU utilization

    // Act - User starts gaming
    await app.simulateWindowEvent('GAMING', 'Steam - Cyberpunk 2077');
    await expect(app.getStatus()).toContain('GAMING');

    // Act - GPU utilization increases
    await app.simulateGpuEvent(75, 90);
    // Should remain in gaming state (not overheating yet)
    await expect(app.getStatus()).toContain('GAMING');

    // Act - GPU gets too hot
    await app.simulateGpuEvent(85, 95);
    await expect(app.getStatus()).toContain('OVERHEATING');

    // Act - Game ends, GPU cools down
    await app.simulateWindowEvent('OTHER', 'Desktop');
    await app.simulateGpuEvent(65, 20);
    await expect(app.getStatus()).toContain('IDLE');
  });

  test('should handle clipboard context during different activities', async ({ page }) => {
    // Scenario: Clipboard changes during different activities

    // Act - Clipboard change during idle
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('clipboard-changed', {
        detail: 'Interesting article about Rust'
      }));
    });
    await expect(app.getStatus()).toContain('IDLE');

    // Act - Start coding
    await app.simulateWindowEvent('CODING', 'VS Code - main.rs');
    await expect(app.getStatus()).toContain('CODING');

    // Act - Clipboard change during coding
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('clipboard-changed', {
        detail: 'fn main() { println!("Hello, world!"); }'
      }));
    });
    await expect(app.getStatus()).toContain('CODING');

    // Act - GPU overheats during coding with clipboard activity
    await app.simulateGpuEvent(85, 80);
    await expect(app.getStatus()).toContain('OVERHEATING');
  });

  test('should handle system stress with multiple concurrent events', async ({ page }) => {
    // Scenario: Multiple system events happening simultaneously

    // Act - Simultaneous events
    await Promise.all([
      app.simulateWindowEvent('GAMING', 'Steam - Game.exe'),
      app.simulateGpuEvent(80, 85),
      page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('clipboard-changed', {
          detail: 'Game tips and tricks'
        }));
      })
    ]);

    // Assert - Should handle all events appropriately
    // GPU temperature takes priority over activity for state
    await expect(app.getStatus()).toContain('OVERHEATING');

    // Act - Events settle
    await Promise.all([
      app.simulateWindowEvent('OTHER', 'Desktop'),
      app.simulateGpuEvent(70, 30)
    ]);

    // Assert - Should return to idle
    await expect(app.getStatus()).toContain('IDLE');
  });
});
```

## Best Practices for System Integration Testing

1. **Simulate Real System Events**: Use custom events to mimic actual system behavior
2. **Test Priority Handling**: Verify that higher-priority states override lower-priority ones
3. **Test Edge Cases**: Include boundary conditions and error scenarios
4. **Use Mock Services**: Mock external dependencies like LLM APIs for consistent testing
5. **Verify State Transitions**: Ensure smooth transitions between different system states
6. **Test Performance Impact**: Verify that system monitoring doesn't degrade application performance
7. **Test Error Recovery**: Ensure the application gracefully handles system errors
8. **Validate Data Flow**: Confirm that system data flows correctly through the application
9. **Test Concurrent Events**: Verify behavior when multiple system events occur simultaneously
10. **Use Realistic Timing**: Include appropriate delays to mimic real-world timing
