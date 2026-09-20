import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import libLegacy from '@qx-chitanda/vite-plugin-lib-legacy';
import dts from 'vite-plugin-dts';
import libCss from 'vite-plugin-libcss';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ['vue'],
  },
  build: {
    // sourcemap: true,
    lib: {
      entry: './src/index.ts',
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      external: [
        '@ibiz-template/core',
        '@ibiz-template/runtime',
        '@ibiz-template/theme',
        '@ibiz-template/vue3-util',
        '@ibiz/dynamic-model-api',
        'vue',
        'element-plus',
        'vuedraggable',
        'axios',
        'ramda',
        'lodash-es',
        'echarts',
        'dayjs',
      ],
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
    vue(),
    vueJsx(),
    libLegacy(),
    libCss(),
    dts({
      outDir: 'dist/types',
    }),
  ],
});
