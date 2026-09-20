# Localization Validation

Date: 2026-09-14

Run from `plugins/ibiz-template-devtools`.

| Command | Result |
| --- | --- |
| `node --test test/locale.test.cjs` | Exit 0; 7 tests passed. |
| `pnpm exec eslint 'src/locale/**/*.ts'` | Exit 0. |
| `git diff --check -- .` | Exit 0. |
| `pnpm lint` | Exit 1; 35 existing errors: missing return types, destructuring rules, and missing Vue ESLint rules. |
| `pnpm exec tsc --noEmit --incremental false --composite false` | Exit 2; one TS2741 error at `src/components/view-model-viewer/view-model-viewer.tsx:82`. Monaco 0.52.2 editor types lack `ShowAiIconMode` required by the resolved 0.45.0 types. |
| `pnpm build` | Exit 0; generated `dist/index.system.min.js`, `lib/index.cjs`, `lib/locale/helper.cjs`, and `es/locale/helper.mjs`. Existing lint and SCSS parsing diagnostics are still printed. This is not a clean lint/typecheck pass. |

Additional artifact checks passed: requiring `lib/locale/helper.cjs` returns
Chinese without a host and interpolates zero in the English fallback for an
`en-GB` host returning translation keys. `dist/index.system.min.js` parses with
`vm.Script` and contains `System.register`.

Tests execute the actual TypeScript helper and TSX render function in an isolated
VM. They cover dictionary parity, all local keys, language aliases, missing or
throwing host methods, invalid translation results, host method binding,
interpolation, registration failures, and placeholder evaluation after import.
They do not mount the full host UI. Host initialization/resource replacement is
outside this plugin change.
