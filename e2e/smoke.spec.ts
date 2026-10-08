import { expect, test } from '@playwright/test';
import { mockAccounts } from '../src/mocks/fixtures';

// Requires the mock backend (.env.local: API_MOCK=true, NEXT_PUBLIC_API_URL=…/api/mock).
// Phase 4 extends this with: create student → edit → delete.

test('signed-out visitors are sent to an Arabic RTL login page', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('staff login validates, then signs in and out', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'دخول' }).click();
  await expect(page.getByRole('alert').first()).toBeVisible();

  await page.getByLabel('كود السنتر').fill(mockAccounts.tenantSlug);
  await page.getByLabel('رقم الموبايل').fill(mockAccounts.staff.phone);
  await page.getByLabel('كلمة السر', { exact: true }).fill(mockAccounts.staff.password);
  await page.getByRole('button', { name: 'دخول' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
  await expect(page).toHaveURL(/\/login/);
});
