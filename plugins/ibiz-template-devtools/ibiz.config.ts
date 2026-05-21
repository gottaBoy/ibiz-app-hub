/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { defineConfig } from '@ibiz-template/cli';

const cwd = process.cwd();

export default defineConfig({
  bundles: [
    {
      input: 'index.ts',
      output: [
        {
          format: 'system',
          dir: 'dist',
          entryFileNames: '[name].system.min.js',
          sourcemap: false,
        },
      ],
    },
  ],
  eslint: true,
  stylelint: true,
  theme: {
    prefix: `@import "${path.resolve(
      cwd,
      'node_modules/@ibiz-template/theme/style/global.scss',
    )}";`,
  },
  isCustomElement: tag => tag.startsWith('ion-'),
  external: [
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
    'interactjs',
    'lodash-es',
    'qx-util',
    'vuedraggable',
    'pinia',
    'cherry-markdown',
    '@floating-ui/dom',
    '@ibiz-template/core',
    '@ibiz-template/runtime',
    '@ibiz-template/vue3-util',
    '@ibiz-template/model-helper',
    '@ibiz-template/vue3-components',
    '@wangeditor/editor',
    '@wangeditor/editor-for-vue',
    '@imengyu/vue3-context-menu',
    '@ibiz-template-plugin/ai-chat',
    'monaco-editor',
  ],
});
