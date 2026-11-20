import { test, expect } from '@playwright/test';

test.describe('TopNavbar Single Layout Architecture', () => {
  test('TopNavbar is rendered exactly once on /dashboard', async ({ page }) => {
    await page.goto('/sign-in');
    await page.locator('label', { hasText: 'Nithin R V' }).click();
    await page.getByRole('button', { name: /sign in with github/i }).click();
    await page.waitForURL('**/dashboard');

    // Verify exactly one <header> element in the DOM
    const headers = page.locator('header');
    await expect(headers).toHaveCount(1);

    // Verify exactly one instance of each TopNavbar item
    await expect(page.locator('input[placeholder*="Search anything"]')).toHaveCount(1);
    await expect(page.getByText('Sprint 2 (Current)')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'View notifications' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: /User menu/i })).toHaveCount(1);
  });

  test('TopNavbar is rendered exactly once on /projects and Pod Board', async ({ page }) => {
    await page.goto('/sign-in');
    await page.locator('label', { hasText: 'Nithin R V' }).click();
    await page.getByRole('button', { name: /sign in with github/i }).click();
    await page.waitForURL('**/dashboard');

    // Navigate to /projects
    await page.locator('aside').getByRole('link', { name: 'Projects' }).click();
    await page.waitForURL('**/projects');
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'View notifications' })).toHaveCount(1);

    // Navigate to Pod Board
    await page.goto('/projects/wrkld-core/pods/pod-fe');
    await expect(page.locator('header')).toHaveCount(1);
    await page.getByRole('button', { name: 'Board' }).click();
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'View notifications' })).toHaveCount(1);
  });

  test('TopNavbar is not rendered on /sign-in', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.locator('header')).toHaveCount(0);
  });

  test('TopNavbar dynamic features: breadcrumbs, notifications, and settings removal', async ({ page }) => {
    await page.goto('/sign-in');
    await page.locator('label', { hasText: 'Nithin R V' }).click();
    await page.getByRole('button', { name: /sign in with github/i }).click();
    await page.waitForURL('**/dashboard');

    // 1. Check dynamic breadcrumbs on dashboard
    const breadcrumbs = page.locator('nav[aria-label="Breadcrumbs"]');
    await expect(breadcrumbs).toBeVisible();
    await expect(breadcrumbs).toContainText('Dashboard');

    // 2. Open User Menu and verify Settings link is removed, Sign out is present
    await page.getByRole('button', { name: /User menu/i }).click();
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /account settings/i })).toHaveCount(0);
    await page.keyboard.press('Escape');

    // 3. Open notifications dropdown
    await page.getByRole('button', { name: 'View notifications' }).click();
    await expect(page.locator('header').getByText(/Notifications/i).first()).toBeVisible();
  });
});
