import type { Locator, Page } from '@playwright/test';
import { pom } from '@tailor-cms/cek-e2e';

export class Display extends pom.DisplayPanel {
  readonly root: Locator;
  readonly selects: Locator;

  constructor(page: Page) {
    super(page);
    this.root = this.editor.locator('.tce-matching-question');
    this.selects = this.root.locator('.v-select');
  }

  async selectAnswer(index: number, optionName: string) {
    await this.selects.nth(index).click();
    await this.el.getByRole('option', { name: optionName }).last().click();
  }
}
