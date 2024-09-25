import { v4 as uuid } from 'uuid';

import type {
  DataInitializer,
  ElementData,
  ElementManifest,
} from './interfaces';

const premises = Array.from({ length: 3 }, () => ({ key: uuid(), value: '' }));
const responses = Array.from({ length: 3 }, () => ({ key: uuid(), value: '' }));

// Element unique id within the target system (e.g. Tailor)
export const type = 'CE_MATCHING_QUESTION';

// Display name (e.g. shown to the author)
export const name = 'Matching question';

// Function which inits element state (data property on the Content Element
// entity)
export const initState: DataInitializer = (): ElementData => ({
  question: '',
  premises,
  responses,
  correct: {
    [premises[0].key]: responses[0].key,
    [premises[1].key]: responses[1].key,
    [premises[2].key]: responses[2].key,
  },
});

// Can be loaded from package.json
export const version = '1.0';

// UI configuration for Tailor CMS
const ui = {
  // Display icon, https://pictogrammers.com/library/mdi/
  icon: 'mdi-format-columns',
  // Does element support only full width or can be used within layouts
  // (e.g. 50/50 layout)
  forceFullWidth: true,
};

export const mocks = {
  displayContexts: [{ name: 'No selection', data: {} }],
};

const manifest: ElementManifest = {
  type,
  version: '1.0',
  name,
  ssr: false,
  initState,
  ui,
  mocks,
};

export default manifest;
export * from './interfaces';
