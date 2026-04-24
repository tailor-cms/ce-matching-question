import type { Locator, Page } from '@playwright/test';
import { pom } from '@tailor-cms/cek-e2e';

export class Edit extends pom.EditPanel {
  readonly form: pom.EditQuestionForm;
  readonly root: Locator;
  readonly premiseHeadingInput: Locator;
  readonly responseHeadingInput: Locator;
  readonly premiseInputs: Locator;
  readonly responseInputs: Locator;
  readonly addPairBtn: Locator;
  readonly removePairBtns: Locator;

  constructor(page: Page) {
    super(page);
    this.form = new pom.EditQuestionForm(this.el);
    this.root = this.form.el.locator('.tce-matching-question');
    this.premiseHeadingInput = this.root.getByLabel('Premise heading');
    this.responseHeadingInput = this.root.getByLabel('Response heading');
    this.premiseInputs = this.root.getByPlaceholder('Premise value...');
    this.responseInputs = this.root.getByPlaceholder('Response value...');
    this.addPairBtn = this.root.getByRole('button', { name: 'Add Pair' });
    this.removePairBtns = this.root.getByRole('button', {
      name: 'Remove answer',
    });
  }
}
