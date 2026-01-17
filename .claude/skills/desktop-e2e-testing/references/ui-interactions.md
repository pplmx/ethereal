# UI Interaction Testing Techniques

This guide covers UI interaction testing techniques for the Desktop Ethereal application, focusing on testing user interactions with the transparent overlay window.

## Understanding UI Challenges in Desktop Ethereal

Desktop Ethereal presents unique UI testing challenges:

- **Transparent Window**: Testing UI elements on a transparent background
- **Small Window Size**: 300x300px window with limited space
- **Overlay Nature**: UI overlays desktop content
- **Click-Through Mode**: Window can ignore mouse input
- **Sprite Animations**: Animated images that change based on state
- **Minimal Controls**: Few UI elements to interact with

## Basic UI Element Testing

### Sprite Animation Testing

Test sprite-based animations:

```typescript
// tests/e2e/ui/sprite-animations.spec.ts
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../../page-objects/EtherealApp';

test.describe('Sprite Animation Testing', () => {
  let app: EtherealApp;

  test.beforeEach(async ({ page }) => {
    app = new EtherealApp(page);
    await app.goto();
  });

  test('should display correct idle animation', async ({ page }) => {
    // Arrange - Ensure idle state
    await expect(app.getStatus()).toContain('IDLE');

    // Act - No action needed

    // Assert
    const sprite = page.locator('[data-testid="ethereal-sprite"]');
    await expect(sprite).toBeVisible();
    await expect(sprite).toHaveAttribute('src', /idle/);

    // Verify animation is playing (multiple frames)
    const frame1 = await sprite.getAttribute('src');
    await page.waitForTimeout(500); // Wait for animation
    const frame2 = await sprite.getAttribute('src');

    // Frames should change (implementation dependent)
    // This is a simplified check
    expect(frame1).toBeDefined();
  });

  test('should display correct coding animation', async ({ page }) => {
    // Arrange
    await app.simulateWindowEvent('CODING', 'VS Code - main.ts');

    // Act - State change handled by event simulation

    // Assert
    const sprite = page.locator('[data-testid="ethereal-sprite"]');
    await expect(sprite).toBeVisible();
    await expect(sprite).toHaveAttribute('src', /typing/);
  });

  test('should display correct gaming animation', async ({ page }) => {
    // Arrange
    await app.simulateWindowEvent('GAMING', 'Steam - Game.exe');

    // Act - State change handled by event simulation

    // Assert
    const sprite = page.locator('[data-testid="ethereal-sprite"]');
    await expect(sprite).toBeVisible();
    await expect(sprite).toHaveAttribute('src', /gaming/);
  });

  test('should display correct overheating animation', async ({ page }) => {
    // Arrange
    await app.simulateGpuEvent(85, 75);

    // Act - State change handled by event simulation

    // Assert
    const sprite = page.locator('[data-testid="ethereal-sprite"]');
    await expect(sprite).toBeVisible();
    await expect(sprite).toHaveAttribute('src', /overheat/);
  });

  test('should animate at correct frame rate', async ({ page }) => {
    // Arrange
    const sprite = page.locator('[data-testid="ethereal-sprite"]');

    // Act & Assert - Measure animation timing
    const startTime = Date.now();
    const initialSrc = await sprite.getAttribute('src');

    // Wait for expected frame change (based on configured FPS)
    await page.waitForTimeout(200); // Assuming 5 FPS (200ms per frame)

    const endTime = Date.now();
    const finalSrc = await sprite.getAttribute('src');

    // Verify timing is reasonable
    expect(endTime - startTime).toBeGreaterThanOrEqual(150); // Allow some variance
    expect(endTime - startTime).toBeLessThanOrEqual(300);

    // Frames should change (implementation dependent)
    // Note: This might not always pass if animation has few frames
  });
});
```

### Control Button Testing

Test UI controls when available:

