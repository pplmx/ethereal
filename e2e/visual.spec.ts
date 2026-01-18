import { expect, test } from '@playwright/test';

test('visual check - digital spirit aesthetic', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="sprite-animator"]', { state: 'visible' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e-screenshots/spirit-look.png' });
  await expect(page.locator('main')).toBeVisible();
});
