import { expect, test } from '@playwright/test';

/**
 * Guardian / student login must call POST /auth/otp/request first and only then
 * POST /api/v1/auth/otp/verify (BFF), passing the challengeId from the request.
 * Network is mocked — no real account or SMS needed.
 */
test('portal login requests the OTP before verifying it', async ({ page }) => {
  const calls: string[] = [];
  let verifyBody: Record<string, unknown> = {};

  await page.route('**/api/v1/auth/otp/request', async (route) => {
    calls.push('request');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        challengeId: '11111111-2222-3333-4444-555555555555',
        maskedDestination: '010****5678',
        resendAfterSeconds: 60,
        expiresInSeconds: 300,
      }),
    });
  });
  await page.route('**/api/v1/auth/otp/verify', async (route) => {
    calls.push('verify');
    verifyBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 401,
      contentType: 'application/problem+json',
      body: JSON.stringify({ status: 401, code: 'invalid-otp', title: 'الكود غير صحيح' }),
    });
  });

  await page.goto('/login');
  await page.getByRole('tab', { name: 'ولي أمر / طالب' }).click();
  await page.getByLabel('كود السنتر').fill('demo-center');
  await page.getByLabel('رقم موبايل ولي الأمر').fill('01012345678');
  await page.getByRole('button', { name: 'ابعت الكود' }).click();

  await expect(page.getByLabel('كود التأكيد 1')).toBeVisible();
  expect(calls).toEqual(['request']);

  await page.getByLabel('كود التأكيد 1').click();
  await page.keyboard.type('123456');

  await expect.poll(() => calls).toEqual(['request', 'verify']);
  expect(verifyBody).toMatchObject({
    challengeId: '11111111-2222-3333-4444-555555555555',
    phone: '01012345678',
    purpose: 'guardian-login',
    code: '123456',
  });
});
