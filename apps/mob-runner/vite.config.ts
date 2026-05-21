import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import eslint from 'vite-plugin-eslint';
import legacy from '@vitejs/plugin-legacy';
// import { visualizer } from 'rollup-plugin-visualizer'; // 打包内容分析
import IBizVitePlugin from './vite-plugins/ibiz-vite-plugin';

/**
 * 判断是否为浏览器原生组件
 *
 * @author chitanda
 * @date 2023-07-05 09:07:39
 * @param {string} tag
 * @return {*}  {boolean}
 */
function isCustomElement(tag: string): boolean {
  return tag.startsWith('ion-');
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    entries: [
      '@ibiz-template-package/vs-tree-ex',
      '@ibiz-template/core',
      '@ibiz-template/mob-theme',
      '@ibiz-template/mob-vue3-components',
      '@ibiz-template/model-helper',
      '@ibiz-template/runtime',
      '@ibiz-template/theme',
      '@ibiz-template/vue3-util',
      '@ibiz-template/devtool',
      '@ibiz/model-core',
      '@ibiz-template-plugin/ibiz-mob-ai-chat',
      'async-validator',
      'dayjs',
      'echarts',
      'ionicons',
      'lodash-es',
      'pinia',
      'qs',
      'qx-util',
      'ramda',
      'interactjs',
      'vant',
      'vue',
      'vue-i18n',
      'vue3-hash-calendar',
      'vue-router',
      'vue-text-format',
      'vuedraggable',
    ],
  },
  build: {
    rollupOptions: {
      external: [
        'vant',
        'vue',
        'vue-router',
        'vue-i18n',
        'async-validator',
        'dayjs',
        'echarts',
        'axios',
        'qs',
        'ramda',
        'lodash-es',
        'qx-util',
        'interactjs',
        'pinia',
        'mqtt/dist/mqtt.min',
        'cherry-markdown',
        'quill',
        '@ibiz-template-package/vs-tree-ex',
        '@ibiz-template/core',
        '@ibiz-template/runtime',
        '@ibiz-template/vue3-util',
        '@ibiz-template/mob-theme',
        '@ibiz-template/model-helper',
        '@ibiz-template/mob-vue3-components',
        '@ibiz-template/devtool',
        '@ibiz-template-plugin/ibiz-mob-ai-chat',
        'vuedraggable',
      ],
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api/ibizplm__plmmob': {
        target: 'https://plm.ibizlab.cn',
        changeOrigin: true,
      },
    },
    cors: true,
    fs: {
      strict: false,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@ibiz-template/theme/style/global.scss";',
      },
    },
  },
  plugins: [
    eslint({
      include: 'src/**/*.{ts,tsx,js,jsx}',
    }),
    vue({
      template: {
        compilerOptions: {
          isCustomElement,
        },
      },
    }),
    vueJsx(),
    legacy({ externalSystemJS: true }),
    IBizVitePlugin(),
    // visualizer(),
  ],
});
