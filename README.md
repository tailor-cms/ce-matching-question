# Matching Question

Question element where learners match premises to their correct responses.

**Type:** `MATCHING_QUESTION`

## Data

| Field | Type | Description |
|-------|------|-------------|
| `question` | `string[]` | Embedded question prompt element id(s) |
| `embeds` | `Record<string, any>` | Embedded element map (prompt content) |
| `headings` | `{ premise: string; response: string }` | Column headings |
| `premises` | `{ key: string; value: string }[]` | Premise items |
| `responses` | `{ key: string; value: string }[]` | Response items |
| `correct` | `Record<string, string>` | Map of premise key to correct response key (when gradable) |
| `hint` | `string` | Optional learner hint |
| `isGradable` | `boolean` | Whether the question is graded |

## Edit

- Premise and response column headings
- Pair rows with premise text, arrow indicator, and response text
- Add/remove pair controls (min 2, max 10 pairs)
- Hint and prompt editing via the question form wrapper

## Display

- Renders each premise with a response selector
- Submitting grades each pair against the correct map
- Per-row feedback icon (correct/incorrect) after submission

## Development

```sh
pnpm dev     # Preview :8080 | Edit :8010 | Display :8020 | Server :8030
pnpm build
pnpm lint
pnpm test
```

## Run with Docker

```sh
docker compose up
```