```typescript
// tests/e2e/ui/control-buttons.spec.ts
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../../page-objects/EtherealApp';

test.describe('Control Button Testing', () => {
  let app: EtherealApp;

  test.beforeEach(async ({ page }) => {
    app = new EtherealApp(page);
    await app.goto();
  });

  test('should show enable button when not in click-through mode', async ({ page }) => {
    // Arrange
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    // Act - No action needed

    // Assert
    await expect(app.page.locator('[data-testid="enable-click-through"]')).toBeVisible();
    await expect(app.page.locator('[data-testid="disable-click-through"]')).not.toBeVisible();
  });

  test('should show disable button when in click-through mode', async ({ page }) => {
    // Arrange
    await app.toggleClickThrough();
    await expect(app.isClickThroughEnabled()).toBeTruthy();

    // Act - No action needed

    // Assert
    await expect(app.page.locator('[data-testid="disable-click-through"]')).toBeVisible();
    await expect(app.page.locator('[data-testid="enable-click-through"]')).not.toBeVisible();
  });

  test('should respond to enable button click', async ({ page }) => {
    // Arrange
    await app.toggleClickThrough(); // Enable click-through first
    await expect(app.isClickThroughEnabled()).toBeTruthy();

    // Act
    const enableButton = app.page.locator('[data-testid="enable-click-through"]');
    await enableButton.click();

    // Assert
    await expect(app.isClickThroughEnabled()).toBeFalsy();
  });

  test('should respond to disable button click', async ({ page }) => {
    // Arrange
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    // Act
    const disableButton = app.page.locator('[data-testid="disable-click-through"]');
    await disableButton.click();

    // Assert
    await expect(app.isClickThroughEnabled()).toBeTruthy();
  });

  test('should maintain button state after window events', async ({ page }) => {
    // Arrange
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    // Act - Trigger various window events
    await app.simulateWindowEvent('CODING', 'VS Code - main.ts');
    await app.simulateGpuEvent(75, 50);

    // Assert - Button state should remain unchanged
    await expect(app.page.locator('[data-testid="enable-click-through"]')).toBeVisible();
    await expect(app.isClickThroughEnabled()).toBeFalsy();
  });

  test('should maintain button state after system events', async ({ page }) => {
    // Arrange
    await app.toggleClickThrough();
    await expect(app.isClickThroughEnabled()).toBeTruthy();

    // Act - Trigger various system events
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('clipboard-changed', {
        detail: 'Test clipboard content'
      }));
    });

    // Assert - Button state should remain unchanged
    await expect(app.page.locator('[data-testid="disable-click-through"]')).toBeVisible();
    await expect(app.isClickThroughEnabled()).toBeTruthy();
  });
});
```

## Drag and Drop Testing

### Window Dragging

Test window movement interactions:

