import { test, expect } from '@playwright/test';

test.describe('Wrkld End-to-End Smoke Test', () => {
  test('Complete user journey: sign-in -> dashboard -> projects -> project detail -> pod -> pod board', async ({
    page,
  }) => {
    // 1. Open /sign-in
    await page.goto('/sign-in');
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('heading', { name: 'Sign in to Wrkld' })).toBeVisible();

    // 2. Sign in using an existing mock persona (Nithin R V - Super Admin)
    const personaLabel = page.locator('label', { hasText: 'Nithin R V' });
    await expect(personaLabel).toBeVisible();
    await personaLabel.click();

    const signInButton = page.getByRole('button', { name: /sign in with github/i });
    await expect(signInButton).toBeEnabled();
    await signInButton.click();

    // 3. Verify successful navigation to /dashboard
    await page.waitForURL('**/dashboard', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(
      page.getByText('Multi-Pod Agile Project Overview & Delivery Insights')
    ).toBeVisible();
    await expect(page.getByText('Overall Progress').first()).toBeVisible();

    // 4. Open the Projects page from the sidebar navigation
    const projectsNavLink = page.locator('aside').getByRole('link', { name: 'Projects' });
    await expect(projectsNavLink).toBeVisible();
    await projectsNavLink.click();

    await page.waitForURL('**/projects', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();

    // 5. Open a project (Wrkld Core Platform)
    const projectCardLink = page.getByRole('link', { name: /Wrkld Core Platform/i });
    await expect(projectCardLink).toBeVisible();
    await projectCardLink.click();

    await page.waitForURL('**/projects/wrkld-core', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/projects\/wrkld-core/);
    await expect(
      page.getByRole('heading', { name: 'Wrkld Core Platform' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Domain Pods' })).toBeVisible();

    // 6. Navigate to one of its pods (Frontend Pod)
    const frontendPodLink = page.getByRole('link', {
      name: /Open Frontend Pod board/i,
    });
    await expect(frontendPodLink).toBeVisible();
    await frontendPodLink.click();

    await page.waitForURL('**/projects/wrkld-core/pods/pod-fe', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/projects\/wrkld-core\/pods\/pod-fe/);
    await expect(page.getByRole('heading', { name: 'Frontend Pod' })).toBeVisible();

    // 7. Verify that the Pod Board loads successfully
    const boardTabButton = page.getByRole('button', { name: 'Board' });
    await expect(boardTabButton).toBeVisible();
    await boardTabButton.click();

    // Verify Board filters and view switcher are active
    await expect(page.getByRole('button', { name: 'Kanban' })).toBeVisible();

    // Verify Kanban columns or board lifecycle zones are loaded
    await expect(page.getByText('Needs Pod Lead sign-off')).toBeVisible();
    await expect(page.getByText('Backlog').first()).toBeVisible();
    await expect(page.getByText('In Progress').first()).toBeVisible();
  });
});
