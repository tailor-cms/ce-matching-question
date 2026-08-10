# @tailor-cms/ce-matching-question-display

End-user component for the **Matching Question** content element in [Tailor CMS](https://github.com/tailor-cms/author).

Renders the element as learners see it in published content.

## Installation

```sh
npm install @tailor-cms/ce-matching-question-display
```

## Usage

Content elements are normally registered with Tailor through the element
registry rather than imported directly, but the package can be consumed on its
own:

```ts
import { Display } from '@tailor-cms/ce-matching-question-display';
```

## Element

| Property | Value |
| --- | --- |
| Name | Matching Question |
| Type | `MATCHING_QUESTION` |
| Icon | [`mdi-table-merge-cells`](https://pictogrammers.com/library/mdi/) |
| Composite | Yes |
| Question | Yes |

## Packages

This element ships as four packages, published together from the
[`ce-matching-question`](https://github.com/tailor-cms/ce-matching-question) repository:

| Package | Role |
| --- | --- |
| [`@tailor-cms/ce-matching-question-manifest`](https://www.npmjs.com/package/@tailor-cms/ce-matching-question-manifest) | Shared element definition |
| [`@tailor-cms/ce-matching-question-edit`](https://www.npmjs.com/package/@tailor-cms/ce-matching-question-edit) | Authoring component |
| [`@tailor-cms/ce-matching-question-display`](https://www.npmjs.com/package/@tailor-cms/ce-matching-question-display) | End-user component |
| [`@tailor-cms/ce-matching-question-server`](https://www.npmjs.com/package/@tailor-cms/ce-matching-question-server) | Server-side module |

## Development

```sh
pnpm install
pnpm dev     # start the Content Element Kit runtime
pnpm build   # build all packages
pnpm test    # Playwright end-to-end suite
```

Changes are released with [changesets](https://github.com/changesets/changesets);
run `pnpm changeset` to record one.