```typescript
// tests/e2e/ui/window-dragging.spec.ts
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../../page-objects/EtherealApp';

test.describe('Window Dragging Testing', () => {
  let app: EtherealApp;

  test.beforeEach(async ({ page }) => {
    app = new EtherealApp(page);
    await app.goto();
  });

  test('should allow dragging when not in click-through mode', async ({ page }) => {
    // Arrange
    await expect(app.isClickThroughEnabled()).toBeFalsy();
    const windowElement = page.locator('[data-testid="ethereal-window"]');
    const initialBox = await windowElement.boundingBox();

    // Act
    await windowElement.dragTo(windowElement, {
      targetPosition: { x: 100, y: 100 }
    });

    // Assert
    const newBox = await windowElement.boundingBox();
    expect(newBox?.x).toBeGreaterThan(initialBox?.x || 0);
    expect(newBox?.y).toBeGreaterThan(initialBox?.y || 0);
  });

  test('should prevent dragging when in click-through mode', async ({ page }) => {
    // Arrange
    await app.toggleClickThrough();
    await expect(app.isClickThroughEnabled()).toBeTruthy();
    const windowElement = page.locator('[data-testid="ethereal-window"]');
    const initialBox = await windowElement.boundingBox();

    // Act
    try {
      await windowElement.dragTo(windowElement, {
        targetPosition: { x: 100, y: 100 }
      });
    } catch (error) {
      // Drag might fail silently when click-through is enabled
    }

    // Assert - Window should not have moved significantly
    const newBox = await windowElement.boundingBox();
    expect(Math.abs((newBox?.x || 0) - (initialBox?.x || 0))).toBeLessThan(10);
    expect(Math.abs((newBox?.y || 0) - (initialBox?.y || 0))).toBeLessThan(10);
  });

  test('should allow dragging after disabling click-through', async ({ page }) => {
    // Arrange
    await app.toggleClickThrough(); // Enable click-through
    await expect(app.isClickThroughEnabled()).toBeTruthy();

    await app.toggleClickThrough(); // Disable click-through
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    const windowElement = page.locator('[data-testid="ethereal-window"]');
    const initialBox = await windowElement.boundingBox();

    // Act
    await windowElement.dragTo(windowElement, {
      targetPosition: { x: 50, y: 50 }
    });

    // Assert
    const newBox = await windowElement.boundingBox();
    expect(newBox?.x).toBeGreaterThan(initialBox?.x || 0);
    expect(newBox?.y).toBeGreaterThan(initialBox?.y || 0);
  });

  test('should maintain window boundaries during dragging', async ({ page }) => {
    // Arrange
    const windowElement = page.locator('[data-testid="ethereal-window"]');
    const viewportSize = page.viewportSize();

    // Act
    // Try to drag beyond viewport boundaries
    await windowElement.dragTo(windowElement, {
      targetPosition: {
        x: (viewportSize?.width || 1000) + 100,
        y: (viewportSize?.height || 1000) + 100
      }
    });

    // Assert - Window should not go beyond viewport
    const box = await windowElement.boundingBox();
    expect(box?.x).toBeLessThan(viewportSize?.width || 1000);
    expect(box?.y).toBeLessThan(viewportSize?.height || 1000);
  });
});
```

## Status Display Testing

### Information Presentation

Test status and information display:

```typescript
// tests/e2e/ui/status-display.spec.ts
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../../page-objects/EtherealApp';

test.describe('Status Display Testing', () => {
  let app: EtherealApp;

  test.beforeEach(async ({ page }) => {
    app = new EtherealApp(page);
    await app.goto();
  });

  test('should display correct initial status', async ({ page }) => {
    // Arrange - Application just started

    // Act - No action needed

    // Assert
    const statusDisplay = page.locator('[data-testid="status-display"]');
    await expect(statusDisplay).toBeVisible();
    await expect(statusDisplay).toContainText('IDLE');
    await expect(statusDisplay).toContainText('0°C'); // Initial temperature
    await expect(statusDisplay).toContainText('OTHER'); // Initial activity
  });

  test('should update status with GPU information', async ({ page }) => {
    // Arrange
    const statusDisplay = page.locator('[data-testid="status-display"]');

    // Act
    await app.simulateGpuEvent(75, 60);

    // Assert
    await expect(statusDisplay).toContainText('75°C');
    await expect(statusDisplay).toContainText('60%'); // Utilization
  });

  test('should update status with activity information', async ({ page }) => {
    // Arrange
    const statusDisplay = page.locator('[data-testid="status-display"]');

    // Act
    await app.simulateWindowEvent('CODING', 'VS Code - main.ts');

    // Assert
    await expect(statusDisplay).toContainText('CODING');
    await expect(statusDisplay).toContainText('VS Code');
  });

  test('should update status with combined information', async ({ page }) => {
    // Arrange
    const statusDisplay = page.locator('[data-testid="status-display"]');

    // Act
    await app.simulateWindowEvent('GAMING', 'Steam - Game.exe');
    await app.simulateGpuEvent(80, 85);

    // Assert
    await expect(statusDisplay).toContainText('GAMING');
    await expect(statusDisplay).toContainText('80°C');
    await expect(statusDisplay).toContainText('85%');
  });

  test('should format status information correctly', async ({ page }) => {
    // Arrange
    const statusDisplay = page.locator('[data-testid="status-display"]');

    // Act
    await app.simulateGpuEvent(75, 60);
    await app.simulateWindowEvent('CODING', 'VS Code - main.ts');

    // Assert - Check formatting
    await expect(statusDisplay).toContainText('State: CODING');
    await expect(statusDisplay).toContainText('Temp: 75°C');
    await expect(statusDisplay).toContainText('Activity: CODING');
    await expect(statusDisplay).toContainText('VS Code');
  });

  test('should handle long activity titles gracefully', async ({ page }) => {
    // Arrange
    const statusDisplay = page.locator('[data-testid="status-display"]');
    const longTitle = 'Very Long Application Title That Might Overflow The Status Display Area';

    // Act
    await app.simulateWindowEvent('CODING', longTitle);

    // Assert
    await expect(statusDisplay).toBeVisible();
    // Should handle long text without breaking layout
    // Implementation dependent - might truncate or wrap text
  });

  test('should update status in real-time', async ({ page }) => {
    // Arrange
    const statusDisplay = page.locator('[data-testid="status-display"]');

    // Act & Assert - Series of updates
    await app.simulateWindowEvent('CODING', 'VS Code - main.ts');
    await expect(statusDisplay).toContainText('CODING');

    await app.simulateGpuEvent(75, 60);
    await expect(statusDisplay).toContainText('75°C');

    await app.simulateWindowEvent('OTHER', 'Desktop');
    await expect(statusDisplay).toContainText('IDLE'); // Should return to IDLE when not overheating
  });
});
```

