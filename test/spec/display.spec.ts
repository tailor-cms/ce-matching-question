import { elementClient, pom } from '@tailor-cms/cek-e2e';
import { expect, test } from '@playwright/test';

import { Display } from '../pom';

const ELEMENT_ID = 'test-matching-question-display';

const SEED = {
  isGradable: true,
  embeds: {
    prompt: {
      id: 'prompt',
      type: 'TIPTAP_HTML',
      position: 1,
      embedded: true,
      data: { content: 'Match each country to its capital.' },
    },
  },
  question: ['prompt'],
  hint: '',
  headings: { premise: 'Country', response: 'Capital' },
  premises: [
    { key: 'p1', value: 'France' },
    { key: 'p2', value: 'Germany' },
  ],
  responses: [
    { key: 'r1', value: 'Paris' },
    { key: 'r2', value: 'Berlin' },
  ],
  correct: { p1: 'r1', p2: 'r2' },
};

test.beforeEach(async ({ page }) => {
  await elementClient.reset(ELEMENT_ID);
  await elementClient.resetState(ELEMENT_ID);
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('Empty state', () => {
  test('Renders placeholder when no premises are set', async ({ page }) => {
    const display = new Display(page);
    await expect(display.placeholder).toBeVisible();
  });
});

test.describe('With pairs set', () => {
  test.beforeEach(async ({ page }) => {
    await elementClient.update(ELEMENT_ID, SEED);
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('Renders one select per premise', async ({ page }) => {
    const display = new Display(page);
    await expect(display.selects).toHaveCount(2);
    await expect(display.root).toContainText('France');
    await expect(display.root).toContainText('Germany');
  });

  test('Submitting correct pairings shows success icons', async ({ page }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.selectAnswer(0, 'Paris');
    await display.selectAnswer(1, 'Berlin');
    await form.submit();
    await expect(display.root.locator('.mdi-check-circle')).toHaveCount(2);
  });

  test('Submitting wrong pairings shows error icons', async ({ page }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.selectAnswer(0, 'Berlin');
    await display.selectAnswer(1, 'Paris');
    await form.submit();
    await expect(display.root.locator('.mdi-close-circle')).toHaveCount(2);
  });

  test('Submitting correct pairings marks feedback as success', async ({
    page,
  }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.selectAnswer(0, 'Paris');
    await display.selectAnswer(1, 'Berlin');
    await form.submit();
    await expect(form.feedback).toHaveClass(/success/);
  });

  test('Submitting wrong pairings marks feedback as error', async ({
    page,
  }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.selectAnswer(0, 'Berlin');
    await display.selectAnswer(1, 'Paris');
    await form.submit();
    await expect(form.feedback).toHaveClass(/error/);
  });
});
