import { expect, test } from '@playwright/test';

// Runs against the real backend. Provide a test account via env (never commit credentials):
// E2E_TENANT, E2E_PHONE, E2E_PASSWORD.
const account = {
  tenant: process.env.E2E_TENANT,
  phone: process.env.E2E_PHONE,
  password: process.env.E2E_PASSWORD,
};

test('signed-out visitors are sent to an Arabic RTL login page', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('staff login validates, then signs in and out', async ({ page }) => {
  test.skip(!account.tenant || !account.phone || !account.password, 'E2E_* credentials not set');
  await page.goto('/login');
  await page.getByRole('button', { name: 'دخول' }).click();
  await expect(page.getByRole('alert').first()).toBeVisible();

  await page.getByLabel('كود السنتر').fill(account.tenant ?? '');
  await page.getByLabel('رقم الموبايل').fill(account.phone ?? '');
  await page.getByLabel('كلمة السر', { exact: true }).fill(account.password ?? '');
  await page.getByRole('button', { name: 'دخول' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole('button', { name: 'حسابي' }).click();
  await page.getByRole('menuitem', { name: 'تسجيل الخروج' }).click();
  await expect(page).toHaveURL(/\/login/);
});