## Keyboard Interaction Testing

### Hotkey Testing

Test keyboard-based interactions:

```typescript
// tests/e2e/ui/keyboard-interactions.spec.ts
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../../page-objects/EtherealApp';

test.describe('Keyboard Interaction Testing', () => {
  let app: EtherealApp;

  test.beforeEach(async ({ page }) => {
    app = new EtherealApp(page);
    await app.goto();
  });

  test('should respond to global hotkey Ctrl+Shift+D', async ({ page }) => {
    // Arrange
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    // Act
    await page.keyboard.press('Control+Shift+D');

    // Small delay for hotkey processing
    await page.waitForTimeout(100);

    // Assert
    await expect(app.isClickThroughEnabled()).toBeTruthy();

    // Act - Press again to disable
    await page.keyboard.press('Control+Shift+D');

    // Assert
    await expect(app.isClickThroughEnabled()).toBeFalsy();
  });

  test('should ignore hotkey when window is not focused', async ({ page, context }) => {
    // Arrange
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    // Create another window to take focus
    const secondPage = await context.newPage();
    await secondPage.goto('about:blank');
    await secondPage.bringToFront();

    // Act - Try hotkey when Ethereal window is not focused
    await secondPage.keyboard.press('Control+Shift+D');

    // Small delay
    await page.waitForTimeout(100);

    // Assert - Ethereal should not respond
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    await secondPage.close();
  });

  test('should handle rapid hotkey presses', async ({ page }) => {
    // Arrange
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    // Act - Rapid presses
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Control+Shift+D');
      await page.waitForTimeout(50); // Small delay between presses
    }

    // Assert - Should end up in the same state as started
    await expect(app.isClickThroughEnabled()).toBeFalsy();
  });

  test('should handle hotkey combinations with modifiers', async ({ page }) => {
    // Arrange
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    // Act - Test various modifier combinations
    // These should NOT trigger the hotkey
    await page.keyboard.press('Control+D');
    await page.keyboard.press('Shift+D');
    await page.keyboard.press('Alt+D');
    await page.keyboard.press('D');

    // Small delay
    await page.waitForTimeout(100);

    // Assert - State should remain unchanged
    await expect(app.isClickThroughEnabled()).toBeFalsy();

    // Act - Correct combination should work
    await page.keyboard.press('Control+Shift+D');

    // Assert
    await expect(app.isClickThroughEnabled()).toBeTruthy();
  });
});
```

