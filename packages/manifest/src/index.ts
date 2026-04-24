import type { AiConfig, ElementMocks } from '@tailor-cms/cek-common';
import { v4 as uuid } from 'uuid';

import type {
  DataInitializer,
  ElementData,
  ElementManifest,
} from './interfaces';

// Element unique id within the target system (e.g. Tailor)
export const type = 'MATCHING_QUESTION';

// Display name (e.g. shown to the author)
export const name = 'Matching Question';

// Function which inits element state (data property on the Content Element
// entity)
export const initState: DataInitializer = (config): ElementData => {
  const isGradable = config?.isGradable ?? true;
  const premises = Array.from({ length: 2 }, () => ({
    key: uuid(),
    value: '',
  }));
  const responses = Array.from({ length: 2 }, () => ({
    key: uuid(),
    value: '',
  }));
  return {
    isGradable,
    embeds: {},
    question: [],
    headings: { premise: 'Premise', response: 'Response' },
    premises,
    responses,
    hint: '',
    ...(isGradable && {
      correct: {
        [premises[0].key]: responses[0].key,
        [premises[1].key]: responses[1].key,
      },
    }),
  };
};

// Can be loaded from package.json
export const version = '1.0';

export const isEmpty = (data: ElementData): boolean =>
  !data.question?.length ||
  !(data.premises ?? []).some((it) => it.value) ||
  !(data.responses ?? []).some((it) => it.value);

export const mocks: ElementMocks = {
  displayContexts: [
    { name: 'No answer', data: {} },
    {
      name: 'Correct answer',
      data: { response: 0, isCorrect: true, isSubmitted: true },
    },
    {
      name: 'Wrong answer',
      data: { response: 1, isCorrect: false, isSubmitted: true },
    },
  ],
};

// UI configuration for Tailor CMS
const ui = {
  // Display icon, https://pictogrammers.com/library/mdi/
  icon: 'mdi-table-merge-cells',
  // Does element support only full width or can be used within layouts
  // (e.g. 50/50 layout)
  forceFullWidth: true,
};

export const ai: AiConfig = {
  Schema: {
    type: 'json_schema',
    name: 'ce_matching_question',
    schema: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        pairs: {
          type: 'array',
          minItems: 2,
          items: {
            type: 'object',
            properties: {
              premise: { type: 'string' },
              response: { type: 'string' },
            },
            required: ['premise', 'response'],
            additionalProperties: false,
          },
        },
        headings: {
          type: 'object',
          properties: {
            premise: { type: 'string' },
            response: { type: 'string' },
          },
          required: ['premise', 'response'],
          additionalProperties: false,
        },
        hint: { type: 'string' },
      },
      required: ['question', 'hint', 'headings', 'pairs'],
      additionalProperties: false,
    },
  },
  getPrompt: (): string => `
    Generate a matching question as an object with the following
    properties:
    {
      "question": "",
      "pairs": [
        {
          "premise": "",
          "response": "
        },
      ],
      "headings":
      {
        "premise: "",
        "response": "'
      },
      "hint": "",
    }
    where:
      - 'question' is the question prompt.
      - 'pairs' is an array of pair objects where:
        - 'premise' is the premise text.
        - 'response' is the response text.
        Generate at least 2 pairs.
      - 'headings' is an object with 'premise' and 'response' headings.
      - 'hint' is an optional hint for the correct solution.
  `,
  processResponse: (val: any): Partial<ElementData> => {
    const questionId = uuid();
    const question = {
      id: questionId,
      data: { content: val.question },
      embedded: true,
      position: 1,
      type: 'TIPTAP_HTML',
    };
    const pairs = val.pairs.reduce(
      (acc: Record<string, any>, { premise, response }: any) => {
        const premiseId = uuid();
        const responseId = uuid();
        acc.premises.push({ key: premiseId, value: premise });
        acc.responses.push({ key: responseId, value: response });
        acc.correct[premiseId] = responseId;
        return acc;
      },
      { premises: [], responses: [], correct: {} },
    );
    return {
      isGradable: true,
      hint: val.hint || '',
      headings: val.headings,
      ...pairs,
      question: [questionId],
      embeds: { [questionId]: question },
    };
  },
};

const manifest: ElementManifest = {
  type,
  version,
  name,
  ssr: false,
  isQuestion: true,
  isComposite: true,
  isGradable: true,
  showFeedback: false,
  initState,
  isEmpty,
  ui,
  ai,
  mocks,
};

export default manifest;
export * from './interfaces';
