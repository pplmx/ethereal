import { expect, test } from '@playwright/test';

test('visual check - digital spirit aesthetic', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="sprite-animator"]', { state: 'visible' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'e2e-screenshots/spirit-look-idle.png' });
  await expect(page.locator('main')).toBeVisible();
});

test('visual check - settings modal', async ({ page }) => {
  await page.goto('/');
  const settingsBtn = page.locator('button', { hasText: 'Settings' });
  await settingsBtn.click();

  await expect(page.locator('h2', { hasText: 'Settings' })).toBeVisible();
  await page.screenshot({ path: 'e2e-screenshots/settings-modal.png' });

  await page.click('button:has-text("ai")');
  await expect(page.locator('label', { hasText: 'System Prompt' })).toBeVisible();
  await page.screenshot({ path: 'e2e-screenshots/settings-ai-tab.png' });
});
