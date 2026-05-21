import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import libLegacy from '@qx-chitanda/vite-plugin-lib-legacy';
import dts from 'vite-plugin-dts';
import eslint from 'vite-plugin-eslint';
import libCss from 'vite-plugin-libcss';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // sourcemap: true,
    lib: {
      entry: './src/index.ts',
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['cherry-markdown', 'interactjs', 'qx-util', 'lodash-es'],
    },
  },
  server: {
    port: 5174,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData:
          '@import "node_modules/@ibiz-template/scss-utils/style/global.scss";',
      },
    },
  },
  plugins: [
    eslint(),
    preact(),
    libLegacy(),
    libCss(),
    dts({
      outDir: 'dist/types',
    }),
  ],
});
