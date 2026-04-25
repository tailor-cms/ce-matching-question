import { expect, test } from '@playwright/test';
import { elementClient } from '@tailor-cms/cek-e2e';

import { Edit } from '../pom';

const ELEMENT_ID = 'test-matching-question-edit';

test.beforeEach(async ({ page }) => {
  await elementClient.reset(ELEMENT_ID);
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('Initial render', () => {
  test('Renders default headings and two pairs', async ({ page }) => {
    const edit = new Edit(page);
    await expect(edit.premiseHeadingInput).toHaveValue('Premise');
    await expect(edit.responseHeadingInput).toHaveValue('Response');
    await expect(edit.premiseInputs).toHaveCount(2);
    await expect(edit.responseInputs).toHaveCount(2);
    await expect(edit.addPairBtn).toBeVisible();
  });
});

test.describe('Pair management', () => {
  test('Adds a new pair', async ({ page }) => {
    const edit = new Edit(page);
    await edit.addPairBtn.click();
    await expect(edit.premiseInputs).toHaveCount(3);
    await expect(edit.responseInputs).toHaveCount(3);
  });

  test('Removes a pair when more than two exist', async ({ page }) => {
    const edit = new Edit(page);
    await edit.addPairBtn.click();
    await expect(edit.removePairBtns.first()).toBeVisible();
    await edit.removePairBtns.first().click();
    await expect(edit.premiseInputs).toHaveCount(2);
  });

  test('Persists custom headings and pair values', async ({ page }) => {
    const edit = new Edit(page);
    await edit.premiseHeadingInput.fill('Country');
    await edit.responseHeadingInput.fill('Capital');
    await edit.premiseInputs.nth(0).fill('France');
    await edit.responseInputs.nth(0).fill('Paris');
    await edit.premiseInputs.nth(1).fill('Germany');
    await edit.responseInputs.nth(1).fill('Berlin');
    await edit.form.saveBtn.click();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(edit.premiseHeadingInput).toHaveValue('Country');
    await expect(edit.responseHeadingInput).toHaveValue('Capital');
    await expect(edit.premiseInputs.nth(0)).toHaveValue('France');
    await expect(edit.responseInputs.nth(0)).toHaveValue('Paris');
    await expect(edit.premiseInputs.nth(1)).toHaveValue('Germany');
    await expect(edit.responseInputs.nth(1)).toHaveValue('Berlin');
  });
});

test.describe('Readonly mode', () => {
  test('Hides add/remove controls', async ({ page }) => {
    const edit = new Edit(page);
    await edit.setReadonly();
    await expect(edit.addPairBtn).not.toBeVisible();
  });
});
