# E2E Testing Workflow Guide

This guide defines the workflow for generating end-to-end tests for the Desktop Ethereal application, especially for complex user workflows or multi-scenario testing.

## Scope Clarification

When assigned to create E2E tests, test **COMPLETE USER WORKFLOWS**:

- Test full user journeys from start to finish
- Test integration between multiple features
- Test realistic usage scenarios
- Use incremental approach: one workflow at a time, verify each before proceeding
- Goal: 100% coverage of ALL user workflows

## Planning Phase

Before writing tests, analyze the application's user workflows:

1. **Inventory Workflows**: List all complete user journeys
2. **Categorize Complexity**:
   - Simple (basic interactions)
   - Medium (multi-step processes)
   - Complex (cross-feature integrations)
3. **Identify Test Data Needs**: Note required test data and fixtures
4. **Plan Test Environment**: Determine setup and teardown requirements

## Implementation Workflow

### Step 1: Start with Simple Workflows

Begin with the simplest user workflows:

```typescript
// Example of a simple workflow to test first
test('should display ethereal window on startup', async ({ page }) => {
  // Navigate to application
  await page.goto('/');

  // Verify window is visible
  await expect(page.locator('[data-testid="ethereal-window"]')).toBeVisible();

  // Verify initial state
  await expect(page.locator('[data-testid="status-display"]')).toContainText('IDLE');
});
```

### Step 2: Progress to Complex Workflows

Gradually work up to more complex workflows:

```typescript
// Example of a complex workflow to test later
test('should respond to system activity and transition states appropriately', async ({ page }) => {
  // Setup: Ensure initial state
  await expect(page.locator('[data-testid="status-display"]')).toContainText('IDLE');

  // Scenario 1: User starts coding
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('window-update', {
      detail: { category: 'CODING', title: 'VS Code - main.ts' }
    }));
  });

  await expect(page.locator('[data-testid="status-display"]')).toContainText('CODING');

  // Scenario 2: GPU temperature rises
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('gpu-update', {
      detail: { temperature: 85, utilization: 75 }
    }));
  });

  await expect(page.locator('[data-testid="status-display"]')).toContainText('OVERHEATING');

  // Scenario 3: User stops coding, GPU cools down
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('window-update', {
      detail: { category: 'OTHER', title: 'Desktop' }
    }));
  });

  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('gpu-update', {
      detail: { temperature: 70, utilization: 30 }
    }));
  });

  await expect(page.locator('[data-testid="status-display"]')).toContainText('IDLE');
});
```

### Step 3: Verify Each Test

For each workflow, follow this verification process:

1. **Write the test**
2. **Run the test**: `pnpm test:e2e test-file.spec.ts`
3. **If PASS**: Mark complete, move to next workflow
4. **If FAIL**: Fix the implementation or test, then retry
5. **Check coverage**: Ensure adequate coverage for the workflow

## Test Organization

Organize tests in a hierarchical structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Desktop Ethereal E2E Tests', () => {
  // Test setup and teardown
  test.beforeEach(async ({ page }) => {
    // Common setup for all tests
  });

  test.afterEach(async ({ page }) => {
    // Common teardown for all tests
  });

  // Basic functionality tests
  test.describe('Basic Functionality', () => {
    // Tests for simple workflows
  });

  // System integration tests
  test.describe('System Integration', () => {
    // Tests for system event responses
  });

  // User workflow tests
  test.describe('User Workflows', () => {
    // Tests for complete user journeys
  });

  // Edge case tests
  test.describe('Edge Cases', () => {
    // Tests for boundary conditions
  });
});
```

## Incremental Development Process

Use a todo list approach for tracking progress:

1. **List all workflows** that need testing
2. **Mark current workflow** as in progress
3. **Complete test** for current workflow
4. **Verify test passes**
5. **Move to next workflow**

Example todo list:
- [ ] Application startup and initial display
- [ ] Basic UI interactions (button clicks)
- [ ] Click-through mode toggling
- [ ] Window dragging functionality
- [ ] System event responses (GPU temperature)
- [ ] State transitions based on activity
- [ ] Complete user workflow (coding session)
- [ ] Complex integration (overheating during gaming)

## Environment Setup

### Test Environment Configuration

Ensure proper test environment setup:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: 'http://localhost:1420',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { channel: 'chrome' },
    },
  ],
  webServer: {
    command: 'pnpm tauri dev',
    url: 'http://localhost:1420',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### Test Data Management

Use fixtures for consistent test data:

```typescript
// tests/e2e/fixtures/test-data.ts
export const testData = {
  gpuEvents: {
    normal: { temperature: 65, utilization: 30 },
    hot: { temperature: 85, utilization: 75 },
    critical: { temperature: 95, utilization: 90 }
  },
  windowActivities: {
    coding: { category: 'CODING', title: 'VS Code - main.ts' },
    gaming: { category: 'GAMING', title: 'Steam - Game.exe' },
    browsing: { category: 'BROWSING', title: 'Chrome - Google' },
    other: { category: 'OTHER', title: 'Desktop' }
  }
};

// In test file
import { testData } from '../fixtures/test-data';

test('should respond to different window activities', async ({ page }) => {
  // Test coding activity
  await page.evaluate((activity) => {
    window.dispatchEvent(new CustomEvent('window-update', { detail: activity }));
  }, testData.windowActivities.coding);

  await expect(page.locator('[data-testid="status-display"]')).toContainText('CODING');
});
```

## Error Handling

When tests fail:

1. **Don't skip** - Fix the failing test before proceeding
2. **Diagnose** - Use Playwright's tracing and screenshot features
3. **Fix** - Correct either the implementation or test
4. **Re-run** - Verify the fix resolves the issue
5. **Continue** - Only then proceed to the next workflow

## Coverage Verification

After testing each workflow:

1. **Run coverage**: `pnpm test:e2e --reporter=html`
2. **Check workflow coverage**: Ensure the target workflow has 100% coverage
3. **Verify scenario coverage**: Ensure all scenarios are tested
4. **Document gaps**: Note any uncovered edge cases

## Completion Criteria

A workflow is considered fully tested when:

- ✅ All user interactions in the workflow have tests
- ✅ All tests pass
- ✅ Coverage goals are met for the workflow
- ✅ Edge cases are handled
- ✅ Error conditions are tested
- ✅ Integration points are verified

## Common Pitfalls to Avoid

1. **Testing implementation details** instead of user behavior
2. **Skipping error cases** in favor of happy paths
3. **Writing tests that are too brittle** (dependent on exact UI structure)
4. **Not waiting for proper conditions** (using sleeps instead of proper waits)
5. **Rushing through complex workflows** without proper verification

## Best Practices

1. **Write tests that mimic real user behavior**
2. **Use descriptive test names** that clearly indicate what workflow is being tested
3. **Keep tests isolated** - each test should be independent
4. **Use proper waits** - waitForSelector, waitForTimeout, etc.
5. **Test edge cases** - boundary conditions, error conditions
6. **Use page objects** to reduce code duplication
7. **Group related tests** in describe blocks for better organization
8. **Use test fixtures** for consistent test data
9. **Take advantage of Playwright's tracing** for debugging failed tests
10. **Run tests in headless mode** for CI, headed mode for local debugging
