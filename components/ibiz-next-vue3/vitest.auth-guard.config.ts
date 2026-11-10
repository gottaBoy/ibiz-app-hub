import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { defineConfig } from 'vitest/config';

const require = createRequire(new URL('./package.json', import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL('../..', import.meta.url)),
  resolve: {
    alias: {
      '@ibiz-template/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
      '@ibiz-template/runtime': fileURLToPath(new URL('../../packages/runtime/src/index.ts', import.meta.url)),
      '@ibiz-template/vue3-util': fileURLToPath(new URL('../../packages/vue3-util/src/index.ts', import.meta.url)),
      '@ibiz-template/devtool': fileURLToPath(new URL('../../plugins/ibiz-template-devtools/src/index.ts', import.meta.url)),
      ramda: require.resolve('ramda'),
    },
  },
  test: {
    environment: 'node',
    include: [
      'components/ibiz-next-vue3/test/web-app/guard/auth-guard.test.ts',
      'packages/core/test/environment/require-organization-context.test.ts',
    ],
  },
});
