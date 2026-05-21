/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from '@ibiz-template/cli';

export default defineConfig({
  bundles: [
    {
      input: 'index.ts',
      output: [
        {
          format: 'system',
          dir: 'dist',
          entryFileNames: '[name].system.min.js',
          sourcemap: true,
        },
      ],
    },
  ],
  eslint: true,
  theme: {
    prefix: `@import 'node_modules/@ibiz-template/theme/style/global.scss';`,
  },
  isCustomElement: tag => tag.startsWith('ion-'),
  external: [
    'vant',
    'vue',
    'vue-router',
    'vue-i18n',
    'async-validator',
    'dayjs',
    'dayjs/plugin/minMax',
    'dayjs/plugin/isSameOrBefore',
    'dayjs/plugin/quarterOfYear',
    'dayjs/plugin/weekOfYear',
    'dayjs/plugin/isoWeek',
    'echarts',
    'axios',
    'qs',
    'ramda',
    'lodash-es',
    'qx-util',
    'vuedraggable',
    'pinia',
    'cherry-markdown',
    '@ibiz-template/mob-theme',
    '@ibiz-template/devtool',
    '@ibiz-template-package/vs-tree-ex',
    '@ibiz-template/core',
    '@ibiz-template/runtime',
    '@ibiz-template/vue3-util',
    '@ibiz-template/model-helper',
    '@floating-ui/dom',
    '@ibiz-template-plugin/ibiz-mob-ai-chat',
  ],
});
