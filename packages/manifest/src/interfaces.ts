import type * as common from '@tailor-cms/cek-common';

export interface DataInput {
  key: string;
  value: string;
}

export interface ElementData extends common.ElementConfig {
  isGradable?: boolean;
  embeds: Record<string, any>;
  question: string[];
  headings: Record<string, string>;
  premises: DataInput[];
  responses: DataInput[];
  correct: Record<string, string>;
  hint: string;
}

export type DataInitializer = common.DataInitializer<ElementData>;
export type Element = common.Element<ElementData>;
export type ElementManifest = common.ElementManifest<ElementData>;