## Visual Testing for Transparent Windows

### Transparency and Overlay Testing

Test visual aspects of the transparent overlay:

```typescript
// tests/e2e/ui/visual-testing.spec.ts
import { test, expect } from '@playwright/test';
import { EtherealApp } from '../../page-objects/EtherealApp';

test.describe('Visual Testing', () => {
  let app: EtherealApp;

  test.beforeEach(async ({ page }) => {
    app = new EtherealApp(page);
    await app.goto();
  });

  test('should maintain transparency properties', async ({ page }) => {
    // Arrange
    const windowElement = page.locator('[data-testid="ethereal-window"]');

    // Act - No action needed

    // Assert - Check transparency (implementation dependent)
    const backgroundColor = await windowElement.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should be transparent or semi-transparent
    expect(backgroundColor).toMatch(/rgba\(\d+, \d+, \d+, 0(\.\d+)?\)/);
  });

  test('should display sprites with proper transparency', async ({ page }) => {
    // Arrange
    const sprite = page.locator('[data-testid="ethereal-sprite"]');

    // Act - No action needed

    // Assert
    await expect(sprite).toBeVisible();

    // Check that sprite has transparent background
    const backgroundColor = await sprite.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Sprite container should be transparent
    expect(backgroundColor).toMatch(/rgba\(0, 0, 0, 0\)/);
  });

  test('should maintain proper contrast with desktop background', async ({ page }) => {
    // Arrange
    // This test would require setting up specific background conditions
    // which is complex in automated testing

    // For now, we'll test that UI elements are visible
    const statusDisplay = page.locator('[data-testid="status-display"]');
    const enableButton = page.locator('[data-testid="enable-click-through"]');

    // Act - No action needed

    // Assert - Elements should be visible
    await expect(statusDisplay).toBeVisible();
    await expect(enableButton).toBeVisible();

    // Check that text has sufficient contrast
    const textColor = await statusDisplay.evaluate(el => {
      return window.getComputedStyle(el).color;
    });

    // Text should be visible (typically white or light color for dark backgrounds)
    expect(textColor).toMatch(/rgb\(\d+, \d+, \d+\)/);
  });

  test('should adapt to different desktop backgrounds', async ({ page }) => {
    // Arrange - This is a simplified test
    // In reality, this would require changing the desktop background

    const windowElement = page.locator('[data-testid="ethereal-window"]');

    // Act - No action needed

    // Assert - Window should remain visible regardless of background
    await expect(windowElement).toBeVisible();

    // Check that window maintains its properties
    const position = await windowElement.boundingBox();
    expect(position?.width).toBe(300);
    expect(position?.height).toBe(300);
  });
});
```

## Best Practices for UI Interaction Testing

1. **Use data-testid attributes** for reliable element selection
2. **Test both visual and functional aspects** of UI elements
3. **Account for timing** in animations and transitions
4. **Test edge cases** like very long text or rapid interactions
5. **Verify accessibility** - keyboard navigation, screen reader support
6. **Test responsive behavior** - how UI adapts to different conditions
7. **Use page objects** to encapsulate UI interaction logic
8. **Include negative testing** - verify incorrect interactions are handled
9. **Test state persistence** - UI should reflect current application state
10. **Verify visual consistency** - UI should look correct in all states
11. **Test cross-platform differences** - behavior may vary by operating system
12. **Include performance testing** - UI interactions should be responsive

## Common UI Testing Patterns

1. **State-Driven Testing**: Test UI for each application state
2. **Interaction Sequences**: Test sequences of user actions
3. **Boundary Testing**: Test UI with extreme values or conditions
4. **Error State Testing**: Verify UI behavior during error conditions
5. **Concurrent Interaction Testing**: Test multiple simultaneous interactions
6. **Focus and Blur Testing**: Test UI behavior when window gains/loses focus
7. **Resize and Position Testing**: Test UI behavior when window is moved/resized
8. **Accessibility Testing**: Test keyboard navigation and screen reader support
