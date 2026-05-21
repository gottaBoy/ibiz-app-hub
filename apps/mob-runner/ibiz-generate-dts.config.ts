import { defineGenerateDtsConfig } from '@ibiz-template/cli';

export default defineGenerateDtsConfig({
  input: {
    dirs: {
      core: '/root/workspace/template/ibiz-template/packages/core/src/interface/api',
      runtime:
        '/root/workspace/template/ibiz-template/packages/runtime/src/interface/api',
    },
  },
  replaceRules: {
    '@ibiz-template/core': 'core',
  },
  output: {
    target: 'all',
    dir: 'dts',
    fileName: 'types.d.ts',
  },
});
